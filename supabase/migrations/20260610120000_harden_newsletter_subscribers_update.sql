-- ═══════════════════════════════════════════════════════════════
--  Sécurité : durcissement des UPDATE sur newsletter_subscribers
-- ═══════════════════════════════════════════════════════════════
--
--  Problème : la policy "newsletter_sub_update" utilise USING (true),
--  ce qui autorise n'importe quel visiteur (anon) ou utilisateur
--  authentifié à modifier N'IMPORTE QUELLE ligne de la table, y compris
--  l'adresse email et le jeton de désabonnement (vandalisme / vol de
--  jeton). Or le flux légitime (désabonnement par token, réabonnement)
--  ne modifie jamais que les colonnes is_active et unsubscribed_at.
--
--  Correctif : restreindre l'UPDATE au niveau colonne. anon et
--  authenticated ne peuvent plus modifier que is_active et
--  unsubscribed_at ; email et unsubscribe_token deviennent immuables
--  pour eux. Les opérations admin (toggle is_active) et la RPC
--  regenerate_unsubscribe_token (SECURITY DEFINER) restent fonctionnelles.

REVOKE UPDATE ON public.newsletter_subscribers FROM anon, authenticated;

GRANT UPDATE (is_active, unsubscribed_at)
  ON public.newsletter_subscribers
  TO anon, authenticated;
