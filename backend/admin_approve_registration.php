<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once 'db_config.php';
$input = json_decode(file_get_contents('php://input'), true);

$registration_id = $input['registration_id'] ?? null;

if (!$registration_id) {
    echo json_encode(['success' => false, 'message' => 'Missing ID']);
    exit();
}

$conn = getDB();

// Update main registration status and generate pass_id for leader
$pass_id_leader = "PASS-L-" . strtoupper(bin2hex(random_bytes(4)));
$stmt = $conn->prepare("UPDATE registrations SET status = 'confirmed', pass_id = ? WHERE id = ?");
$stmt->bind_param("si", $pass_id_leader, $registration_id);

if ($stmt->execute()) {
    // Generate pass_id for all members
    $res = $conn->query("SELECT id FROM registration_members WHERE registration_id = $registration_id");
    while($row = $res->fetch_assoc()) {
        $pass_id_member = "PASS-M-" . strtoupper(bin2hex(random_bytes(4)));
        $conn->query("UPDATE registration_members SET pass_id = '$pass_id_member' WHERE id = " . $row['id']);
    }
    echo json_encode(['success' => true, 'message' => 'Registration approved and passes generated']);
} else {
    echo json_encode(['success' => false, 'message' => 'Approval failed']);
}

$conn->close();
?>
