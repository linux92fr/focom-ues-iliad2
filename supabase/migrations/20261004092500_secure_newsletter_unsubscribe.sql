-- Security fix: newsletter unsubscribe must be authorized by the opaque unsubscribe token.
-- The previous UPDATE policy used USING (true), allowing arbitrary public updates.
DROP POLICY IF EXISTS "newsletter_sub_update" ON public.newsletter_subscribers;

CREATE OR REPLACE FUNCTION public.unsubscribe_newsletter(p_token uuid)
RETURNS TABLE(email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.newsletter_subscribers
  SET is_active = false,
      unsubscribed_at = now()
  WHERE unsubscribe_token = p_token
    AND is_active = true
  RETURNING newsletter_subscribers.email;
END;
$$;

REVOKE ALL ON FUNCTION public.unsubscribe_newsletter(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unsubscribe_newsletter(uuid) TO anon, authenticated;
