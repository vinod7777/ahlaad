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
$task_id = isset($input['task_id']) ? (int)$input['task_id'] : null;
$status = trim($input['status'] ?? '');

if (!$task_id || !in_array($status, ['pending', 'completed'])) {
    echo json_encode(['success' => false, 'message' => 'Valid Task ID and status (pending/completed) are required']);
    exit();
}

$conn = getDB();

$stmt = $conn->prepare("UPDATE volunteer_tasks SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $task_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Task status updated']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update task']);
}

$stmt->close();
$conn->close();
?>
