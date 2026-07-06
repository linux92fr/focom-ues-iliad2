# Pont de stockage o2switch

Ces fichiers PHP forment le pont entre le site (via la fonction Edge Supabase
`documents-o2switch`) et un espace de stockage o2switch. Ils ne sont **jamais**
appelés directement par un navigateur : uniquement en serveur à serveur, avec un
secret partagé.

## Déploiement sur o2switch

1. Générez un secret fort :
   ```
   php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
   ```
2. Uploadez tout le contenu de ce dossier (`config.sample.php`, `auth.php`,
   `upload.php`, `download.php`, `delete.php`, `storage/.htaccess`) via FTP/cPanel
   File Manager dans un dossier de votre hébergement, par exemple :
   `https://votredomaine.fr/documents-bridge/`.
3. Sur le serveur, dupliquez `config.sample.php` en `config.php` et renseignez :
   - `BRIDGE_SECRET` avec le secret généré à l'étape 1 ;
   - `STORAGE_DIR` avec un chemin de stockage (idéalement hors de `public_html`
     si votre offre le permet).
4. Vérifiez que `storage/.htaccess` est bien présent sur le serveur (certains
   clients FTP masquent les fichiers commençant par un point).
5. Ne committez jamais `config.php` dans Git (il est dans `.gitignore`).

## Côté Supabase

Dans les secrets de la fonction Edge `documents-o2switch` (dashboard Supabase
→ Edge Functions → documents-o2switch → Secrets, ou `supabase secrets set`) :

- `O2SWITCH_BRIDGE_URL` : l'URL du dossier déployé, ex.
  `https://votredomaine.fr/documents-bridge` (sans slash final) ;
- `O2SWITCH_BRIDGE_SECRET` : le même secret que `BRIDGE_SECRET` ci-dessus.
