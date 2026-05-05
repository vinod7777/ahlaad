<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once 'db_config.php';

// Since we are sending FormData, use $_POST and $_FILES
$user_id = $_POST['user_id'] ?? null;
$competition = $_POST['competition'] ?? '';
$entry_type = $_POST['entry_type'] ?? 'individual';
$team_name = $_POST['team_name'] ?? null;
$team_size = $_POST['team_size'] ?? null;
$utr_id = $_POST['utr_id'] ?? '';

if (!$user_id || !$competition || !$utr_id || !isset($_FILES['payment_proof'])) {
    echo json_encode(['success' => false, 'message' => 'Missing fields or payment proof screenshot']);
    exit();
}

$conn = getDB();

// Check if registration is enabled
$settings_res = $conn->query("SELECT * FROM settings WHERE setting_key = 'registration_enabled'");
if ($s = $settings_res->fetch_assoc()) {
    if ($s['setting_value'] !== '1') {
        echo json_encode(['success' => false, 'message' => 'Registration is currently closed.']);
        exit();
    }
}

// Handle File Upload
$target_dir = "uploads/";
$file_ext = pathinfo($_FILES["payment_proof"]["name"], PATHINFO_EXTENSION);
$file_name = "pay_" . time() . "_" . $user_id . "." . $file_ext;
$target_file = $target_dir . $file_name;

if (!move_uploaded_file($_FILES["payment_proof"]["tmp_name"], $target_file)) {
    echo json_encode(['success' => false, 'message' => 'Failed to upload payment screenshot']);
    exit();
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

// Check if already registered
$check = $conn->prepare("SELECT id FROM registrations WHERE user_id = ? AND competition = ?");
$check->bind_param("is", $user_id, $competition);
$check->execute();
if ($check->get_result()->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Already registered for this event']);
    exit();
}

$fee = ($entry_type === 'team') ? 500.00 : 200.00;

$stmt = $conn->prepare("INSERT INTO registrations (user_id, participant_name, email, phone, college, college_id, competition, entry_type, team_name, team_size, fee, utr_id, payment_proof) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("isssssssidsss", $user_id, $user_data['name'], $user_data['email'], $user_data['phone'], $user_data['college'], $user_data['college_id'], $competition, $entry_type, $team_name, $team_size, $fee, $utr_id, $file_name);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Registration successful! Wait for admin approval.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $conn->error]);
}

$conn->close();
?>
