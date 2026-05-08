<?php
/**
 * Ahlaad 2026 — Registration API
 * POST endpoint for React frontend
 * Enforces: unique team names, unique email+competition, input validation
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_config.php';

// Only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed.']);
    exit();
}

$conn = getDB();

// Check if registration is enabled
$settings_res = $conn->query("SELECT * FROM settings WHERE setting_key = 'registration_enabled'");
if ($s = $settings_res->fetch_assoc()) {
    if ($s['setting_value'] !== '1') {
        echo json_encode(['success' => false, 'message' => 'Registration is currently closed.']);
        exit();
    }
}

// Parse JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input.']);
    exit();
}

// ── Validate required fields ──
$required = ['participant_name', 'email', 'phone', 'college', 'college_id', 'competition'];
foreach ($required as $field) {
    if (empty(trim($input[$field] ?? ''))) {
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit();
    }
}

// ── Sanitize ──
$name        = trim($input['participant_name']);
$email       = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
$phone       = preg_replace('/[^0-9+\- ]/', '', trim($input['phone']));
$college     = trim($input['college']);
$college_id  = trim($input['college_id']);
$competition = trim($input['competition']);
$team_name   = trim($input['team_name'] ?? '');
$team_size   = intval($input['team_size'] ?? 0);
$secretKey = bin2hex(random_bytes(16)); 
$tid = $secretKey.substr($team_name, 0, 3).substr($college, 0, 3);

// ── Validate email ──
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit();
}

// ── Validate phone (10+ digits) ──
$phone_digits = preg_replace('/[^0-9]/', '', $phone);
if (strlen($phone_digits) < 10) {
    echo json_encode(['success' => false, 'message' => 'Phone number must have at least 10 digits.']);
    exit();
}

// ── Validate competition ──
$valid_competitions = [
    'Short Films', 'Rock Band', 'Photography', 'Singing', 'Cover Song',
    'Dance — Classical Solo', 'Dance — Classical Group',
    'Dance — Western Solo', 'Dance — Western Group',
    'Drama / Skit', 'Painting', 'Handicrafts'
];

if (!in_array($competition, $valid_competitions)) {
    echo json_encode(['success' => false, 'message' => 'Invalid competition selected.']);
    exit();
}

// ── Determine fee & entry type ──
$team_events = ['Short Films', 'Rock Band', 'Dance — Classical Group', 'Dance — Western Group', 'Drama / Skit'];
$is_team = in_array($competition, $team_events);
$fee = $is_team ? 500.00 : 200.00;
$entry_type = $is_team ? 'team' : 'individual';

// ── Validate team fields ──
if ($is_team) {
    if (empty($team_name)) {
        echo json_encode(['success' => false, 'message' => 'Team name is required for team events.']);
        exit();
    }
    if (strlen($team_name) < 2) {
        echo json_encode(['success' => false, 'message' => 'Team name must be at least 2 characters.']);
        exit();
    }
    if ($team_size < 2) {
        echo json_encode(['success' => false, 'message' => 'Team size must be at least 2 members.']);
        exit();
    }
    if ($team_size > 20) {
        echo json_encode(['success' => false, 'message' => 'Team size cannot exceed 20 members.']);
        exit();
    }
} else {
    // Individual event — no team name
    $team_name = null;
    $team_size = null;
}

// ── Check duplicate: same email + same competition ──
$check = $conn->prepare("SELECT id FROM registrations WHERE email = ? AND competition = ?");
$check->bind_param("ss", $email, $competition);
$check->execute();
if ($check->get_result()->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'You have already registered for this competition with this email.']);
    $check->close();
    $conn->close();
    exit();
}
$check->close();

// ── Check duplicate: same college_id + same competition ──
$check2 = $conn->prepare("SELECT id FROM registrations WHERE college_id = ? AND competition = ?");
$check2->bind_param("ss", $college_id, $competition);
$check2->execute();
if ($check2->get_result()->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'This college ID is already registered for this competition.']);
    $check2->close();
    $conn->close();
    exit();
}
$check2->close();

// ── Check unique team name (globally) ──
if ($is_team && $team_name) {
    $check3 = $conn->prepare("SELECT id, competition FROM registrations WHERE team_name = ?");
    $check3->bind_param("s", $team_name);
    $check3->execute();
    $result3 = $check3->get_result();
    if ($result3->num_rows > 0) {
        $existing = $result3->fetch_assoc();
        echo json_encode([
            'success' => false,
            'message' => "Team name \"{$team_name}\" is already taken (registered in {$existing['competition']}). Please choose a unique team name."
        ]);
        $check3->close();
        $conn->close();
        exit();
    }
    $check3->close();
}

// ── Insert registration ──
$stmt = $conn->prepare("
    INSERT INTO registrations 
    (participant_name, email, phone, college, college_id, competition, entry_type, team_name, team_size, fee,tid)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
");

$stmt->bind_param(
    "ssssssssids",
    $name, $email, $phone, $college, $college_id,
    $competition, $entry_type, $team_name, $team_size, $fee,$tid
);

if ($stmt->execute()) {
    $reg_id = $stmt->insert_id;
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful!',
        'data' => [
            'registration_id' => $reg_id,
            'participant_name' => $name,
            'email' => $email,
            'competition' => $competition,
            'entry_type' => $entry_type,
            'team_name' => $team_name,
            'fee' => $fee,
            'tid' => $tid
        ]
    ]);
} else {
    // Handle MySQL unique constraint violation
    if ($conn->errno === 1062) {
        echo json_encode(['success' => false, 'message' => 'Duplicate entry detected. This email, college ID, or team name is already registered.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $stmt->error]);
    }
}

$stmt->close();
$conn->close();
?>
