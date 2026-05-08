<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$phone = trim($input['phone'] ?? '');
$college = trim($input['college'] ?? '');
$college_id = trim($input['college_id'] ?? '');

if (empty($name) || empty($email) || empty($password) || empty($phone) || empty($college) || empty($college_id)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit();
}

// ------------------- HIGH-SECURITY VALIDATIONS -------------------
// 1. Full Name: Alphabetical and spaces only, >= 3 characters
if (strlen($name) < 3 || !preg_match('/^[A-Za-z\s]+$/', $name)) {
    echo json_encode(['success' => false, 'message' => 'Full Name must be at least 3 characters and contain only letters and spaces.']);
    exit();
}

// 2. Email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Please provide a valid email address.']);
    exit();
}

// 3. Indian Phone number validation: 10 digits starting with 6,7,8 or 9
if (!preg_match('/^[6-9][0-9]{9}$/', $phone)) {
    echo json_encode(['success' => false, 'message' => 'Phone Number must be a valid 10-digit Indian mobile number.']);
    exit();
}

// 4. College Name: >= 3 characters
if (strlen($college) < 3) {
    echo json_encode(['success' => false, 'message' => 'College Name must be at least 3 characters.']);
    exit();
}

// 5. College ID: >= 2 characters
if (strlen($college_id) < 2) {
    echo json_encode(['success' => false, 'message' => 'College ID must be at least 2 characters.']);
    exit();
}

// 6. Password: >= 6 characters
if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit();
}
// -----------------------------------------------------------------

$conn = getDB();

// Check if user exists
$check = $conn->prepare("SELECT id FROM users WHERE email = ? OR college_id = ?");
$check->bind_param("ss", $email, $college_id);
$check->execute();
if ($check->get_result()->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email or College ID already registered']);
    exit();
}

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (name, email, password, phone, college, college_id) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $name, $email, $hashed_password, $phone, $college, $college_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Registration successful! You can now log in.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $conn->error]);
}

$conn->close();
?>
