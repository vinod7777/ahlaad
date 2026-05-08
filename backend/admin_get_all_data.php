<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once 'db_config.php';
$conn = getDB();

// Get all registrations with user details
$sql = "SELECT r.*, 
               CASE WHEN r.participant_name IS NULL OR r.participant_name = '' THEN u.name ELSE r.participant_name END as user_name, 
               CASE WHEN r.email IS NULL OR r.email = '' THEN u.email ELSE r.email END as user_email,
               CASE WHEN r.phone IS NULL OR r.phone = '' THEN u.phone ELSE r.phone END as phone,
               CASE WHEN r.college IS NULL OR r.college = '' THEN u.college ELSE r.college END as college,
               CASE WHEN r.college_id IS NULL OR r.college_id = '' THEN u.college_id ELSE r.college_id END as college_id
        FROM registrations r 
        LEFT JOIN users u ON r.user_id = u.id
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

// Get settings
$settings_res = $conn->query("SELECT * FROM settings WHERE setting_key = 'registration_enabled'");
$registration_enabled = true;
if ($s = $settings_res->fetch_assoc()) {
    $registration_enabled = $s['setting_value'] === '1';
}

echo json_encode([
    'success' => true,
    'registrations' => $registrations,
    'timeline' => $timeline,
    'settings' => [
        'registration_enabled' => $registration_enabled
    ]
]);

$conn->close();
?>
