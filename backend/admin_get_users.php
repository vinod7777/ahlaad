<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require 'db_config.php';
$conn = getDB();

$stmt = $conn->prepare("SELECT id, name, email, phone, college, college_id, role, created_at FROM users ORDER BY created_at DESC");
$stmt->execute();
$result = $stmt->get_result();
$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode([
    'success' => true,
    'users' => $users
]);
$stmt->close();
$conn->close();
?>
