<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require 'db_config.php';
$conn = getDB();

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? '';
$role = $data['role'] ?? ''; // 'TEAM LEADER', 'INDIVIDUAL', or 'MEMBER'

if (empty($id) || empty($role)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit();
}

if ($role === 'MEMBER') {
    // Update registration_members table
    $sql = "UPDATE registration_members SET checked_in = 0, checked_in_at = NULL WHERE id = ?";
} else {
    // Update registrations table (Leader or Individual)
    $sql = "UPDATE registrations SET checked_in = 0, checked_in_at = NULL WHERE id = ?";
}

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Check-in reverted successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to revert check-in: ' . $conn->error]);
}

$conn->close();
?>
