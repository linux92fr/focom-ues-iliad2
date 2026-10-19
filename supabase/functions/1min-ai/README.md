# Intégration 1min.ai — Studio IA d'administration

## Fonctionnalités

La page d'administration `/admin/ai` ajoute :
- rédaction d'articles et d'actualités syndicales ;
- résumé de PDF (extraction locale du texte PDF avant envoi au modèle) ;
- correction et amélioration de textes ;
- génération d'illustrations avec résultat asynchrone ;
- assistant conversationnel pour les questions générales des salariés.

Le frontend appelle uniquement la fonction Supabase `1min-ai`. La clé 1min.ai n'est jamais intégrée au code client.

## Configuration des secrets

Dans le projet Supabase lié au site, configure la clé depuis un terminal de confiance (ne jamais la committer dans Git) :

```bash
supabase secrets set ONEMIN_API_KEY="VOTRE_CLE_1MIN_AI" ALLOWED_ORIGIN="https://focomues-iliad.fr,https://www.focomues-iliad.fr"
supabase functions deploy 1min-ai
```

Les variables `SUPABASE_URL` et `SUPABASE_ANON_KEY` sont fournies à l'environnement Edge Functions par Supabase. Vérifie qu'elles sont disponibles dans le projet.

## Contrôle d'accès

La fonction vérifie le JWT Supabase puis lit les rôles de `public.user_roles` côté serveur :
- `admin` : tous les outils ;
- `redacteur` : rédaction, résumé, correction et images ;
- `representant` et `secretaire` : outils textuels et assistant ;
- les autres rôles et `public` : refusés pour les fonctions de rédaction.

La génération d'images est limitée aux rôles `admin` et `redacteur`. La route UI est placée sous le layout d'administration et son garde d'accès.

## API utilisée

- Texte / chat : `POST https://api.1min.ai/openai/v1/chat/completions` avec `Authorization: Bearer`.
- Images : `POST https://api.1min.ai/api/features` avec `API-KEY`.
- Vérification du résultat image : `GET https://api.1min.ai/api/results/:resultId` avec `API-KEY`.

Modèle texte par défaut : `gpt-4.1-mini`. Modèle image : `black-forest-labs/flux-schnell`. Vérifier la disponibilité et les crédits du compte dans 1min.ai avant la mise en service.

## PDF et confidentialité

L'extraction PDF est effectuée dans le navigateur avec PDF.js, limitée à 15 Mo, 100 pages et 30 000 caractères envoyés au service. Les PDF scannés sans couche texte nécessitent une OCR préalable. Les données envoyées à 1min.ai sont soumises à la politique de conservation du fournisseur ; ne pas transmettre de données sensibles ou confidentielles sans autorisation.

## Mise en service et tests

1. Configurer le secret `ONEMIN_API_KEY` dans Supabase.
2. Déployer la fonction Edge `1min-ai`.
3. Vérifier que le compte utilisateur possède le rôle requis dans `user_roles`.
4. Ouvrir le panneau d'administration puis **Studio IA**.
5. Tester la correction d'un court texte, le résumé d'un PDF avec texte sélectionnable, une question dans l'assistant, puis une génération d'image.
6. Vérifier les logs de la fonction en cas d'erreur. Ne jamais journaliser la clé API ou le texte intégral des documents.

Cette modification GitHub ne configure pas automatiquement les secrets Supabase et ne déploie pas la fonction sur le projet hébergé.
