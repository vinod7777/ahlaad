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
$registration_id = $data['registration_id'] ?? '';
$new_status = $data['status'] ?? '';

if (empty($registration_id)) {
    echo json_encode(['success' => false, 'message' => 'Registration ID is missing.']);
    exit();
}
if (empty($new_status)) {
    echo json_encode(['success' => false, 'message' => 'New status is missing.']);
    exit();
}

// 1. Check if the registration exists and its current check-in status
$check_sql = "SELECT id, checked_in, status FROM registrations WHERE id = ?";
$stmt = $conn->prepare($check_sql);
$stmt->bind_param("i", $registration_id);
$stmt->execute();
$result = $stmt->get_result();
$reg = $result->fetch_assoc();

if (!$reg) {
    echo json_encode(['success' => false, 'message' => "Registration with ID $registration_id not found in database."]);
    exit();
}

if ($reg['checked_in'] == 1) {
    echo json_encode(['success' => false, 'message' => 'Cannot change status: Participant is already checked in.']);
    exit();
}

// 2. Update the status
$update_sql = "UPDATE registrations SET status = ? WHERE id = ?";
$stmt = $conn->prepare($update_sql);
$stmt->bind_param("si", $new_status, $registration_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Status updated successfully.']);
    } else {
        // If affected_rows is 0, it might be because the status was already set to the new value
        if ($reg['status'] === $new_status) {
             echo json_encode(['success' => true, 'message' => 'Status was already ' . $new_status]);
        } else {
             echo json_encode(['success' => false, 'message' => 'Status update failed or no changes made.']);
        }
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}

$conn->close();
?>
