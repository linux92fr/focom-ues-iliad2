# API ONLYOFFICE

Ce service Node.js fournit les deux routes nécessaires à l'éditeur :

- `POST /api/onlyoffice/config`
- `POST /api/onlyoffice/callback`

Il vérifie la session Supabase et les rôles autorisés, signe la configuration avec le secret JWT d'ONLYOFFICE, puis enregistre les modifications dans le bucket Supabase `documents`.

## Configuration

Créer un fichier `.env` à partir de `.env.example`, puis renseigner les secrets. Les origines CORS sont séparées par des virgules.

## Lancement

```bash
npm install
npm start
```

Le reverse proxy doit exposer ce service en HTTPS sur `PUBLIC_API_URL`. Le domaine `docs.focomues-iliad.fr` doit pouvoir joindre `PUBLIC_API_URL/api/onlyoffice/callback`.

## Sécurité

- Les URL de documents ne sont jamais fournies librement par le navigateur.
- Le serveur récupère le chemin réel dans la table Supabase `documents`.
- Seuls les rôles autorisés peuvent demander une configuration d'édition.
- Le callback vérifie le JWT envoyé par ONLYOFFICE.
- L'enregistrement est réalisé avec la clé de service, conservée uniquement côté serveur.
