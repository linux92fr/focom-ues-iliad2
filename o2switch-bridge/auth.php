<?php
// Vérifie le secret partagé envoyé par la fonction Edge Supabase. Ce pont n'est jamais
// appelé directement par un navigateur : pas de CORS, un appel sans le bon secret est
// rejeté sans autre traitement.
function require_bridge_secret(): void
{
    $provided = $_SERVER['HTTP_X_BRIDGE_SECRET'] ?? '';
    if (!is_string($provided) || $provided === '' || !hash_equals(BRIDGE_SECRET, $provided)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'forbidden']);
        exit;
    }
}

// Construit un nom de fichier sûr (utilisé uniquement pour le suffixe lisible du chemin
// stocké ; l'unicité vient du timestamp + suffixe aléatoire ajoutés par upload.php).
function safe_filename(string $name): string
{
    $name = preg_replace('/[^a-zA-Z0-9._-]/', '-', $name) ?? '';
    return $name === '' ? bin2hex(random_bytes(8)) : $name;
}

// Résout un chemin relatif vers le dossier de stockage en empêchant toute sortie
// (path traversal). Retourne false si le chemin est invalide ou hors du dossier.
function resolve_storage_path(string $relativePath)
{
    $relativePath = str_replace("\0", '', $relativePath);
    $storageRoot = realpath(STORAGE_DIR);
    if ($storageRoot === false) {
        return false;
    }
    $fullPath = realpath(STORAGE_DIR . '/' . $relativePath);
    if ($fullPath === false || strpos($fullPath, $storageRoot . DIRECTORY_SEPARATOR) !== 0) {
        return false;
    }
    return $fullPath;
}
