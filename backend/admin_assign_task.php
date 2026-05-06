<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);
$volunteer_id = $input['volunteer_id'] ?? null;
$task_description = $input['task_description'] ?? '';

if (!$volunteer_id || !$task_description) {
    echo json_encode(['success' => false, 'message' => 'Volunteer ID and Task description are required']);
    exit();
}

$conn = getDB();

$stmt = $conn->prepare("INSERT INTO volunteer_tasks (volunteer_id, task_description) VALUES (?, ?)");
$stmt->bind_param("is", $volunteer_id, $task_description);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Task assigned successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to assign task']);
}

$stmt->close();
$conn->close();
?>
