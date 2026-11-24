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
   `nouvelle_actualite` et `nouvel_evenement`, langue `fr`, catégorie UTILITY,
   avec 2 **variables nommées** dans le corps :
   `{{title}}` = titre, `{{url}}` = lien. Exemple de corps :
   `Nouvelle actualité FO COM : {{title}} — à lire ici : {{url}}`.
   Règles de format des variables (sinon rejet immédiat « pas au bon format ») :
   - **un seul style par template** : nommé (`{{title}}`) OU numéroté (`{{1}}`), jamais mélangé ;
   - nom en **minuscules + tirets bas uniquement**, entre **doubles accolades**, **sans espace** à l'intérieur ;
   - variables numérotées sans trou (1, 2, 3…) ; nommées : chaque nom unique ;
   - **valeur d'exemple obligatoire** pour chaque variable à la création ;
   - le corps ne doit ni commencer ni finir par une variable, et deux variables
     ne doivent pas être collées (`{{a}}{{b}}` est rejeté).
   La fonction envoie les paramètres nommés (`parameter_name: "title"` / `"url"`).
   Pour les tests, le modèle `hello_world` est pré-approuvé (1 paramètre).
   **Catégorie obligatoire : UTILITY (« Utilitaire »)** — jamais MARKETING.
   Meta arrête les messages marketing sur la Cloud API le 13/10/2027 ; les messages
   utility/service (nos notifications) restent supportés indéfiniment. Un contenu
   promotionnel ferait reclasser le template en marketing et l'envoi échouerait
   après le sunset (voire avant, en cas de reclassification).
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
- Envoi par **modèle approuvé de catégorie UTILITY** uniquement (contrainte Meta
  hors fenêtre 24 h ; les templates MARKETING ne sont plus supportés sur la Cloud
  API à partir du 13/10/2027).
- Numéros au format E.164 stockés dans `notification_preferences.whatsapp_number`.
- Les envois échoués sont tracés dans `whatsapp_notifications` (réponse Graph incluse).
