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

$id = (int)$data['id'];
$name = isset($data['name']) ? trim($data['name']) : null;
$email = isset($data['email']) ? trim($data['email']) : null;
$phone = isset($data['phone']) ? trim($data['phone']) : null;
$college = isset($data['college']) ? trim($data['college']) : null;
$college_id = isset($data['college_id']) ? trim($data['college_id']) : null;
$role = isset($data['role']) ? trim($data['role']) : null;
$password_plain = !empty($data['password']) ? $data['password'] : null;
$password = ($password_plain !== null) ? password_hash($password_plain, PASSWORD_DEFAULT) : null;

// ------------------- HIGH-SECURITY VALIDATIONS -------------------
if ($name !== null) {
    if (strlen($name) < 3 || !preg_match('/^[A-Za-z\s]+$/', $name)) {
        echo json_encode(['success' => false, 'message' => 'Full Name must be at least 3 characters and contain only letters and spaces.']);
        exit;
    }
}
if ($email !== null) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address format.']);
        exit;
    }
}
if ($phone !== null) {
    if (!preg_match('/^[6-9][0-9]{9}$/', $phone)) {
        echo json_encode(['success' => false, 'message' => 'Phone Number must be a valid 10-digit Indian mobile number.']);
        exit;
    }
}
if ($college !== null) {
    if (strlen($college) < 3) {
        echo json_encode(['success' => false, 'message' => 'College Name must be at least 3 characters.']);
        exit;
    }
}
if ($college_id !== null) {
    if (strlen($college_id) < 2) {
        echo json_encode(['success' => false, 'message' => 'College ID must be at least 2 characters.']);
        exit;
    }
}
if ($role !== null) {
    if (!in_array($role, ['participant', 'admin', 'volunteer'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid user role selected.']);
        exit;
    }
}
if ($password_plain !== null) {
    if (strlen($password_plain) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
        exit;
    }
}
// -----------------------------------------------------------------

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
