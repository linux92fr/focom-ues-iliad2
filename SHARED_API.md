# Contrat API partagé — Web & Android

Ce document décrit les interfaces partagées entre le site web (`focom-ues-iliad2`) et l'application Android (`Android_FOCOM`). Les deux applications utilisent le **même projet Supabase** comme backend. Toute modification ici est un **breaking change potentiel** pour l'Android.

---

## Applications concernées

| App | Dépôt | Stack | Client Supabase |
|---|---|---|---|
| Site web | `linux92fr/focom-ues-iliad2` | React 18 + Vite + TypeScript | `@supabase/supabase-js` v2 |
| App Android | `linux92fr/Android_FOCOM` | Kotlin + Jetpack Compose + MVVM | Retrofit + OkHttp (appels REST directs) |

> L'app Android n'utilise **pas** le SDK Supabase officiel Kotlin — elle appelle directement les endpoints REST PostgREST avec Retrofit.

---

## Fichier de données partagé (GitHub Raw)

L'app Android charge ce fichier JSON pour alimenter les sections News, Droits, Délégués et Publications **sans rebuilder l'APK** :

```
GET https://raw.githubusercontent.com/linux92fr/focom-ues-iliad2/main/data/focom-content.json
```

**Localisation dans ce dépôt :** `data/focom-content.json`

### Structure attendue

```json
{
  "newsList": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "content": "string (texte brut, pas de HTML)",
      "date": "string (ex: '22 mai 2026')",
      "category": "NAO | CSE | Accords | Vie Syndicale",
      "isHotState": "boolean",
      "imageUrl": "string | null"
    }
  ],
  "rightsList": [
    {
      "id": "string",
      "title": "string",
      "category": "Télétravail | Congés | Santé | Rémunération | Législation | Sécurité",
      "summary": "string",
      "detailMarkdown": "string (Markdown rendu dans l'app)",
      "focomAdvice": "string"
    }
  ],
  "delegatesList": [
    {
      "id": "string",
      "name": "string",
      "role": "string",
      "entity": "Free Réseau | Free Mobile | ILIAD | Free SAS | Assunet | ROF",
      "region": "string",
      "email": "string",
      "phone": "string",
      "avatarLetters": "string (2 initiales)"
    }
  ],
  "publicationsList": [
    {
      "id": "string",
      "title": "string",
      "type": "Journal | Tract | Affiche",
      "date": "string",
      "thumbnailUrl": "string | null",
      "pdfUrl": "string (URL publique du PDF)",
      "excerpt": "string"
    }
  ]
}
```

> **Important :** Ce fichier est la **source de vérité** pour les droits et les délégués dans l'app Android. Modifier ce fichier met à jour l'app sans publication d'un nouvel APK.

---

## Mapping articles Supabase → Publications Android

L'app Android lit aussi la table `articles` de Supabase et la transforme ainsi :

| Colonne `articles` | Champ `FocomPublication` | Transformation |
|---|---|---|
| `id` | `id` | Direct |
| `title` | `title` | Direct |
| `content` | `content` | HTML strippé côté Android |
| `excerpt` | `excerpt` | Direct (ou `""`) |
| `category` | `type` | Mapping : `actualite` → `"Actualité"`, etc. |
| `image_url` | `thumbnailUrl` | Direct |
| `published_at` | `date` | Formaté `DD/MM/YYYY` en français |
| `slug` | *(construit pdfUrl)* | `https://focomues-iliad.fr/actualites/{slug}` |

> **Point de vigilance :** L'URL vers l'article web est construite côté Android avec le `slug`. Si la structure des routes web change (`/actualites/` → `/articles/`), tous les liens dans l'app seront cassés.

---

## Connexion Supabase

| Paramètre | Valeur |
|---|---|
| Project URL | `https://qinekdmyycyujsrcsfbe.supabase.co` |
| Auth | Supabase JWT (Bearer token) |
| Client Supabase | `@supabase/supabase-js` v2.x (web) |

> L'application Android doit utiliser le SDK Supabase pour Kotlin/Java ou Flutter, avec le même projet URL et la même anon key.

---

## Énumérations (Enums PostgreSQL)

Ces valeurs sont définies au niveau de la base de données. **Ne jamais ajouter ou supprimer une valeur sans migration SQL + mise à jour des deux apps.**

### `user_role`
```
admin | representant | adherent | public | redacteur | tresorier | secretaire | visio
```

### `adhesion_status`
```
en_attente | validee | refusee | expiree
```

### `article_status`
```
brouillon | en_revision | approuve | publie
```

### `mandate_type`
```
delegue_syndical | titulaire_cse | membre_cssct
```

### `member_status`
```
actif | inactif | suspendu
```

### `permission_type`
```
manage_users | manage_roles | manage_sections | manage_pages | manage_content |
manage_popups | manage_themes | manage_shop | manage_droits | view_analytics |
manage_formations | manage_adhesions | manage_emails | manage_articles |
create_articles | edit_own_articles | publish_articles | manage_finances |
view_financial_reports | manage_recettes_depenses
```

---

## Tables — Schémas de données

### `profiles`
Profil utilisateur lié à `auth.users`.

| Champ | Type | Nullable |
|---|---|---|
| `id` | uuid (PK) | non |
| `display_name` | text | oui |
| `phone` | text | oui |
| `section` | text | oui |
| `created_at` | timestamptz | non |
| `updated_at` | timestamptz | non |

> Contrainte validation : `display_name` ≤ 100 car, `phone` format `[0-9\s\-+()]`, `section` ≤ 100 car.

---

### `user_roles`
Association utilisateur ↔ rôle.

| Champ | Type | Nullable |
|---|---|---|
| `id` | uuid (PK) | non |
| `user_id` | uuid (FK → profiles) | non |
| `role` | enum `user_role` | non |
| `created_at` | timestamptz | non |

---

### `articles`
Articles publiés sur le site.

| Champ | Type | Nullable |
|---|---|---|
| `id` | uuid (PK) | non |
| `title` | text | non |
| `slug` | text (unique) | non |
| `excerpt` | text | oui |
| `content` | text (HTML) | non |
| `image_url` | text | oui |
| `category` | text | oui |
| `author_id` | uuid (FK → profiles) | oui |
| `is_published` | boolean | non |
| `published_at` | timestamptz | oui |
| `status` | enum `article_status` | non |
| `created_at` | timestamptz | non |
| `updated_at` | timestamptz | non |

> Contrainte : `slug` format `/^[a-z0-9-]+$/`, `title` ≤ 200 car, `content` ≤ 100 000 car.

---

### `news`
Brèves/actualités courtes.

| Champ | Type | Nullable |
|---|---|---|
| `id` | uuid (PK) | non |
| `title` | text | non |
| `content` | text (HTML) | non |
| `category_id` | uuid (FK → categories) | oui |
| `is_published` | boolean | non |
| `created_at` | timestamptz | non |
| `updated_at` | timestamptz | non |

---

### `events`
Événements syndicaux (agenda).

| Champ | Type | Nullable |
|---|---|---|
| `id` | uuid (PK) | non |
| `title` | text | non |
| `description` | text | oui |
| `start_date` | timestamptz | non |
| `end_date` | timestamptz | oui |
| `all_day` | boolean | oui |
| `location` | text | oui |
| `event_type` | text | non |
| `color` | text | oui |
| `is_public` | boolean | oui |
| `organizer_id` | uuid (FK → profiles) | oui |
| `created_at` | timestamptz | non |
| `updated_at` | timestamptz | non |

---

### `adhesions`
Adhésions syndicales des membres.

| Champ | Type | Nullable |
|---|---|---|
| `id` | uuid (PK) | non |
| `user_id` | uuid (FK → profiles) | non |
| `type_adhesion` | text | non |
| `status` | enum `adhesion_status` | non |
| `montant` | numeric | oui |
| `date_debut` | date | non |
| `date_fin` | date | non |
| `commentaires` | text | oui |
| `created_at` | timestamptz | non |
| `updated_at` | timestamptz | non |

---

### `reclamations`
Réclamations des adhérents.

| Champ | Type | Nullable |
|---|---|---|
| `id` | uuid (PK) | non |
| `user_id` | uuid (FK → profiles) | non |
| `title` | text | non |
| `description` | text | non |
| `status` | text | non |
| `category` | text | oui |
| `created_at` | timestamptz | non |
| `updated_at` | timestamptz | non |

---

### `surveys` / `survey_questions` / `survey_responses`
Système de sondages.

**`surveys`**

| Champ | Type | Nullable |
|---|---|---|
| `id` | uuid (PK) | non |
| `title` | text | non |
| `is_active` | boolean | non |
| `participation_mode` | text | oui |
| `allowed_email_domain` | text | oui |
| `allow_multiple_votes` | boolean | oui |
| `starts_at` | timestamptz | oui |
| `ends_at` | timestamptz | oui |

**`survey_questions`** — liées à un `survey_id`.
**`survey_responses`** — liées à un `survey_id` + `question_id`.

---

### `notifications`

| Champ | Type | Nullable |
|---|---|---|
| `id` | uuid (PK) | non |
| `user_id` | uuid (FK → profiles) | non |
| `title` | text | non |
| `message` | text | non |
| `type` | text | non |
| `is_read` | boolean | non |
| `archived` | boolean | non |
| `link` | text | oui |
| `created_at` | timestamptz | non |

---

### `documents` / `document_categories`
Bibliothèque de documents téléchargeables.

| Champ (`documents`) | Type | Nullable |
|---|---|---|
| `id` | uuid (PK) | non |
| `title` | text | non |
| `file_name` | text | non |
| `file_path` | text | non |
| `file_type` | text | oui |
| `file_size` | integer | oui |
| `description` | text | oui |
| `category_id` | uuid (FK → document_categories) | oui |
| `uploaded_by` | uuid (FK → profiles) | oui |

---

### `newsletter_subscribers`

| Champ | Type | Nullable |
|---|---|---|
| `id` | uuid (PK) | non |
| `email` | text (unique) | non |
| `is_active` | boolean | non |
| `subscribed_at` | timestamptz | non |
| `unsubscribe_token` | text | non |
| `unsubscribed_at` | timestamptz | oui |

---

### `flash_banners`
Bandeaux d'annonces affichés sur le site.

| Champ | Type | Nullable |
|---|---|---|
| `id` | uuid (PK) | non |
| `message` | text | non |
| `type` | text | non |
| `link` | text | oui |
| `is_active` | boolean | oui |
| `start_date` | timestamptz | non |
| `end_date` | timestamptz | non |

---

### `formations` / `formation_participants`
Formations syndicales.

**`formations`** : `id`, `titre`, `date_formation`, `description`, `lieu`, `duree_heures`, `formateur`, `max_participants`, `status`.
**`formation_participants`** : `formation_id`, `user_id`, `status`.

---

### `contact_messages`

| Champ | Type | Valeurs possibles |
|---|---|---|
| `status` | text | `non-lu` \| `lu` \| `repondu` |
| `category` | text | libre |
| `admin_reply` | text | oui |

---

### `nao_2026_responses`
Réponses au formulaire NAO 2026 (anonymes).

Champs clés : `site`, `categorie`, `anciennete`, `satisfaction_globale`, `salaires_priorite`, `salaires_type_augmentation`, `top5` (array).

---

### `access_keys`
Clés d'accès pour authentification alternative.

| Champ | Type | Nullable |
|---|---|---|
| `key` | text (unique) | non |
| `is_active` | boolean | oui |
| `max_uses` | integer | oui |
| `current_uses` | integer | oui |
| `expires_at` | timestamptz | oui |
| `user_id` | uuid (FK → profiles) | oui |

---

### `app_config`
Configuration applicative clé/valeur.

| Champ | Type |
|---|---|
| `key` | text (PK) |
| `value` | text |
| `description` | text |

> Utilisé pour des paramètres partagés (URLs, flags features, etc.).

---

## Edge Functions

Toutes les fonctions sont accessibles via `POST https://qinekdmyycyujsrcsfbe.supabase.co/functions/v1/<nom>`.

### `send-welcome-email`
Envoie l'email de bienvenue à un nouvel abonné newsletter.

**Auth requise :** non  
**Corps JSON :**
```json
{
  "email": "string",
  "unsubscribeToken": "string"
}
```
**Réponse succès :** `{ "success": true }`

---

### `send-newsletter`
Envoie la newsletter à tous les abonnés actifs.

**Auth requise :** oui (admin)  
**Corps JSON :**
```json
{
  "newsletter_id": "uuid"
}
```

---

### `send-newsletter-selected`
Envoie la newsletter à une sélection d'abonnés.

**Auth requise :** oui (admin)  
**Corps JSON :**
```json
{
  "newsletter_id": "uuid",
  "subscriber_ids": ["uuid", "..."]
}
```

---

### `send-contact-reply`
Répond à un message de contact et met à jour son statut.

**Auth requise :** oui (admin)  
**Corps JSON :**
```json
{
  "messageId": "uuid",
  "reply": "string"
}
```
**Réponse succès :** `{ "success": true }`

---

### `send-survey-code`
Envoie un code de participation à un sondage par email.

**Auth requise :** non  
**Corps JSON :**
```json
{
  "survey_id": "uuid",
  "email": "string"
}
```
**Règles :**
- L'email doit appartenir au domaine `allowed_email_domain` du sondage (défaut: `iliad-free.fr`)
- Le sondage doit être actif et dans sa période de validité

**Réponse succès :** `{ "success": true }`  
**Erreurs possibles :**
- `400` : paramètres manquants, sondage inactif, hors période, domaine invalide
- `403` : sondage réservé adhérents
- `404` : sondage introuvable

---

### `submit-external-survey-vote`
Soumet les réponses d'un sondage avec validation du code.

**Auth requise :** non  
**Corps JSON :**
```json
{
  "survey_id": "uuid",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "code": "string",
  "answers": [
    {
      "question_id": "uuid",
      "question_type": "single_choice | multiple_choice | text",
      "option_id": "uuid (si single_choice)",
      "option_ids": ["uuid"] ,
      "text_response": "string (si text)"
    }
  ]
}
```
**Réponse succès :** `{ "success": true }`

---

### `generate-adhesion-pdf`
Génère un PDF de bulletin d'adhésion pré-rempli.

**Auth requise :** non  
**Corps JSON :**
```json
{
  "nom": "string",
  "prenom": "string",
  "email": "string",
  "adresse": "string",
  "date_naissance": "ISO date string",
  "section": "string"
}
```
**Réponse succès :** `{ "pdf": "base64string", "filename": "string" }`

---

### `chat-juridique`
Assistant IA de questions juridiques syndicales.

**Auth requise :** non  
**CORS :** Restreint aux origines configurées via `ALLOWED_ORIGIN` env var  
**Corps JSON :**
```json
{
  "messages": [
    { "role": "user | assistant", "content": "string" }
  ]
}
```
**Réponse succès :** `{ "reply": "string" }`

> Fonctionne avec un système de mots-clés + fallback IA. Les sujets couverts : télétravail, arrêt maladie, harcèlement, licenciement, sanctions disciplinaires.

---

## Règles de validation des données

Ces règles s'appliquent côté web et **doivent être répliquées** côté Android :

| Entité | Champ | Règle |
|---|---|---|
| Article | `title` | 1–200 caractères |
| Article | `slug` | 1–200 car, `/^[a-z0-9-]+$/` |
| Article | `excerpt` | max 500 car |
| Article | `content` | 1–100 000 car |
| Article | `cover_image` | URL `http(s)://...` |
| News | `title` | 1–200 car |
| News | `content` | 1–100 000 car |
| Profil | `display_name` | max 100 car |
| Profil | `phone` | max 20 car, `/^[0-9\s\-+()]+$/` |
| Profil | `section` | max 100 car |
| Catégorie | `name` | 1–100 car |
| Catégorie | `slug` | 1–100 car, `/^[a-z0-9-]+$/` |
| Catégorie | `color` | `/^#[0-9a-fA-F]{6}$/` |

---

## Règles de compatibilité — Modifications à risque

| Action | Risque | Procédure recommandée |
|---|---|---|
| Renommer une colonne SQL | **CRITIQUE** — casse les deux apps | Créer une nouvelle colonne, migrer les données, déprécier l'ancienne |
| Changer un type de colonne | **CRITIQUE** | Migration additive + double écriture pendant transition |
| Supprimer une table | **CRITIQUE** | Coordination obligatoire avant de supprimer |
| Ajouter une valeur à un enum | **Moyen** — les apps ignorent les valeurs inconnues | Tester que l'Android gère les valeurs inconnues avec un fallback |
| Supprimer une valeur d'un enum | **CRITIQUE** | Ne jamais supprimer une valeur utilisée |
| Modifier la signature d'une Edge Function | **CRITIQUE** | Créer une `v2/` et maintenir l'ancienne pendant la transition |
| Ajouter une colonne nullable | **Sûr** | Compatible sans changement |
| Ajouter une colonne NOT NULL sans défaut | **CRITIQUE** | Toujours fournir une valeur DEFAULT |
| Modifier une RLS Policy | **Moyen** | Tester les deux clients (web JWT + mobile JWT) |

---

## Authentification

Les deux applications utilisent Supabase Auth avec JWT Bearer tokens.

- **Connexion** : email + password via `supabase.auth.signInWithPassword()`
- **Session** : JWT token automatiquement rafraîchi par le SDK
- **Rôles** : stockés dans la table `user_roles`, non dans le JWT — toujours interroger la table pour les vérifications de permission
- **Admin** : rôle `admin` dans `user_roles` OU session admin séparée (variable `ADMIN_PASSWORD`)

> Important : les tokens JWT générés par le SDK Android ont la même structure que ceux du web. Les RLS policies Supabase s'appliquent identiquement.

---

## Stockage Supabase (Storage)

Les documents et images sont stockés dans Supabase Storage. Les `file_path` dans la table `documents` sont des chemins relatifs au bucket.

Pour construire une URL publique :
```
https://qinekdmyycyujsrcsfbe.supabase.co/storage/v1/object/public/<bucket>/<file_path>
```

---

## Données non synchronisées (hardcodées Android)

Ces données existent uniquement en dur dans l'app Android (`FocomDataRepository.kt`) et **ne sont pas** dans Supabase. Pour les mettre à jour, il faut modifier `data/focom-content.json` dans ce dépôt web ou créer les tables Supabase correspondantes.

| Donnée | Statut actuel | Solution recommandée |
|---|---|---|
| Délégués | Hardcodé + `focom-content.json` | ✅ Déjà dans `focom-content.json` |
| Droits salariés | Hardcodé + `focom-content.json` | ✅ Déjà dans `focom-content.json` |
| Actualités | `focom-content.json` + Supabase `articles` | Les deux sources actives |
| Calculs simulateur (bonus, congés) | Logique métier Android (`SimulatorLogic.kt`) | À documenter si le web ajoute un simulateur |

---

## Endpoints REST utilisés par l'Android

L'app Android appelle Supabase via Retrofit avec ces en-têtes obligatoires sur chaque requête :

```
apikey: <SUPABASE_PUBLISHABLE_KEY>
Authorization: Bearer <SUPABASE_PUBLISHABLE_KEY>
Content-Type: application/json
```

### `GET /rest/v1/articles`

```
select=id,title,content,excerpt,category,slug,image_url,published_at,created_at
is_published=eq.true
order=published_at.desc.nullslast
```

**Réponse :** tableau de `SupabaseArticle`

### `POST /rest/v1/contact_messages`

```
Prefer: return=minimal
```

**Corps :**
```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string",
  "category": "Application Android"
}
```

> Le champ `category` est toujours `"Application Android"` — permet de distinguer les messages venant de l'app vs du site web dans le dashboard admin.

---

## Changelog des modifications majeures

| Date | Modification | Impact Android |
|---|---|---|
| 2026-01 | Création initiale (profiles, user_roles, articles, news) | — |
| 2026-04 | Ajout `site_content` | Aucun (table nouvelle) |
| 2026-05 | Ajout `permanences`, `surveys`, `newsletter_subscribers`, `reclamations` | Aucun (tables nouvelles) |
| 2026-05 | Ajout `reclamation_notifications`, migration RLS `reclamations_safe` | Vérifier les permissions lecture sur `reclamations` |

> **À compléter** à chaque migration SQL appliquée en production.
