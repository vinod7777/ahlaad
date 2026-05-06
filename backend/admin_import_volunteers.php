<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require 'db_config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['volunteers']) || !is_array($input['volunteers'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid data format. Expected an array of volunteers.']);
    exit();
}

$volunteers = $input['volunteers'];
$conn = getDB();

$imported_count = 0;
$skipped_count = 0;

$stmt = $conn->prepare("INSERT INTO users (name, email, password, phone, college, college_id, role) VALUES (?, ?, ?, ?, ?, ?, 'volunteer')");

foreach ($volunteers as $v) {
    $name = $v['name'] ?? '';
    $email = $v['email'] ?? '';
    $phone = $v['phone'] ?? '';
    $college = $v['college'] ?? '';
    $college_id = $v['college_id'] ?? '';
    
    if (empty($name) || empty($email)) {
        $skipped_count++;
        continue;
    }

    // Default password for imported volunteers: volunteer123
    $password = password_hash('volunteer123', PASSWORD_DEFAULT);

    // Check if user already exists
    $check = $conn->query("SELECT id FROM users WHERE email = '$email'");
    if ($check->num_rows > 0) {
        // If exists, just update role to volunteer
        $conn->query("UPDATE users SET role = 'volunteer' WHERE email = '$email'");
        $imported_count++;
    } else {
        // Insert new user
        $stmt->bind_param("ssssss", $name, $email, $password, $phone, $college, $college_id);
        if ($stmt->execute()) {
            $imported_count++;
        } else {
            $skipped_count++;
        }
    }
}

echo json_encode([
    'success' => true, 
    'message' => "Import complete. $imported_count volunteers added/updated. $skipped_count skipped.",
    'imported' => $imported_count
]);

$stmt->close();
$conn->close();
?>
