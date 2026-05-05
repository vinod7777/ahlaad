<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once 'db_config.php';
$input = json_decode(file_get_contents('php://input'), true);

$user_id = $input['user_id'] ?? null;
$competition = $input['competition'] ?? '';
$entry_type = $input['entry_type'] ?? 'individual';
$team_name = $input['team_name'] ?? null;
$team_size = $input['team_size'] ?? null;

if (!$user_id || !$competition) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit();
}

$conn = getDB();

// Check if already registered
$check = $conn->prepare("SELECT id FROM registrations WHERE user_id = ? AND competition = ?");
$check->bind_param("is", $user_id, $competition);
$check->execute();
if ($check->get_result()->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Already registered for this event']);
    exit();
}

$fee = ($entry_type === 'team') ? 500.00 : 200.00;

$stmt = $conn->prepare("INSERT INTO registrations (user_id, competition, entry_type, team_name, team_size, fee) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("isssid", $user_id, $competition, $entry_type, $team_name, $team_size, $fee);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Registration successful! Wait for admin approval.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed']);
}

$conn->close();
?>
