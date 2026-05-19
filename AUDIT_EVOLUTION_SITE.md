# Audit et plan d'évolution — FOCOM UES ILIAD 2

## Objectif du repository

Ce repository doit devenir le portail avancé FOCOM UES ILIAD : site public enrichi, espace adhérent, dashboard admin, gestion de contenu, réclamations, permanences, newsletter, sondages, documents et synchronisation avec le site public existant.

Les deux sites partagent le même projet Supabase et la même base de données. Ce repository doit donc être pensé comme le centre d'administration et de pilotage des données communes.

---

## Identité visuelle validée

La couleur bleu/vert actuellement présente fait partie de l'identité du syndicat et doit être conservée.

### Rôle des couleurs

- Rouge FO : mobilisation, alerte, NAO, élections, revendications, CTA principal.
- Bleu/vert : confiance, accompagnement, espace adhérent, services, documents, droits, dashboard.
- Slate / blanc : structure, lisibilité, fonds neutres, administration.

### Palette recommandée

- Rouge principal : `#dc2626`
- Rouge foncé : `#991b1b`
- Bleu/vert principal : `#0d9488`
- Bleu/vert foncé : `#0f766e`
- Bleu/vert clair : `#ccfbf1`
- Fond clair : `#f8fafc`
- Texte principal : `#0f172a`
- Texte secondaire : `#64748b`

---

## Audit rapide du projet actuel

### Stack technique

Le projet repose sur :

- Vite
- React 18
- TypeScript
- Tailwind CSS
- shadcn / Radix UI
- Supabase
- React Query
- Recharts
- TipTap
- React Router

Cette base est adaptée pour un site portail avec espace admin complet.

### Points forts

- Nombreuses routes déjà en place.
- Dashboard admin existant.
- Authentification Supabase présente.
- Gestion des rôles via `user_roles`.
- Modules déjà prévus : actualités, documents, adhérents, messages, permanences, sondages, newsletter, réclamations, paramètres, accueil éditable.
- Connexion au même Supabase que l'autre site.

### Points faibles actuels

- Dashboard partiellement fictif : certains compteurs, graphiques et activités sont codés en dur.
- Accueil très riche mais pas assez hiérarchisé.
- Couleurs parfois utilisées sans rôle clair.
- Plusieurs images externes génériques doivent être remplacées ou mieux cadrées.
- Certaines données devraient être centralisées dans Supabase pour être partagées entre les deux sites.
- Il faut confirmer les policies RLS Supabase.
- La configuration Supabase doit passer par variables `.env`.

---

## Répartition entre les deux sites

### Site 1 — `focom-actu-espace`

Rôle recommandé : site public vitrine et communication rapide.

Contenus :

- Actualités publiques
- Représentants
- Tracts et communications
- Informations salariés
- Pages syndicales essentielles

### Site 2 — `focom-ues-iliad2`

Rôle recommandé : portail avancé et administration.

Contenus :

- Dashboard admin
- Gestion des articles
- Gestion des documents
- Gestion adhérents
- Réclamations
- Permanences
- Sondages
- Newsletter
- Agenda
- Notifications
- Édition de contenus dynamiques

---

## Synchronisation Supabase

Les deux sites doivent lire les mêmes tables lorsque c'est pertinent.

Tables à utiliser ou vérifier :

- `articles`
- `documents`
- `profiles`
- `user_roles`
- `contact_messages`
- `newsletter_subscribers`
- `notifications`
- `site_content`
- `events`
- `reclamations`
- `permanences`
- `sondages`
- `activity_log`
- `representants`

### Recommandation importante

Créer ou consolider une table `representants` pour ne plus coder les représentants en dur dans chaque site.

Champs proposés :

```sql
id uuid primary key default gen_random_uuid(),
nom text not null,
poste text,
service text,
email text,
telephone text,
mandat text,
photo_url text,
ordre integer default 0,
is_active boolean default true,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

---

## Dashboard admin — objectif cible

Le dashboard doit devenir le vrai centre de pilotage.

### Compteurs dynamiques à afficher

- Adhérents actifs
- Nouveaux adhérents sur 30 jours
- Articles publiés
- Articles brouillons
- Documents publiés
- Messages non lus
- Réclamations ouvertes
- Permanences à venir
- Sondages actifs
- Abonnés newsletter

### Graphiques utiles

- Inscriptions newsletter par mois
- Messages / réclamations par mois
- Articles publiés par mois
- Documents ajoutés par mois
- Sondages actifs / clôturés

### Activité récente

Créer une table `activity_log` pour remplacer les activités codées en dur.

Champs proposés :

```sql
id uuid primary key default gen_random_uuid(),
user_id uuid references auth.users(id),
action text not null,
entity_type text not null,
entity_id uuid,
metadata jsonb default '{}'::jsonb,
created_at timestamptz default now()
```

Exemples d'activité :

- Article publié
- Document ajouté
- Message reçu
- Réclamation ouverte
- Permanence créée
- Sondage publié
- Newsletter envoyée

---

## Plan d'action détaillé

### Phase 1 — Stabilisation technique

Objectif : s'assurer que le projet build proprement et qu'il est prêt pour l'évolution.

Actions :

1. Ajouter `.nvmrc` avec Node 22.
2. Ajouter `engines.node` dans `package.json`.
3. Passer Supabase en variables `.env` :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Vérifier `npm install`.
5. Vérifier `npm run build`.
6. Vérifier les routes principales.
7. Vérifier que les deux sites utilisent bien le même projet Supabase.

### Phase 2 — Audit Supabase et RLS

Objectif : sécuriser et fiabiliser les données partagées.

Actions :

1. Lister toutes les tables utilisées par le front.
2. Vérifier les RLS policies.
3. Vérifier les droits par rôle : admin, secretaire, representant, redacteur, tresorier.
4. Vérifier les accès publics : articles publiés, documents publics, événements publics.
5. Vérifier les accès privés : profil, réclamations, adhérents, messages.

### Phase 3 — Dashboard fonctionnel

Objectif : supprimer les données fictives du dashboard.

Actions :

1. Remplacer les compteurs statiques par des requêtes Supabase.
2. Remplacer les graphiques statiques par des agrégations.
3. Connecter les messages non lus.
4. Connecter les réclamations ouvertes.
5. Connecter newsletter, documents, articles, permanences et sondages.
6. Ajouter une vraie activité récente via `activity_log`.
7. Mettre à jour ou supprimer les éléments liés aux élections passées.

### Phase 4 — Harmonisation design

Objectif : conserver l'identité rouge + bleu/vert en clarifiant leur rôle.

Actions :

1. Refaire le hero avec rouge FO + bleu/vert maîtrisé.
2. Unifier les cartes.
3. Réduire les couleurs concurrentes.
4. Remplacer les images génériques si nécessaire.
5. Revoir le responsive mobile.
6. Clarifier les CTA.
7. Rendre l'espace adhérent plus lisible.

### Phase 5 — Modules fonctionnels

Objectif : rendre chaque module exploitable par le syndicat.

Modules prioritaires :

1. Messages de contact
2. Réclamations
3. Newsletter
4. Documents
5. Actualités
6. Permanences
7. Sondages
8. Agenda
9. Profil adhérent
10. Gestion des rôles

Chaque module doit avoir :

- une page publique si nécessaire
- une page admin
- une insertion Supabase
- une lecture admin
- un changement de statut
- une notification ou un log d'activité
- des droits RLS cohérents

### Phase 6 — Synchronisation avec le site public

Objectif : éviter les doublons entre les deux repositories.

Actions :

1. Identifier les tables communes.
2. Définir quel site édite chaque type de donnée.
3. Faire lire les actualités et documents du même Supabase.
4. Centraliser les représentants dans Supabase.
5. Prévoir une table `site_content` avec des clés distinctes par site.

Exemples de clés `site_content` :

- `site1_home_hero`
- `site1_footer`
- `site2_home_hero`
- `site2_dashboard_notice`
- `shared_contact_info`

---

## Ordre de réalisation conseillé

1. Stabilisation Node 22 + `.env` Supabase.
2. Build local / Codespaces.
3. Audit des tables Supabase utilisées.
4. Correction du dashboard admin.
5. Création de `activity_log`.
6. Centralisation des représentants.
7. Harmonisation design rouge + bleu/vert.
8. Finalisation des modules réclamations, permanences, sondages, newsletter.
9. Tests mobile et accessibilité.
10. Déploiement propre.

---

## Première intervention technique recommandée

Commencer par :

1. Ajouter `.nvmrc`.
2. Ajouter `engines` dans `package.json`.
3. Créer `.env.example`.
4. Modifier `src/integrations/supabase/client.ts` pour lire les variables Vite.
5. Vérifier le build.

Ensuite seulement : refactoriser le dashboard pour remplacer les données fictives par Supabase.
