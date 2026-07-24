# judilibre-proxy

Proxy sécurisé vers l'**API JUDILIBRE** (jurisprudence de la Cour de cassation),
exposée par la plateforme [PISTE](https://piste.gouv.fr). Même principe que
`legifrance-proxy` : OAuth2 `client_credentials` géré côté serveur, token mis en
cache, relais par liste blanche d'actions.

## Secrets

La fonction **réutilise les identifiants PISTE existants** (l'application PISTE
est autorisée à la fois pour Légifrance et JUDILIBRE). Aucun nouveau secret n'est
requis si `LEGIFRANCE_CLIENT_ID` / `LEGIFRANCE_CLIENT_SECRET` sont déjà définis.

Ordre de résolution :
- `PISTE_CLIENT_ID` puis `LEGIFRANCE_CLIENT_ID`
- `PISTE_CLIENT_SECRET` puis `LEGIFRANCE_CLIENT_SECRET`
- `PISTE_ENV` puis `LEGIFRANCE_ENV` (`sandbox` ou `production` [défaut])

## Déployer

```bash
supabase functions deploy judilibre-proxy
```

## Utilisation

`POST` avec `{ action, params }`. Actions (GET côté API) :

| action        | endpoint JUDILIBRE | usage                              |
|---------------|--------------------|------------------------------------|
| `search`      | `/search`          | recherche de décisions             |
| `decision`    | `/decision`        | contenu intégral d'une décision    |
| `taxonomy`    | `/taxonomy`        | listes de termes                   |
| `stats`       | `/stats`           | statistiques de la base            |
| `healthcheck` | `/healthcheck`     | état du service                    |

Base path : `/cassation/judilibre/v1.0`. Côté frontend, tout passe par
`src/lib/judilibre.ts`.
