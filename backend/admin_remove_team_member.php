<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once 'db_config.php';
$input = json_decode(file_get_contents('php://input'), true);

$member_id = isset($input['member_id']) ? (int)$input['member_id'] : null;

if (!$member_id) {
    echo json_encode(['success' => false, 'message' => 'Missing member ID']);
    exit();
}

$conn = getDB();

$stmt = $conn->prepare("DELETE FROM registration_members WHERE id = ?");
$stmt->bind_param("i", $member_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Team member removed successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to remove team member: ' . $conn->error]);
}

$conn->close();
?>
