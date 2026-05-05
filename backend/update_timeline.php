<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once 'db_config.php';
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id']) || !isset($input['status'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit();
}

$conn = getDB();
$stmt = $conn->prepare("UPDATE events_timeline SET status = ? WHERE id = ?");
$stmt->bind_param("si", $input['status'], $input['id']);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Timeline updated']);
} else {
    echo json_encode(['success' => false, 'message' => 'Update failed']);
}

$conn->close();
?>
