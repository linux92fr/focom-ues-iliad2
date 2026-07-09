-- La doc Infomaniak fournie révèle un système de token d'API statique généré depuis le
-- manager (https://manager.infomaniak.com/v3/ng/accounts/token/list), plus simple que le
-- flow OAuth2 Authorization Code envisagé. On revient à un secret Bearer statique
-- (KDRIVE_API_TOKEN) pour la fonction Edge documents-kdrive ; la table de gestion du
-- refresh_token OAuth2 n'a jamais été utilisée (aucun refresh_token n'y a été inséré) et
-- devient inutile.
DROP TABLE IF EXISTS public.kdrive_oauth_tokens;
