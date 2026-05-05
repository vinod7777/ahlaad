<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once 'db_config.php';
$input = json_decode(file_get_contents('php://input'), true);

$registration_id = $input['registration_id'] ?? null;
$member_name = $input['member_name'] ?? '';

if (!$registration_id || !$member_name) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit();
}

$conn = getDB();

// Check if team size limit exceeded
$res = $conn->query("SELECT team_size, (SELECT COUNT(*) FROM registration_members WHERE registration_id = $registration_id) as current_count FROM registrations WHERE id = $registration_id");
$data = $res->fetch_assoc();

if ($data['current_count'] >= ($data['team_size'] - 1)) { // -1 because team lead is implied or separate
    echo json_encode(['success' => false, 'message' => 'Team size limit reached']);
    exit();
}

$stmt = $conn->prepare("INSERT INTO registration_members (registration_id, member_name) VALUES (?, ?)");
$stmt->bind_param("is", $registration_id, $member_name);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Member added']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add member']);
}

$conn->close();
?>
