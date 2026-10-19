# Intégration 1min.ai — Studio IA d'administration

## Fonctionnalités

La page d'administration `/admin/ai` ajoute :
- rédaction d'articles et d'actualités syndicales ;
- résumé de PDF (extraction locale du texte PDF avant envoi au modèle) ;
- correction et amélioration de textes ;
- génération d'illustrations avec résultat asynchrone ;
- assistant conversationnel pour les questions générales des salariés.

Le frontend appelle uniquement la fonction Supabase `min-ai`. La clé 1min.ai reste côté serveur et ne doit jamais être intégrée au code client ou commitée dans Git.

## Configuration via le tableau de bord Supabase

1. Ouvrir le projet Supabase lié au site.
2. Aller dans **Edge Functions → Secrets** et enregistrer `ONEMIN_API_KEY` avec la clé fournie par 1min.ai.
3. Facultatif : définir `ALLOWED_ORIGIN` à `https://focomues-iliad.fr,https://www.focomues-iliad.fr`. Si ce secret est absent, ces deux domaines sont autorisés par défaut dans le code.
4. Dans **Edge Functions**, créer ou modifier la fonction nommée exactement `min-ai`.
5. Copier le contenu de `index.ts` dans l'éditeur Supabase. Ne pas ajouter l'import `@supabase/functions-js/edge-runtime.d.ts` en première ligne.
6. Déployer la fonction.

Supabase fournit normalement `SUPABASE_URL` et `SUPABASE_ANON_KEY` à l'environnement des fonctions. La fonction utilise ces valeurs pour valider la session et consulter les rôles.

## Contrôle d'accès

La fonction vérifie la session Supabase puis lit les rôles dans `public.user_roles` :
- `admin` : tous les outils ;
- `redacteur` : rédaction, résumé, correction et images ;
- `representant` et `secretaire` : outils textuels et assistant ;
- les autres rôles : refusés pour les fonctions de rédaction.

La génération d'images est limitée aux rôles `admin` et `redacteur`. Avant mise en production, vérifier que les valeurs de rôles correspondent à celles réellement utilisées dans la base de données.

## API utilisée

- Texte / chat : `POST https://api.1min.ai/openai/v1/chat/completions` avec `Authorization: Bearer`.
- Images : `POST https://api.1min.ai/api/features` avec `API-KEY`.
- Vérification du résultat image : `GET https://api.1min.ai/api/results/:resultId` avec `API-KEY`.

Modèle texte par défaut : `gpt-4.1-mini`. Modèle image : `black-forest-labs/flux-schnell`. Vérifier la disponibilité et les crédits du compte 1min.ai avant la mise en service.

## PDF et confidentialité

L'extraction PDF est effectuée dans le navigateur avec PDF.js, limitée à 15 Mo, 100 pages et 30 000 caractères envoyés au service. Les PDF scannés sans couche texte nécessitent une OCR préalable.

## Test et mise en production

- Dans Supabase, ouvrir la fonction `min-ai` et utiliser l'outil **Test** avec une session utilisateur valide et une requête POST JSON.
- Tester depuis le site avec un compte autorisé afin de vérifier ensemble l'authentification, les rôles, le CORS et les appels 1min.ai.
- Exécuter les vérifications CI/build du dépôt avant de fusionner la Pull Request.
- Le déploiement manuel dans Supabase n'est pas synchronisé automatiquement avec GitHub : conserver les deux versions cohérentes.
