# send-contact-reply

Fonction Supabase Edge pour envoyer par email une réponse admin à un message reçu via le formulaire de contact.

## Variables nécessaires

À configurer dans Supabase :

```bash
supabase secrets set RESEND_API_KEY="re_xxxxxxxxx"
supabase secrets set CONTACT_REPLY_FROM="FO COM UES ILIAD <contact@focomues-iliad.fr>"
```

Supabase fournit automatiquement :

```bash
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

## Déploiement

```bash
supabase functions deploy send-contact-reply
```

## Payload attendu

```json
{
  "messageId": "uuid-du-message",
  "reply": "Texte de la réponse"
}
```

## Comportement

1. Vérifie que l'utilisateur est connecté.
2. Vérifie que l'utilisateur a un rôle `admin`, `secretaire` ou `representant`.
3. Récupère le message dans `contact_messages`.
4. Envoie l'email avec Resend.
5. Met à jour `contact_messages` avec :
   - `status = repondu`
   - `admin_reply`
   - `replied_at`

## Prochaine étape front

Remplacer dans `src/pages/admin/AdminMessages.tsx` la mise à jour directe Supabase par :

```ts
await supabase.functions.invoke("send-contact-reply", {
  body: {
    messageId: modal.item.id,
    reply: replyText.trim(),
  },
});
```
