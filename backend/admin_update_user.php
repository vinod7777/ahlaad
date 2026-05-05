<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db_config.php';
$conn = getDB();

$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

$id = $data['id'];
$name = $data['name'] ?? null;
$email = $data['email'] ?? null;
$phone = $data['phone'] ?? null;
$college = $data['college'] ?? null;
$college_id = $data['college_id'] ?? null;
$role = $data['role'] ?? null;
$password = (!empty($data['password'])) ? password_hash($data['password'], PASSWORD_DEFAULT) : null;

$query = "UPDATE users SET ";
$params = [];
$types = "";

if ($name !== null) { $query .= "name=?, "; $params[] = $name; $types .= "s"; }
if ($email !== null) { $query .= "email=?, "; $params[] = $email; $types .= "s"; }
if ($phone !== null) { $query .= "phone=?, "; $params[] = $phone; $types .= "s"; }
if ($college !== null) { $query .= "college=?, "; $params[] = $college; $types .= "s"; }
if ($college_id !== null) { $query .= "college_id=?, "; $params[] = $college_id; $types .= "s"; }
if ($role !== null) { $query .= "role=?, "; $params[] = $role; $types .= "s"; }
if ($password !== null) { $query .= "password=?, "; $params[] = $password; $types .= "s"; }

// Remove trailing comma and space
$query = rtrim($query, ", ");
$query .= " WHERE id=?";
$params[] = $id;
$types .= "i";

$stmt = $conn->prepare($query);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'User updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Update failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
