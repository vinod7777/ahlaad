<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once 'db_config.php';
$conn = getDB();

$result = $conn->query("SELECT * FROM events_timeline ORDER BY updated_at DESC");
$events = [];

while($row = $result->fetch_assoc()) {
    $events[] = $row;
}

echo json_encode(['success' => true, 'events' => $events]);
$conn->close();
?>
