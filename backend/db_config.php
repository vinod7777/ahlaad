<?php
/**
 * Ahlaad 2026 — Database Configuration
 * XAMPP + MySQL
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'ahlaad_2026');

function getDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    
    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $conn->connect_error
        ]));
    }

    // Create database if not exists
    $conn->query("CREATE DATABASE IF NOT EXISTS " . DB_NAME);
    $conn->select_db(DB_NAME);
    $conn->set_charset("utf8mb4");

    // Create registrations table
    $conn->query("
        CREATE TABLE IF NOT EXISTS registrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            participant_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            college VARCHAR(255) NOT NULL,
            college_id VARCHAR(100) NOT NULL,
            competition VARCHAR(100) NOT NULL,
            entry_type ENUM('individual', 'team') NOT NULL DEFAULT 'individual',
            team_name VARCHAR(255) DEFAULT NULL,
            team_size INT DEFAULT NULL,
            fee DECIMAL(10,2) NOT NULL DEFAULT 200.00,
            registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
            UNIQUE KEY unique_email_competition (email, competition),
            UNIQUE KEY unique_team_name (team_name),
            INDEX idx_competition (competition),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Add unique constraint on team_name if table already exists (migration)
    $conn->query("ALTER TABLE registrations ADD UNIQUE INDEX unique_team_name (team_name)");

    return $conn;
}
?>
