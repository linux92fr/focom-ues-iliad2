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

$data = json_decode(file_get_contents('php://input'), true);
$path = is_array($data) ? ($data['path'] ?? '') : '';
$fullPath = is_string($path) ? resolve_storage_path($path) : false;

if ($fullPath === false || !is_file($fullPath)) {
    http_response_code(404);
    echo json_encode(['error' => 'not_found']);
    exit;
}

unlink($fullPath);
echo json_encode(['success' => true]);
