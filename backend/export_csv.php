<?php
/**
 * Ahlaad 2026 — Export Registrations to CSV
 */

require_once 'db_config.php';

$conn = getDB();

$result = $conn->query("
    SELECT id, participant_name, email, phone, college, college_id, 
           competition, entry_type, team_name, team_size, fee, status, registration_date
    FROM registrations 
    ORDER BY registration_date DESC
");

// Set headers for CSV download
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="ahlaad_2026_registrations_' . date('Y-m-d') . '.csv"');

$output = fopen('php://output', 'w');

// Header row
fputcsv($output, [
    'ID', 'Participant Name', 'Email', 'Phone', 'College', 'College ID',
    'Competition', 'Entry Type', 'Team Name', 'Team Size', 'Fee (₹)', 'Status', 'Registration Date'
]);

// Data rows
while ($row = $result->fetch_assoc()) {
    fputcsv($output, $row);
}

fclose($output);
$conn->close();
?>
