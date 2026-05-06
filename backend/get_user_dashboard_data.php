<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once 'db_config.php';
$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'Missing user ID']);
    exit();
}

$conn = getDB();

// Get registrations
$reg_res = $conn->query("SELECT * FROM registrations WHERE user_id = $user_id");
$registrations = [];

while($reg = $reg_res->fetch_assoc()) {
    $reg_id = $reg['id'];
    $mem_res = $conn->query("SELECT * FROM registration_members WHERE registration_id = $reg_id");
    $reg['members'] = [];
    while($mem = $mem_res->fetch_assoc()) {
        if (empty($mem['pass_id'])) {
            $pass_id_member = "PASS-M-" . strtoupper(bin2hex(random_bytes(4)));
            $conn->query("UPDATE registration_members SET pass_id = '$pass_id_member' WHERE id = " . $mem['id']);
            $mem['pass_id'] = $pass_id_member;
        }
        $reg['members'][] = $mem;
    }
    $registrations[] = $reg;
}

// Get timeline
$timeline_res = $conn->query("SELECT * FROM events_timeline ORDER BY updated_at DESC");
$timeline = [];
while($t = $timeline_res->fetch_assoc()) {
    $timeline[] = $t;
}

echo json_encode([
    'success' => true, 
    'registrations' => $registrations,
    'timeline' => $timeline
]);

$conn->close();
?>
