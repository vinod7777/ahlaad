<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once 'db_config.php';
$conn = getDB();

// Get all registrations with user details
$sql = "SELECT r.*, u.name as user_name, u.email as user_email, u.college, u.phone 
        FROM registrations r 
        JOIN users u ON r.user_id = u.id 
        ORDER BY r.registration_date DESC";
$res = $conn->query($sql);
$registrations = [];

while($row = $res->fetch_assoc()) {
    $reg_id = $row['id'];
    $mem_res = $conn->query("SELECT * FROM registration_members WHERE registration_id = $reg_id");
    $row['members'] = [];
    while($mem = $mem_res->fetch_assoc()) {
        $row['members'][] = $mem;
    }
    $registrations[] = $row;
}

// Get timeline
$timeline_res = $conn->query("SELECT * FROM events_timeline ORDER BY status DESC");
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
