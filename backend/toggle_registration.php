<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_config.php';

$data = json_decode(file_get_contents("php://input"));
if (!isset($data->enabled)) {
    echo json_encode(['success' => false, 'message' => 'Missing status.']);
    exit;
}

$conn = getDB();
$enabled = $data->enabled ? '1' : '0';

$stmt = $conn->prepare("UPDATE settings SET setting_value = ? WHERE setting_key = 'registration_enabled'");
$stmt->bind_param("s", $enabled);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update setting.']);
}

$stmt->close();
$conn->close();
?>
