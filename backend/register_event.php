<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once 'db_config.php';

// Since we are sending FormData, use $_POST and $_FILES
$user_id = $_POST['user_id'] ?? null;
$competition = trim($_POST['competition'] ?? '');
$entry_type = trim($_POST['entry_type'] ?? 'individual');
$team_name = isset($_POST['team_name']) ? trim($_POST['team_name']) : null;
$team_size = isset($_POST['team_size']) ? (int)$_POST['team_size'] : null;
$utr_id = trim($_POST['utr_id'] ?? '');
$registration_id = isset($_POST['registration_id']) ? (int)$_POST['registration_id'] : null;

if (!$user_id || !$competition) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit();
}

// Validate Entry Type
if ($entry_type !== 'individual' && $entry_type !== 'team') {
    echo json_encode(['success' => false, 'message' => 'Invalid entry type.']);
    exit();
}

// Validate Team Name and Team Size
if ($entry_type === 'team') {
    if (empty($team_name)) {
        echo json_encode(['success' => false, 'message' => 'Team Name is required for team entry.']);
        exit();
    }
    if ($team_size < 4 || $team_size > 12) {
        echo json_encode(['success' => false, 'message' => 'Team Size must be between 4 and 12.']);
        exit();
    }
} else {
    // If individual, automatically assign individual/solo team name or null
    $team_name = 'Individual';
    $team_size = 1;
}

// Validate UTR ID format (Exactly 12 numeric digits)
if (!preg_match('/^[0-9]{12}$/', $utr_id)) {
    echo json_encode(['success' => false, 'message' => 'UTR ID must be exactly 12 numeric digits.']);
    exit();
}

$conn = getDB();

// Validate UTR ID Uniqueness in database
if ($registration_id) {
    // Exclude current registration in update flow
    $utr_stmt = $conn->prepare("SELECT id FROM registrations WHERE utr_id = ? AND id != ?");
    $utr_stmt->bind_param("si", $utr_id, $registration_id);
} else {
    // Check all registrations in new flow
    $utr_stmt = $conn->prepare("SELECT id FROM registrations WHERE utr_id = ?");
    $utr_stmt->bind_param("s", $utr_id);
}
$utr_stmt->execute();
$utr_res = $utr_stmt->get_result();
if ($utr_res->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'This UTR ID has already been used for another registration. Transaction must be unique!']);
    $utr_stmt->close();
    $conn->close();
    exit();
}
$utr_stmt->close();

// Check if registration is enabled
$settings_res = $conn->query("SELECT * FROM settings WHERE setting_key = 'registration_enabled'");
if ($s = $settings_res->fetch_assoc()) {
    if ($s['setting_value'] !== '1') {
        echo json_encode(['success' => false, 'message' => 'Registration is currently closed.']);
        exit();
    }
}

// Handle File Upload if provided
$file_name = null;
if (isset($_FILES['payment_proof']) && $_FILES['payment_proof']['error'] === UPLOAD_ERR_OK) {
    $target_dir = "uploads/";
    $file_ext = pathinfo($_FILES["payment_proof"]["name"], PATHINFO_EXTENSION);
    $file_name = "pay_" . time() . "_" . $user_id . "." . $file_ext;
    $target_file = $target_dir . $file_name;

    if (!move_uploaded_file($_FILES["payment_proof"]["tmp_name"], $target_file)) {
        echo json_encode(['success' => false, 'message' => 'Failed to upload payment screenshot']);
        exit();
    }
}

// Fetch user details
$user_stmt = $conn->prepare("SELECT name, email, phone, college, college_id FROM users WHERE id = ?");
$user_stmt->bind_param("i", $user_id);
$user_stmt->execute();
$user_data = $user_stmt->get_result()->fetch_assoc();

if (!$user_data) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit();
}

$fee = ($entry_type === 'team') ? 500.00 : 200.00;

if ($registration_id) {
    // UPDATE/RESUBMIT FLOW
    // Verify ownership
    $verify_stmt = $conn->prepare("SELECT id, payment_proof, team_id FROM registrations WHERE id = ? AND user_id = ?");
    $verify_stmt->bind_param("ii", $registration_id, $user_id);
    $verify_stmt->execute();
    $existing_reg = $verify_stmt->get_result()->fetch_assoc();
    if (!$existing_reg) {
         echo json_encode(['success' => false, 'message' => 'Registration not found or unauthorized']);
         exit();
    }

    $final_file_name = $file_name ? $file_name : $existing_reg['payment_proof'];
    
    // If it's a team registration and doesn't have a team_id yet, generate one
    $team_id = $existing_reg['team_id'];
    if ($entry_type === 'team' && !$team_id) {
        $clean_clg = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $user_data['college']));
        if (strlen($clean_clg) < 4) {
            $clean_clg = str_pad($clean_clg, 4, 'X');
        } else {
            $clean_clg = substr($clean_clg, 0, 4);
        }
        
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $random_part = '';
        for ($i = 0; $i < 5; $i++) {
            $random_part .= $chars[rand(0, strlen($chars) - 1)];
        }
        $team_id = $clean_clg . '-' . $random_part;
    } elseif ($entry_type !== 'team') {
        $team_id = null;
    }
    
    // We update fields and reset status back to pending, clearing decline_reason
    $update_stmt = $conn->prepare("UPDATE registrations SET team_name = ?, team_size = ?, utr_id = ?, payment_proof = ?, team_id = ?, status = 'pending', decline_reason = NULL WHERE id = ?");
    $update_stmt->bind_param("sisssi", $team_name, $team_size, $utr_id, $final_file_name, $team_id, $registration_id);
    
    if ($update_stmt->execute()) {
        // Also update team_id in registration_members if applicable
        if ($team_id) {
            $member_update = $conn->prepare("UPDATE registration_members SET team_id = ? WHERE registration_id = ?");
            $member_update->bind_param("si", $team_id, $registration_id);
            $member_update->execute();
        }
        echo json_encode(['success' => true, 'message' => 'Registration updated and resubmitted successfully! Wait for admin approval.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Update failed: ' . $conn->error]);
    }
} else {
    // NEW REGISTRATION FLOW
    if (!$utr_id || !$file_name) {
        echo json_encode(['success' => false, 'message' => 'Missing UTR ID or payment proof screenshot']);
        exit();
    }

    // Check if already registered
    $check = $conn->prepare("SELECT id FROM registrations WHERE user_id = ? AND competition = ?");
    $check->bind_param("is", $user_id, $competition);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Already registered for this event']);
        exit();
    }

    // Generate unique TID for this registration
    $secretKey = bin2hex(random_bytes(16)); 
    $tid = $secretKey . substr($team_name ?? '', 0, 3) . substr($user_data['college'] ?? '', 0, 3);

    // Generate a common team_id for the team lead and members if entry_type is team
    $team_id = null;
    if ($entry_type === 'team') {
        $clean_clg = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $user_data['college']));
        if (strlen($clean_clg) < 4) {
            $clean_clg = str_pad($clean_clg, 4, 'X');
        } else {
            $clean_clg = substr($clean_clg, 0, 4);
        }
        
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $random_part = '';
        for ($i = 0; $i < 5; $i++) {
            $random_part .= $chars[rand(0, strlen($chars) - 1)];
        }
        $team_id = $clean_clg . '-' . $random_part;
    }

    $stmt = $conn->prepare("INSERT INTO registrations (user_id, participant_name, email, phone, college, college_id, competition, entry_type, team_name, team_size, fee, utr_id, payment_proof, tid, team_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssssssidssss", $user_id, $user_data['name'], $user_data['email'], $user_data['phone'], $user_data['college'], $user_data['college_id'], $competition, $entry_type, $team_name, $team_size, $fee, $utr_id, $file_name, $tid, $team_id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Registration successful! Wait for admin approval.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $conn->error]);
    }
}

$conn->close();
?>
