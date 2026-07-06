<?php
// Copiez ce fichier en config.php sur le serveur o2switch (config.php est ignoré par Git,
// ne le committez jamais avec un vrai secret dedans).
//
// Générez un secret fort avant de déployer, par exemple :
//   php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
// Le même secret doit être renseigné côté Supabase dans les secrets de la fonction Edge
// "documents-o2switch" (variable O2SWITCH_BRIDGE_SECRET).
define('BRIDGE_SECRET', 'CHANGE_ME');

// Dossier de stockage des fichiers. Idéalement en dehors de public_html si votre offre
// o2switch le permet (ex: un dossier au même niveau que public_html, non servi par Apache).
// Si vous devez le garder sous public_html, laissez le .htaccess fourni dans storage/
// en place : il bloque tout accès HTTP direct au dossier.
define('STORAGE_DIR', __DIR__ . '/storage');
