<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require 'db_config.php';
$conn = getDB();

$list = [];

// 1. Get confirmed/checked-in participants from registrations table (Leaders / Individuals)
$q1 = "SELECT r.id, r.tid, r.team_id, COALESCE(r.participant_name, u.name) as name, COALESCE(r.email, u.email) as email, 
              COALESCE(r.phone, u.phone) as phone, COALESCE(r.college, u.college) as college, 
              COALESCE(r.college_id, u.college_id) as college_id, r.competition, r.entry_type, 
              r.team_name, r.pass_id, r.checked_in, r.checked_in_at 
       FROM registrations r 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.status = 'confirmed'";

$res1 = $conn->query($q1);
if ($res1) {
    while ($row = $res1->fetch_assoc()) {
        $list[] = [
            'id' => (int)$row['id'],
            'registration_id' => (int)$row['id'],
            'tid' => $row['tid'] ?? '',
            'team_id' => $row['team_id'] ?? '',
            'name' => $row['name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'college' => $row['college'],
            'college_id' => $row['college_id'],
            'competition' => $row['competition'],
            'entry_type' => $row['entry_type'],
            'team_name' => $row['team_name'],
            'pass_id' => $row['pass_id'],
            'checked_in' => (int)$row['checked_in'],
            'checked_in_at' => $row['checked_in_at'],
            'role' => $row['entry_type'] === 'team' ? 'TEAM LEADER' : 'INDIVIDUAL'
        ];
    }
}

// 2. Get confirmed team members
$q2 = "SELECT rm.id, rm.member_name as name, rm.email, rm.phone, rm.college, rm.college_id, 
              r.id as registration_id, r.competition, r.team_name, rm.pass_id, rm.checked_in, rm.checked_in_at,
              COALESCE(rm.tid, r.tid) as tid, COALESCE(rm.team_id, r.team_id) as team_id
       FROM registration_members rm
       JOIN registrations r ON rm.registration_id = r.id
       WHERE r.status = 'confirmed'";

$res2 = $conn->query($q2);
if ($res2) {
    while ($row = $res2->fetch_assoc()) {
        $pass_id = $row['pass_id'];
        if (empty($pass_id)) {
            $pass_id = "PASS-M-" . strtoupper(bin2hex(random_bytes(4)));
            $conn->query("UPDATE registration_members SET pass_id = '$pass_id' WHERE id = " . $row['id']);
        }
        $list[] = [
            'id' => (int)$row['id'],
            'registration_id' => (int)$row['registration_id'],
            'tid' => $row['tid'] ?? '',
            'team_id' => $row['team_id'] ?? '',
            'name' => $row['name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'college' => $row['college'],
            'college_id' => $row['college_id'],
            'competition' => $row['competition'],
            'entry_type' => 'team',
            'team_name' => $row['team_name'],
            'pass_id' => $pass_id,
            'checked_in' => (int)$row['checked_in'],
            'checked_in_at' => $row['checked_in_at'],
            'role' => 'MEMBER'
        ];
    }
}

// Sort alphabetically by name
usort($list, function($a, $b) {
    return strcasecmp($a['name'] ?? '', $b['name'] ?? '');
});

echo json_encode([
    'success' => true,
    'data' => $list
]);

$conn->close();
?>
