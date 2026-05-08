<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode([
    'HTTP_HOST' => isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : null,
    'SERVER_NAME' => isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : null,
    'SERVER_ADDR' => isset($_SERVER['SERVER_ADDR']) ? $_SERVER['SERVER_ADDR'] : null,
    'REMOTE_ADDR' => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : null,
    'is_localhost_detected' => (
        isset($_SERVER['HTTP_HOST']) && (
            $_SERVER['HTTP_HOST'] === 'localhost' || 
            $_SERVER['HTTP_HOST'] === '127.0.0.1' || 
            strpos($_SERVER['HTTP_HOST'], '192.168.') === 0 ||
            strpos($_SERVER['HTTP_HOST'], '172.') === 0 ||
            strpos($_SERVER['HTTP_HOST'], '10.') === 0
        )
    )
]);
