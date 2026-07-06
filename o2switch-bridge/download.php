<?php
require __DIR__ . '/config.php';
require __DIR__ . '/auth.php';

require_bridge_secret();

$path = $_GET['path'] ?? '';
$fullPath = is_string($path) ? resolve_storage_path($path) : false;

if ($fullPath === false || !is_file($fullPath)) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'not_found']);
    exit;
}

header('Content-Type: application/octet-stream');
header('Content-Length: ' . filesize($fullPath));
header('Content-Disposition: inline; filename="' . basename($fullPath) . '"');
readfile($fullPath);
