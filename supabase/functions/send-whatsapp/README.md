# send-whatsapp — notifications WhatsApp (compte Business dédié)

Envoie une notification WhatsApp via l'**API WhatsApp Business Cloud** (compte/numéro
WhatsApp propre) aux adhérents ayant activé `notify_whatsapp` dans
`notification_preferences` (avec `notify_articles` pour les actualités,
`notify_actions` pour l'agenda).

Appel (depuis l'admin du site, bouton « Notifier WhatsApp ») :

```
POST /functions/v1/send-whatsapp
{ "kind": "article" | "event", "id": "<uuid>" }
```

Réponse : `{ kind, title, url, template, sent, failed, total }`.
Chaque tentative est journalisée dans la table `whatsapp_notifications`.

## Configuration requise (aucune valeur secrète dans le dépôt)

1. **Meta Business** : créer une app sur https://developers.facebook.com → ajouter le
   produit **WhatsApp** → y rattacher le **numéro WhatsApp dédié** du syndicat
   (Settings → WhatsApp → Phone Numbers). Noter le **Phone Number ID**.
2. **Jeton système** : créer un System User avec la permission
   `whatsapp_business_messaging` et générer un **token permanent**.
3. **Modèles de message (templates)** : hors fenêtre de 24 h, Meta exige un modèle
   approuvé. Créer dans Business Manager (WhatsApp → Message Templates) par ex.
   `nouvelle_actualite` et `nouvel_evenement` avec 2 paramètres texte
   (`{{1}}` = titre, `{{2}}` = URL), langue `fr`, puis attendre l'approbation.
   Pour les tests, le modèle `hello_world` est pré-approuvé (1 paramètre).
4. **Secrets Supabase** (dashboard → Project Settings → Edge Functions → Secrets,
   ou `supabase secrets set`) :
   - `WHATSAPP_ACCESS_TOKEN` = token du System User
   - `WHATSAPP_PHONE_NUMBER_ID` = Phone Number ID
   - `WHATSAPP_API_VERSION` = `v22.0` (optionnel, défaut v22.0)
   - `WHATSAPP_TEMPLATE_ARTICLE` = `nouvelle_actualite` (optionnel)
   - `WHATSAPP_TEMPLATE_EVENT` = `nouvel_evenement` (optionnel)
   - `PUBLIC_SITE_URL` = URL publique du site (ex. `https://beta.focomues-iliad.fr`)
5. **Déploiement** : `supabase functions deploy send-whatsapp`

## Garde-fous

- Appel réservé aux rôles `admin, secretaire, representant, redacteur` (vérifié via JWT).
- Envoi par **modèle approuvé** uniquement (contrainte Meta hors fenêtre 24 h).
- Numéros au format E.164 stockés dans `notification_preferences.whatsapp_number`.
- Les envois échoués sont tracés dans `whatsapp_notifications` (réponse Graph incluse).
