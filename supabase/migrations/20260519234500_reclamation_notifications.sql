-- Notifications automatiques pour le suivi des reclamations

CREATE OR REPLACE FUNCTION notify_reclamation_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO notifications (user_id, title, message, type, link, is_read, archived)
    VALUES (
      NEW.user_id,
      'Reclamation mise a jour',
      'Le statut de votre reclamation a ete mis a jour.',
      'info',
      '/mes-reclamations',
      false,
      false
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_reclamation_status_change ON reclamations;
CREATE TRIGGER trg_notify_reclamation_status_change
AFTER UPDATE OF status ON reclamations
FOR EACH ROW
EXECUTE FUNCTION notify_reclamation_status_change();

CREATE OR REPLACE FUNCTION notify_reclamation_admin_message()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  rec_user_id uuid;
BEGIN
  IF NEW.is_admin IS TRUE THEN
    SELECT user_id INTO rec_user_id FROM reclamations WHERE id = NEW.reclamation_id;
    IF rec_user_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, type, link, is_read, archived)
      VALUES (
        rec_user_id,
        'Nouvelle reponse a votre reclamation',
        'Un representant FO COM a repondu a votre reclamation.',
        'info',
        '/mes-reclamations',
        false,
        false
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_reclamation_admin_message ON reclamation_messages;
CREATE TRIGGER trg_notify_reclamation_admin_message
AFTER INSERT ON reclamation_messages
FOR EACH ROW
EXECUTE FUNCTION notify_reclamation_admin_message();
