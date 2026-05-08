<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once 'db_config.php';
$input = json_decode(file_get_contents('php://input'), true);

$registration_id = $input['registration_id'] ?? null;
$decline_reason = $input['decline_reason'] ?? '';

if (!$registration_id) {
    echo json_encode(['success' => false, 'message' => 'Missing ID']);
    exit();
}

$conn = getDB();

// Update main registration status to 'cancelled', store the decline reason, and clear any pass_id
$stmt = $conn->prepare("UPDATE registrations SET status = 'cancelled', decline_reason = ?, pass_id = NULL WHERE id = ?");
$stmt->bind_param("si", $decline_reason, $registration_id);

if ($stmt->execute()) {
    // Clear pass_id for all members of this registration since it is cancelled
    $conn->query("UPDATE registration_members SET pass_id = NULL WHERE registration_id = $registration_id");
    
    echo json_encode(['success' => true, 'message' => 'Registration successfully declined and reason recorded.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to decline registration: ' . $conn->error]);
}

$conn->close();
?>
