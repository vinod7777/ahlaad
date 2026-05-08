<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once 'db_config.php';
$input = json_decode(file_get_contents('php://input'), true);

$registration_id = isset($input['registration_id']) ? (int)$input['registration_id'] : null;
$member_name = trim($input['member_name'] ?? '');
$email = trim($input['email'] ?? '');
$phone = trim($input['phone'] ?? '');
$college = trim($input['college'] ?? '');
$college_id = trim($input['college_id'] ?? '');
$bypass_limit = isset($input['bypass_limit']) ? (bool)$input['bypass_limit'] : false;

if (!$registration_id || empty($member_name) || empty($email) || empty($phone) || empty($college) || empty($college_id)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all member details']);
    exit();
}

// ------------------- HIGH-SECURITY VALIDATIONS -------------------
// 1. Name: letters and spaces only, >= 3 characters
if (strlen($member_name) < 3 || !preg_match('/^[A-Za-z\s]+$/', $member_name)) {
    echo json_encode(['success' => false, 'message' => 'Member Name must be at least 3 characters and contain only letters and spaces.']);
    exit();
}

// 2. Email format validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address format for member.']);
    exit();
}

// 3. Indian Phone number: 10 digits starting with 6,7,8 or 9
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
// -----------------------------------------------------------------

$conn = getDB();

// Check if team size limit exceeded (Vulnerability Fixed: cast registration_id above)
$res = $conn->query("SELECT team_size, tid, team_id, (SELECT COUNT(*) FROM registration_members WHERE registration_id = $registration_id) as current_count FROM registrations WHERE id = $registration_id");
$data = $res->fetch_assoc();

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Registration not found']);
    exit();
}

if (!$bypass_limit && $data['current_count'] >= ($data['team_size'] - 1)) { // -1 because team lead is implied or separate
    echo json_encode(['success' => false, 'message' => 'Team size limit reached']);
    exit();
}

$pass_id_member = "PASS-M-" . strtoupper(bin2hex(random_bytes(4)));
$stmt = $conn->prepare("INSERT INTO registration_members (registration_id, member_name, email, phone, college, college_id, pass_id, tid, team_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("issssssss", $registration_id, $member_name, $email, $phone, $college, $college_id, $pass_id_member, $data['tid'], $data['team_id']);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Member added']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add member: ' . $conn->error]);
}

$conn->close();
?>
