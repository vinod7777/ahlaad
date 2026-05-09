<?php
/**
 * Ahlaad 2026 — Database Configuration
 * XAMPP + MySQL
 */

// Detect if running on localhost (development) or production server (Hostinger)
$is_localhost = isset($_SERVER['HTTP_HOST']) && (
    $_SERVER['HTTP_HOST'] === 'localhost' || 
    $_SERVER['HTTP_HOST'] === '127.0.0.1' || 
    strpos($_SERVER['HTTP_HOST'], '192.168.') === 0 ||
    strpos($_SERVER['HTTP_HOST'], '172.') === 0 ||
    strpos($_SERVER['HTTP_HOST'], '10.') === 0
);

if ($is_localhost) {
    // Local XAMPP Configuration
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', ''); 
    define('DB_NAME', 'ahlaad_2026');
} else {
    // Hostinger Production Configuration
    define('DB_HOST', 'localhost'); // Hostinger MySQL runs locally on the server
    define('DB_USER', 'u213825351_ahlaad');
    define('DB_PASS', 'Pandiit@6253'); 
    define('DB_NAME', 'u213825351_ahlaad');
}

function addColumnIfNeeded($conn, $table, $column, $definition) {
    $result = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    if ($result && $result->num_rows === 0) {
        $conn->query("ALTER TABLE `$table` ADD `$column` $definition");
    }
}

function getDB() {
    // Initial connection without database selection to ensure we can create the DB
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

    // 1. Users table (for Dashboard authentication)
    $conn->query("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            college VARCHAR(255) NOT NULL,
            college_id VARCHAR(100) NOT NULL UNIQUE,
            role ENUM('participant', 'admin', 'volunteer') DEFAULT 'participant',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // Update existing users table if role needs modification
    $conn->query("ALTER TABLE users MODIFY COLUMN role ENUM('participant', 'admin', 'volunteer') DEFAULT 'participant'");

    // Tasks table for volunteers
    $conn->query("
        CREATE TABLE IF NOT EXISTS volunteer_tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            volunteer_id INT NOT NULL,
            task_description TEXT NOT NULL,
            status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
            assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // 2. Registrations table (Consolidated for both Dashboard and Direct flows)
    $conn->query("
        CREATE TABLE IF NOT EXISTS registrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT DEFAULT NULL,
            participant_name VARCHAR(255) DEFAULT NULL,
            email VARCHAR(255) DEFAULT NULL,
            phone VARCHAR(20) DEFAULT NULL,
            college VARCHAR(255) DEFAULT NULL,
            college_id VARCHAR(100) DEFAULT NULL,
            competition VARCHAR(100) NOT NULL,
            entry_type ENUM('individual', 'team') NOT NULL DEFAULT 'individual',
            team_name VARCHAR(255) DEFAULT NULL,
            team_size INT DEFAULT NULL,
            fee DECIMAL(10,2) NOT NULL DEFAULT 200.00,
            utr_id VARCHAR(100) DEFAULT NULL,
            payment_proof VARCHAR(255) DEFAULT NULL,
            pass_id VARCHAR(50) UNIQUE DEFAULT NULL,
            registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
            decline_reason TEXT DEFAULT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Add columns if they don't exist (for existing databases)
    addColumnIfNeeded($conn, 'registrations', 'utr_id', "VARCHAR(100) DEFAULT NULL AFTER fee");
    addColumnIfNeeded($conn, 'registrations', 'payment_proof', "VARCHAR(255) DEFAULT NULL AFTER utr_id");
    addColumnIfNeeded($conn, 'registrations', 'tid', "VARCHAR(100) DEFAULT NULL AFTER payment_proof");
    addColumnIfNeeded($conn, 'registrations', 'decline_reason', "TEXT DEFAULT NULL AFTER status");
    addColumnIfNeeded($conn, 'registrations', 'team_id', "VARCHAR(50) DEFAULT NULL AFTER decline_reason");
    addColumnIfNeeded($conn, 'registrations', 'pass_id', "VARCHAR(50) UNIQUE DEFAULT NULL AFTER team_id");

    // 3. Registration Members table (for team members)
    $conn->query("
        CREATE TABLE IF NOT EXISTS registration_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            registration_id INT NOT NULL,
            member_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) DEFAULT NULL,
            phone VARCHAR(20) DEFAULT NULL,
            college VARCHAR(255) DEFAULT NULL,
            college_id VARCHAR(100) DEFAULT NULL,
            tid VARCHAR(100) DEFAULT NULL,
            pass_id VARCHAR(50) UNIQUE DEFAULT NULL,
            FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // Add columns if they don't exist
    addColumnIfNeeded($conn, 'registration_members', 'email', "VARCHAR(255) DEFAULT NULL AFTER member_name");
    addColumnIfNeeded($conn, 'registration_members', 'phone', "VARCHAR(20) DEFAULT NULL AFTER email");
    addColumnIfNeeded($conn, 'registration_members', 'college', "VARCHAR(255) DEFAULT NULL AFTER phone");
    addColumnIfNeeded($conn, 'registration_members', 'college_id', "VARCHAR(100) DEFAULT NULL AFTER college");
    addColumnIfNeeded($conn, 'registration_members', 'tid', "VARCHAR(100) DEFAULT NULL AFTER college_id");
    addColumnIfNeeded($conn, 'registration_members', 'team_id', "VARCHAR(50) DEFAULT NULL AFTER tid");
    addColumnIfNeeded($conn, 'registration_members', 'pass_id', "VARCHAR(50) UNIQUE DEFAULT NULL AFTER team_id");
    addColumnIfNeeded($conn, 'registration_members', 'checked_in', "TINYINT(1) DEFAULT 0");
    addColumnIfNeeded($conn, 'registration_members', 'checked_in_at', "DATETIME DEFAULT NULL");

    // Add checkin columns to registrations table too
    addColumnIfNeeded($conn, 'registrations', 'checked_in', "TINYINT(1) DEFAULT 0");
    addColumnIfNeeded($conn, 'registrations', 'checked_in_at', "DATETIME DEFAULT NULL");

    // 4. Events Timeline table
    $conn->query("
        CREATE TABLE IF NOT EXISTS events_timeline (
            id INT AUTO_INCREMENT PRIMARY KEY,
            day INT DEFAULT 1,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            status ENUM('upcoming', 'live', 'completed') DEFAULT 'upcoming',
            time_slot VARCHAR(100),
            venue VARCHAR(100),
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Add day column if not exists
    $conn->query("ALTER TABLE events_timeline ADD COLUMN IF NOT EXISTS day INT DEFAULT 1 AFTER id");

    // Ensure default admin user exists
    $admin_email = 'admin@ahlaad.com';
    $res = $conn->query("SELECT id FROM users WHERE email = '$admin_email'");
    if ($res->num_rows === 0) {
        $admin_pass = password_hash('admin123', PASSWORD_DEFAULT);
        $conn->query("INSERT INTO users (name, email, password, phone, college, college_id, role) VALUES ('Admin', '$admin_email', '$admin_pass', '0000000000', 'AITAM', 'ADMIN001', 'admin')");
    }

    // Ensure default Registration Desk coordinator user exists
    $desk_email = 'desk@ahlaad.com';
    $res_desk = $conn->query("SELECT id FROM users WHERE email = '$desk_email'");
    if ($res_desk->num_rows === 0) {
        $desk_pass = password_hash('desk@ahlaad2k26', PASSWORD_DEFAULT);
        $conn->query("INSERT INTO users (name, email, password, phone, college, college_id, role) VALUES ('Registration Desk', '$desk_email', '$desk_pass', '0000000000', 'AITAM', 'DESK001', 'volunteer')");
    }

    // Seed initial events if timeline is empty
    $res = $conn->query("SELECT COUNT(*) as count FROM events_timeline");
    if ($res && $res->fetch_assoc()['count'] == 0) {
        $conn->query("INSERT INTO events_timeline (day, name, category, status, time_slot, venue) VALUES 
            (1, 'Inauguration Ceremony', 'Main Event', 'upcoming', '9:00 AM', 'Open Air Theater'),
            (1, 'Rock Band Battle', 'Music', 'upcoming', '11:00 AM', 'Main Stage'),
            (1, 'Dance — Classical', 'Dance', 'upcoming', '2:00 PM', 'Auditorium'),
            (2, 'Short Films Screening', 'Media', 'upcoming', '10:00 AM', 'Mini Auditorium'),
            (2, 'Dance — Western Group', 'Dance', 'upcoming', '1:00 PM', 'Main Stage'),
            (2, 'Valedictory & Prize Distribution', 'Main Event', 'upcoming', '4:30 PM', 'Open Air Theater')");
    }

    // 5. Settings table
    $conn->query("
        CREATE TABLE IF NOT EXISTS settings (
            setting_key VARCHAR(50) PRIMARY KEY,
            setting_value VARCHAR(255) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Seed default setting
    $conn->query("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('registration_enabled', '1')");

    return $conn;
}

?>
