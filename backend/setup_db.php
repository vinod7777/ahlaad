<?php
/**
 * Ahlaad 2026 — Database Setup Utility
 * Visit this page in your browser to initialize/update the database and tables.
 */

require_once 'db_config.php';

try {
    $conn = getDB();
    echo "<h1>🎪 Ahlaad 2026 — Database Setup</h1>";
    echo "<p style='color: green; font-weight: bold;'>✅ Success: Database and all tables have been initialized.</p>";
    echo "<h3>Tables Verified:</h3>";
    echo "<ul>
            <li><b>users</b>: User accounts and admin credentials</li>
            <li><b>registrations</b>: Competition entries (Dashboard & Direct)</li>
            <li><b>registration_members</b>: Team member details</li>
            <li><b>events_timeline</b>: Schedule and live status</li>
          </ul>";
    echo "<p><b>Default Admin:</b> admin@ahlaad.com / admin123</p>";
    echo "<hr>";
    echo "<a href='admin.php'>Go to Admin Panel</a> | <a href='../index.html'>Go to Website</a>";
    $conn->close();
} catch (Exception $e) {
    echo "<h1>❌ Setup Failed</h1>";
    echo "<p style='color: red;'>" . $e->getMessage() . "</p>";
}
?>
