# legifrance-proxy

Proxy sécurisé vers l'**API Légifrance** de la DILA, exposée par la plateforme
[PISTE](https://piste.gouv.fr). Le frontend n'appelle jamais l'API directement :
il passe par cette Edge Function, qui gère l'authentification OAuth2
(`client_credentials`) côté serveur et met en cache le token (~1 h).

## Obtenir les identifiants PISTE

1. Créer un compte sur https://piste.gouv.fr.
2. Créer une application, puis s'abonner à l'API **Légifrance** (production).
3. Récupérer le `client_id` et le `client_secret` de l'application.

## Configurer les secrets Supabase

```bash
supabase secrets set \
  LEGIFRANCE_CLIENT_ID="votre_client_id" \
  LEGIFRANCE_CLIENT_SECRET="votre_client_secret"

# Facultatif :
#   LEGIFRANCE_ENV=sandbox   (par défaut : production)
#   ALLOWED_ORIGIN=https://votre-domaine.fr,https://autre-domaine.fr
```

- `LEGIFRANCE_ENV=sandbox` bascule vers `sandbox-api.piste.gouv.fr` /
  `sandbox-oauth.piste.gouv.fr` (données de test, quotas limités).
- `ALLOWED_ORIGIN` restreint le CORS. Si absent, toutes les origines sont
  acceptées (localhost est toujours autorisé).

## Déployer

```bash
supabase functions deploy legifrance-proxy
```

## Utilisation

`POST` avec un corps `{ action, params }`. Actions autorisées (liste blanche) :

| action            | endpoint Légifrance                     | usage                              |
|-------------------|------------------------------------------|------------------------------------|
| `search`          | `/search`                                | recherche générique                |
| `suggest`         | `/suggest`                               | autocomplétion                     |
| `getArticle`      | `/consult/getArticle`                    | article par identifiant            |
| `getArticleWithId`| `/consult/getArticleWithIdEliOrAlias`    | article par ELI/alias              |
| `consultCode`     | `/consult/code`                          | contenu d'un code / section        |
| `consultLegi`     | `/consult/legiPart`                      | texte du fonds LEGI                |
| `tableMatieres`   | `/consult/code/tableMatieres`            | table des matières d'un code       |
| `ping`            | `/search/ping`                           | test de connectivité               |

Côté frontend, tout passe par `src/lib/legifrance.ts` (helpers typés).

## Vérifier la connexion

```bash
curl -X POST "https://<project>.supabase.co/functions/v1/legifrance-proxy" \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"action":"ping"}'
```
