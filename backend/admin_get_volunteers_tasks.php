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

$volunteers = [];

// Fetch all volunteers
$res = $conn->query("SELECT id, name, email, phone, college, college_id FROM users WHERE role = 'volunteer'");
while ($row = $res->fetch_assoc()) {
    $row['tasks'] = [];
    $volunteers[$row['id']] = $row;
}

// Fetch their tasks
$tasks_res = $conn->query("SELECT id, volunteer_id, task_description, status, assigned_at FROM volunteer_tasks ORDER BY assigned_at DESC");
while ($task = $tasks_res->fetch_assoc()) {
    $vid = $task['volunteer_id'];
    if (isset($volunteers[$vid])) {
        $volunteers[$vid]['tasks'][] = $task;
    }
}

echo json_encode([
    'success' => true,
    'volunteers' => array_values($volunteers)
]);

$conn->close();
?>
