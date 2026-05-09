<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once 'db_config.php';
$conn = getDB();

// 1. Summary Stats
// Approved Count (Confirmed registrations)
$approved_res = $conn->query("SELECT COUNT(*) as count FROM registrations WHERE status = 'confirmed'");
$approved_count = $approved_res->fetch_assoc()['count'];

// Total Participants (Leaders + Members from confirmed registrations)
$leader_count = $approved_count;
$member_res = $conn->query("SELECT COUNT(*) as count FROM registration_members rm JOIN registrations r ON rm.registration_id = r.id WHERE r.status = 'confirmed'");
$member_count = $member_res->fetch_assoc()['count'];
$total_participants = $leader_count + $member_count;

// Passes Generated
$passes_res = $conn->query("SELECT (SELECT COUNT(*) FROM registrations WHERE pass_id IS NOT NULL AND pass_id != '') + (SELECT COUNT(*) FROM registration_members WHERE pass_id IS NOT NULL AND pass_id != '') as count");
$passes_count = $passes_res->fetch_assoc()['count'];

// Checked In Count
$checkin_res = $conn->query("SELECT (SELECT COUNT(*) FROM registrations WHERE checked_in = 1) + (SELECT COUNT(*) FROM registration_members WHERE checked_in = 1) as count");
$checkin_count = $checkin_res->fetch_assoc()['count'];

// Teams In (Unique TIDs where anyone is checked in)
$teams_in_res = $conn->query("
    SELECT COUNT(DISTINCT tid) as count FROM (
        SELECT tid FROM registrations WHERE checked_in = 1
        UNION
        SELECT COALESCE(rm.tid, r.tid) as tid FROM registration_members rm JOIN registrations r ON rm.registration_id = r.id WHERE rm.checked_in = 1
    ) as tids
");
$teams_in_count = $teams_in_res->fetch_assoc()['count'];

// 2. Recent Activity (Top 9)
// We combine registrations and members checkins/signups if possible. 
// For now, let's take latest 9 registrations as the primary activity.
$recent_sql = "SELECT r.*, 
                CASE WHEN r.participant_name IS NULL OR r.participant_name = '' THEN u.name ELSE r.participant_name END as user_name,
                CASE WHEN r.email IS NULL OR r.email = '' THEN u.email ELSE r.email END as user_email
               FROM registrations r 
               LEFT JOIN users u ON r.user_id = u.id 
               ORDER BY r.registration_date DESC LIMIT 9";
$recent_res = $conn->query($recent_sql);
$recent_activity = [];
while($row = $recent_res->fetch_assoc()) {
    $recent_activity[] = $row;
}

// 3. Daily Trend (Last 14 days)
$trend_sql = "SELECT DATE(registration_date) as date, COUNT(*) as count FROM registrations GROUP BY DATE(registration_date) ORDER BY date DESC LIMIT 14";
$trend_res = $conn->query($trend_sql);
$daily_trend = [];
while($row = $trend_res->fetch_assoc()) {
    $daily_trend[] = $row;
}
$daily_trend = array_reverse($daily_trend);

// 4. Teams Report (All registrations with member count)
$teams_sql = "SELECT r.id, r.tid, r.team_name, r.competition, r.entry_type, r.status, r.checked_in, r.checked_in_at,
                     CASE WHEN r.participant_name IS NULL OR r.participant_name = '' THEN u.name ELSE r.participant_name END as leader_name,
                     (SELECT COUNT(*) FROM registration_members WHERE registration_id = r.id) as member_count
              FROM registrations r
              LEFT JOIN users u ON r.user_id = u.id
              ORDER BY r.registration_date DESC";
$teams_res = $conn->query($teams_sql);
$teams_list = [];
while($row = $teams_res->fetch_assoc()) {
    $teams_list[] = $row;
}

echo json_encode([
    'success' => true,
    'stats' => [
        'approved_count' => (int)$approved_count,
        'total_participants' => (int)$total_participants,
        'passes_count' => (int)$passes_count,
        'checkin_count' => (int)$checkin_count,
        'teams_in_count' => (int)$teams_in_count
    ],
    'recent_activity' => $recent_activity,
    'daily_trend' => $daily_trend,
    'teams_report' => $teams_list
]);

$conn->close();
?>
