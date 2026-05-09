<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

function runQuery($conn, $sql) {
    $res = $conn->query($sql);
    if ($res === false) {
        throw new Exception("Query failed: " . $conn->error . " | SQL: " . $sql);
    }
    return $res;
}

try {
    require_once 'db_config.php';
    $conn = getDB();
    if (!$conn) {
        throw new Exception("Failed to connect to database.");
    }

    // 1. Summary Stats
    // Approved Count (Confirmed registrations)
    $approved_res = runQuery($conn, "SELECT COUNT(*) as count FROM registrations WHERE status = 'confirmed'");
    $approved_count = $approved_res->fetch_assoc()['count'];

    // Total Participants (Leaders + Members from confirmed registrations)
    $leader_count = $approved_count;
    $member_res = runQuery($conn, "SELECT COUNT(*) as count FROM registration_members rm JOIN registrations r ON rm.registration_id = r.id WHERE r.status = 'confirmed'");
    $member_count = $member_res->fetch_assoc()['count'];
    $total_participants = $leader_count + $member_count;

    // Passes Generated
    $passes_res = runQuery($conn, "SELECT (SELECT COUNT(*) FROM registrations WHERE pass_id IS NOT NULL AND pass_id != '') + (SELECT COUNT(*) FROM registration_members WHERE pass_id IS NOT NULL AND pass_id != '') as count");
    $passes_count = $passes_res->fetch_assoc()['count'];

    // Checked In Count
    $checkin_res = runQuery($conn, "SELECT (SELECT COUNT(*) FROM registrations WHERE checked_in = 1) + (SELECT COUNT(*) FROM registration_members WHERE checked_in = 1) as count");
    $checkin_count = $checkin_res->fetch_assoc()['count'];

    // Teams In (Unique TIDs where anyone is checked in)
    $tids = [];
    $res1 = runQuery($conn, "SELECT DISTINCT tid FROM registrations WHERE checked_in = 1 AND tid IS NOT NULL AND tid != ''");
    while ($row = $res1->fetch_assoc()) {
        $tids[$row['tid']] = true;
    }
    $res2 = runQuery($conn, "SELECT DISTINCT COALESCE(rm.tid, r.tid) as tid FROM registration_members rm JOIN registrations r ON rm.registration_id = r.id WHERE rm.checked_in = 1");
    while ($row = $res2->fetch_assoc()) {
        if ($row['tid'] !== null && $row['tid'] !== '') {
            $tids[$row['tid']] = true;
        }
    }
    $teams_in_count = count($tids);

    // 2. Recent Activity (Top 9)
    $recent_sql = "SELECT r.*, 
                    CASE WHEN r.participant_name IS NULL OR r.participant_name = '' THEN u.name ELSE r.participant_name END as user_name,
                    CASE WHEN r.email IS NULL OR r.email = '' THEN u.email ELSE r.email END as user_email
                   FROM registrations r 
                   LEFT JOIN users u ON r.user_id = u.id 
                   ORDER BY r.registration_date DESC LIMIT 9";
    $recent_res = runQuery($conn, $recent_sql);
    $recent_activity = [];
    while($row = $recent_res->fetch_assoc()) {
        $recent_activity[] = $row;
    }

    // 3. Daily Trend (Last 14 days)
    $trend_sql = "SELECT DATE(registration_date) as date, COUNT(*) as count FROM registrations GROUP BY DATE(registration_date) ORDER BY date DESC LIMIT 14";
    $trend_res = runQuery($conn, $trend_sql);
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
    $teams_res = runQuery($conn, $teams_sql);
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

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'PHP Error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
