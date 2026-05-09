<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require 'db_config.php';
$conn = getDB();

$action = $_GET['action'] ?? $_POST['action'] ?? 'get_details';
$pass_id = $_GET['pass_id'] ?? $_POST['pass_id'] ?? '';

if (empty($pass_id)) {
    echo json_encode(['success' => false, 'message' => 'Pass ID is required.']);
    exit();
}

$pass_id = $conn->real_escape_string(trim($pass_id));

if ($action === 'get_details') {
    // 1. Check if it's a team leader or individual pass in the `registrations` table
    $query = "SELECT r.*, u.name as u_name, u.email as u_email, u.phone as u_phone, u.college as u_college, u.college_id as u_cid 
              FROM registrations r 
              LEFT JOIN users u ON r.user_id = u.id 
              WHERE r.pass_id = '$pass_id' LIMIT 1";
    $res = $conn->query($query);
    
    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        
        // Retrieve team members if it's a team registration
        $members = [];
        if ($row['entry_type'] === 'team') {
            $reg_id = $row['id'];
            $m_res = $conn->query("SELECT * FROM registration_members WHERE registration_id = $reg_id");
            while ($m = $m_res->fetch_assoc()) {
                $members[] = [
                    'name' => $m['member_name'],
                    'email' => $m['email'],
                    'phone' => $m['phone'],
                    'college' => $m['college'],
                    'college_id' => $m['college_id'],
                    'pass_id' => $m['pass_id'],
                    'checked_in' => (int)$m['checked_in'],
                    'checked_in_at' => $m['checked_in_at']
                ];
            }
        }

        // Get other registered events for this user
        $other_events = [];
        $user_id = $row['user_id'];
        if ($user_id) {
            $o_res = $conn->query("SELECT competition, entry_type, status, pass_id FROM registrations WHERE user_id = $user_id AND pass_id != '$pass_id'");
            while ($o = $o_res->fetch_assoc()) {
                $other_events[] = $o;
            }
        }

        echo json_encode([
            'success' => true,
            'type' => 'leader_or_individual',
            'data' => [
                'name' => $row['participant_name'] ?: $row['u_name'],
                'email' => $row['email'] ?: $row['u_email'],
                'phone' => $row['phone'] ?: $row['u_phone'],
                'college' => $row['college'] ?: $row['u_college'],
                'college_id' => $row['college_id'] ?: $row['u_cid'],
                'competition' => $row['competition'],
                'entry_type' => $row['entry_type'],
                'team_name' => $row['team_name'],
                'fee' => $row['fee'],
                'status' => $row['status'],
                'pass_id' => $row['pass_id'],
                'checked_in' => (int)$row['checked_in'],
                'checked_in_at' => $row['checked_in_at'],
                'role' => $row['entry_type'] === 'team' ? 'TEAM LEADER' : 'INDIVIDUAL PARTICIPANT',
                'members' => $members,
                'other_events' => $other_events
            ]
        ]);
        exit();
    }

    // 2. Check if it's a team member pass in `registration_members`
    $query_member = "SELECT rm.*, r.competition, r.team_name, r.status as reg_status, r.fee 
                     FROM registration_members rm 
                     JOIN registrations r ON rm.registration_id = r.id 
                     WHERE rm.pass_id = '$pass_id' LIMIT 1";
    $res_m = $conn->query($query_member);
    
    if ($res_m && $res_m->num_rows > 0) {
        $row_m = $res_m->fetch_assoc();
        
        // Get other registered events for this person by email
        $other_events = [];
        $email = $row_m['email'];
        if ($email) {
            $email_esc = $conn->real_escape_string($email);
            $o_res = $conn->query("SELECT competition, entry_type, status, pass_id FROM registrations WHERE email = '$email_esc' AND pass_id != '$pass_id'");
            while ($o = $o_res->fetch_assoc()) {
                $other_events[] = $o;
            }
        }

        echo json_encode([
            'success' => true,
            'type' => 'team_member',
            'data' => [
                'name' => $row_m['member_name'],
                'email' => $row_m['email'],
                'phone' => $row_m['phone'],
                'college' => $row_m['college'],
                'college_id' => $row_m['college_id'],
                'competition' => $row_m['competition'],
                'tid' => $row_m['tid'],
                'entry_type' => 'team',
                'team_name' => $row_m['team_name'],
                'fee' => $row_m['fee'],
                'status' => $row_m['reg_status'],
                'pass_id' => $row_m['pass_id'],
                'checked_in' => (int)$row_m['checked_in'],
                'checked_in_at' => $row_m['checked_in_at'],
                'role' => 'TEAM MEMBER',
                'members' => [],
                'other_events' => $other_events
            ]
        ]);
        exit();
    }

    echo json_encode(['success' => false, 'message' => 'Invalid or Unrecognized Pass ID.']);
    exit();

} else if ($action === 'checkin') {
    // Perform check-in update
    
    // Check registrations first
    $check_reg = $conn->query("SELECT id FROM registrations WHERE pass_id = '$pass_id'");
    if ($check_reg && $check_reg->num_rows > 0) {
        $conn->query("UPDATE registrations SET checked_in = 1, checked_in_at = NOW() WHERE pass_id = '$pass_id'");
        echo json_encode(['success' => true, 'message' => 'Check-In recorded successfully!']);
        exit();
    }

    // Check registration_members
    $check_mem = $conn->query("SELECT id FROM registration_members WHERE pass_id = '$pass_id'");
    if ($check_mem && $check_mem->num_rows > 0) {
        $conn->query("UPDATE registration_members SET checked_in = 1, checked_in_at = NOW() WHERE pass_id = '$pass_id'");
        echo json_encode(['success' => true, 'message' => 'Member Check-In recorded successfully!']);
        exit();
    }

    echo json_encode(['success' => false, 'message' => 'Pass ID could not be found to update Check-In.']);
    exit();
}

$conn->close();
?>
