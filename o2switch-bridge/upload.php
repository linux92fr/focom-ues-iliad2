<?php
require __DIR__ . '/config.php';
require __DIR__ . '/auth.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method_not_allowed']);
    exit;
}

require_bridge_secret();

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'no_file']);
    exit;
}

if (!is_dir(STORAGE_DIR) && !mkdir(STORAGE_DIR, 0750, true) && !is_dir(STORAGE_DIR)) {
    http_response_code(500);
    echo json_encode(['error' => 'storage_dir_unavailable']);
    exit;
}

$originalName = safe_filename($_FILES['file']['name']);
$relativePath = date('Y/m') . '/' . time() . '-' . bin2hex(random_bytes(4)) . '-' . $originalName;
$destination = STORAGE_DIR . '/' . $relativePath;
$destinationDir = dirname($destination);

if (!is_dir($destinationDir) && !mkdir($destinationDir, 0750, true) && !is_dir($destinationDir)) {
    http_response_code(500);
    echo json_encode(['error' => 'mkdir_failed']);
    exit;
}

if (!move_uploaded_file($_FILES['file']['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['error' => 'move_failed']);
    exit;
}

echo json_encode([
    'path' => $relativePath,
    'size' => filesize($destination),
]);
