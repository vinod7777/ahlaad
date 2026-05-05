<?php
/**
 * Ahlaad 2026 — View All Registrations
 * Admin panel to view all registered participants
 */

require_once 'db_config.php';

$conn = getDB();

// Get filter
$filter = $_GET['competition'] ?? '';
$status_filter = $_GET['status'] ?? '';

// Build query
$sql = "SELECT * FROM registrations WHERE 1=1";
$params = [];
$types = '';

if ($filter) {
    $sql .= " AND competition = ?";
    $params[] = $filter;
    $types .= 's';
}

if ($status_filter) {
    $sql .= " AND status = ?";
    $params[] = $status_filter;
    $types .= 's';
}

$sql .= " ORDER BY registration_date DESC";

$stmt = $conn->prepare($sql);

if ($types) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

// Get competition stats
$stats = $conn->query("
    SELECT competition, entry_type, COUNT(*) as count, SUM(fee) as total_fee 
    FROM registrations 
    GROUP BY competition, entry_type 
    ORDER BY count DESC
");

$totalRegistrations = $conn->query("SELECT COUNT(*) as total FROM registrations")->fetch_assoc()['total'];
$totalFees = $conn->query("SELECT SUM(fee) as total FROM registrations")->fetch_assoc()['total'] ?? 0;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ahlaad 2026 — Registration Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            background: #080614;
            color: #fff;
            min-height: 100vh;
            padding: 2rem;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #C9A84C40;
        }
        h1 {
            font-size: 2rem;
            color: #C9A84C;
        }
        .subtitle { color: #fff8; font-size: 0.9rem; }
        .stats {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid #C9A84C30;
            border-radius: 12px;
            padding: 1.5rem;
            flex: 1;
            min-width: 200px;
        }
        .stat-card .label { color: #C9A84C; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; }
        .stat-card .value { font-size: 2rem; font-weight: bold; margin-top: 0.5rem; }
        .filters {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }
        select {
            background: rgba(255,255,255,0.05);
            color: #fff;
            border: 1px solid #fff3;
            padding: 0.6rem 1rem;
            border-radius: 8px;
            cursor: pointer;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: rgba(255,255,255,0.02);
            border-radius: 12px;
            overflow: hidden;
        }
        th {
            background: #C9A84C15;
            color: #C9A84C;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 1rem;
            text-align: left;
        }
        td {
            padding: 0.8rem 1rem;
            border-bottom: 1px solid #fff0a;
            font-size: 0.9rem;
        }
        tr:hover td { background: rgba(201,168,76,0.05); }
        .badge {
            display: inline-block;
            padding: 0.2rem 0.6rem;
            border-radius: 4px;
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 600;
        }
        .badge-individual { background: #C9A84C30; color: #C9A84C; }
        .badge-team { background: #8B000030; color: #FF6B6B; }
        .badge-pending { background: #FF580030; color: #FF9F43; }
        .badge-confirmed { background: #39FF1430; color: #39FF14; }
        .export-btn {
            background: linear-gradient(135deg, #C9A84C, #8B0000);
            color: #fff;
            border: none;
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }
        .export-btn:hover { opacity: 0.9; }
        .empty { text-align: center; padding: 3rem; color: #fff6; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>🎪 Ahlaad 2026 — Registrations</h1>
            <p class="subtitle">AITAM Silver Jubilee Cultural Fest — Admin Dashboard</p>
        </div>
        <a href="export_csv.php" class="export-btn">📥 Export CSV</a>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="label">Total Registrations</div>
            <div class="value"><?= $totalRegistrations ?></div>
        </div>
        <div class="stat-card">
            <div class="label">Total Fees Collected</div>
            <div class="value">₹<?= number_format($totalFees, 0) ?></div>
        </div>
        <div class="stat-card">
            <div class="label">Prize Pool</div>
            <div class="value" style="color:#39FF14">₹2,50,000</div>
        </div>
    </div>

    <!-- Competition Stats -->
    <h3 style="color: #C9A84C; margin-bottom: 1rem;">Competition Breakdown</h3>
    <div class="stats" style="flex-wrap: wrap; margin-bottom: 2rem;">
        <?php while ($stat = $stats->fetch_assoc()): ?>
        <div class="stat-card" style="min-width: 160px; flex: 0 1 200px;">
            <div class="label"><?= htmlspecialchars($stat['competition']) ?></div>
            <div class="value" style="font-size: 1.5rem;"><?= $stat['count'] ?></div>
            <div style="color: #fff6; font-size: 0.8rem; margin-top: 0.3rem;">
                <?= $stat['entry_type'] ?> · ₹<?= number_format($stat['total_fee'], 0) ?>
            </div>
        </div>
        <?php endwhile; ?>
    </div>

    <!-- Filters -->
    <form method="GET" class="filters">
        <select name="competition" onchange="this.form.submit()">
            <option value="">All Competitions</option>
            <?php
            $comps = ['Short Films','Rock Band','Photography','Singing','Cover Song',
                      'Dance — Classical Solo','Dance — Classical Group',
                      'Dance — Western Solo','Dance — Western Group',
                      'Drama / Skit','Painting','Handicrafts'];
            foreach ($comps as $c): ?>
                <option value="<?= $c ?>" <?= $filter === $c ? 'selected' : '' ?>><?= $c ?></option>
            <?php endforeach; ?>
        </select>
        <select name="status" onchange="this.form.submit()">
            <option value="">All Status</option>
            <option value="pending" <?= $status_filter === 'pending' ? 'selected' : '' ?>>Pending</option>
            <option value="confirmed" <?= $status_filter === 'confirmed' ? 'selected' : '' ?>>Confirmed</option>
            <option value="cancelled" <?= $status_filter === 'cancelled' ? 'selected' : '' ?>>Cancelled</option>
        </select>
    </form>

    <!-- Table -->
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>College</th>
                <th>College ID</th>
                <th>Competition</th>
                <th>Type</th>
                <th>Team</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            <?php if ($result->num_rows === 0): ?>
                <tr><td colspan="12" class="empty">No registrations yet. Share the website! 🎉</td></tr>
            <?php else: ?>
                <?php while ($row = $result->fetch_assoc()): ?>
                <tr>
                    <td><?= $row['id'] ?></td>
                    <td><?= htmlspecialchars($row['participant_name']) ?></td>
                    <td><?= htmlspecialchars($row['email']) ?></td>
                    <td><?= htmlspecialchars($row['phone']) ?></td>
                    <td><?= htmlspecialchars($row['college']) ?></td>
                    <td><?= htmlspecialchars($row['college_id']) ?></td>
                    <td><?= htmlspecialchars($row['competition']) ?></td>
                    <td><span class="badge badge-<?= $row['entry_type'] ?>"><?= $row['entry_type'] ?></span></td>
                    <td><?= $row['team_name'] ? htmlspecialchars($row['team_name']) . ' (' . $row['team_size'] . ')' : '—' ?></td>
                    <td>₹<?= number_format($row['fee'], 0) ?></td>
                    <td><span class="badge badge-<?= $row['status'] ?>"><?= $row['status'] ?></span></td>
                    <td><?= date('M j, g:i A', strtotime($row['registration_date'])) ?></td>
                </tr>
                <?php endwhile; ?>
            <?php endif; ?>
        </tbody>
    </table>

    <?php $stmt->close(); $conn->close(); ?>
</body>
</html>
