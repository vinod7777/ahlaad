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

    // Create users table for authentication
    $conn->query("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            college VARCHAR(255) NOT NULL,
            college_id VARCHAR(100) NOT NULL UNIQUE,
            role ENUM('participant', 'admin') DEFAULT 'participant',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Ensure admin user exists
    $admin_email = 'admin@ahlaad.com';
    $admin_pass = password_hash('admin123', PASSWORD_DEFAULT);
    $conn->query("INSERT IGNORE INTO users (name, email, password, phone, college, college_id, role) VALUES ('Admin', '$admin_email', '$admin_pass', '0000000000', 'AITAM', 'ADMIN001', 'admin')");

    // Create events_timeline table
    $conn->query("
        CREATE TABLE IF NOT EXISTS events_timeline (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            status ENUM('upcoming', 'live', 'completed') DEFAULT 'upcoming',
            time_slot VARCHAR(100),
            venue VARCHAR(100),
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // Seed some events if empty
    $res = $conn->query("SELECT COUNT(*) as count FROM events_timeline");
    if ($res->fetch_assoc()['count'] == 0) {
        $conn->query("INSERT INTO events_timeline (name, category, status, time_slot, venue) VALUES 
            ('Inauguration Ceremony', 'Main Event', 'upcoming', '9:00 AM', 'Open Air Theater'),
            ('Rock Band Battle', 'Music', 'upcoming', '11:00 AM', 'Main Stage'),
            ('Dance — Classical', 'Dance', 'upcoming', '2:00 PM', 'Auditorium')");
    }

    // Create registrations table
    $conn->query("
        CREATE TABLE IF NOT EXISTS registrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            competition VARCHAR(100) NOT NULL,
            entry_type ENUM('individual', 'team') NOT NULL DEFAULT 'individual',
            team_name VARCHAR(255) DEFAULT NULL,
            team_size INT DEFAULT NULL,
            fee DECIMAL(10,2) NOT NULL DEFAULT 200.00,
            pass_id VARCHAR(50) UNIQUE DEFAULT NULL,
            registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_competition (user_id, competition)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Create registration_members table for teams
    $conn->query("
        CREATE TABLE IF NOT EXISTS registration_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            registration_id INT NOT NULL,
            member_name VARCHAR(255) NOT NULL,
            pass_id VARCHAR(50) UNIQUE DEFAULT NULL,
            FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    return $conn;
}
?>
