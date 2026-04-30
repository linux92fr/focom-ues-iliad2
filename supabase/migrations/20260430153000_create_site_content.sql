CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content is publicly readable"
ON public.site_content FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Content editors can manage site content"
ON public.site_content FOR ALL
TO authenticated
USING (public.is_content_editor(auth.uid()))
WITH CHECK (public.is_content_editor(auth.uid()));

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_content (key, title, subtitle, content)
VALUES
  (
    'bilan_mandat',
    'BILAN DE MANDAT 2021 - 2024',
    '3 annees d''actions au service de tous les salaries',
    '{
      "stats": [
        { "value": "42", "label": "Accords signes et ameliores", "icon": "handshake", "color": "secondary" },
        { "value": "78", "label": "Reunions de negociation", "icon": "users", "color": "primary" },
        { "value": "126", "label": "Dossiers individuels accompagnes", "icon": "file", "color": "secondary" },
        { "value": "100%", "label": "Presents a vos cotes", "icon": "check", "color": "primary" }
      ],
      "progress": [
        { "label": "Pouvoir d''achat", "val": 85 },
        { "label": "Conditions de travail", "val": 90 },
        { "label": "Egalite professionnelle", "val": 75 },
        { "label": "Gestion des emplois", "val": 80 },
        { "label": "Qualite de vie au travail", "val": 70 }
      ],
      "engagementTitle": "Notre engagement",
      "engagementText": "Transparence, ecoute et action : notre priorite, c''est vous."
    }'::jsonb
  ),
  (
    'espace_adherent',
    'ESPACE ADHERENT',
    'Un espace structure pour les adherents et l''administration du site.',
    '{
      "items": [
        { "title": "Documents", "desc": "Modeles, accords et ressources utiles", "icon": "file" },
        { "title": "Avantages", "desc": "Informations reservees aux adherents", "icon": "users" },
        { "title": "Rendez-vous", "desc": "Demander un echange avec un elu FOCOM", "icon": "calendar" },
        { "title": "Questions", "desc": "Solliciter un accompagnement personnalise", "icon": "message" },
        { "title": "Contacts", "desc": "Identifier les bons interlocuteurs", "icon": "mail" },
        { "title": "Administration", "desc": "Gestion des contenus et des comptes autorises", "icon": "shield" }
      ]
    }'::jsonb
  ),
  (
    'combats',
    'NOS COMBATS, VOS DROITS',
    'La FOCOM agit chaque jour pour defendre vos droits',
    '{
      "columns": [
        {
          "title": "Defendre",
          "sub": "Nous defendons vos droits individuels et collectifs",
          "icon": "shield",
          "items": ["Respect des accords", "Egalite & non-discrimination", "Sante & securite", "Droit a la deconnexion"]
        },
        {
          "title": "Negocier",
          "sub": "Nous negocions pour ameliorer vos conditions de travail",
          "icon": "message",
          "items": ["Salaires & primes", "Teletravail", "Organisation du temps de travail", "Formation"]
        },
        {
          "title": "Agir ensemble",
          "sub": "La solidarite est notre force",
          "icon": "sparkles",
          "items": ["Mobilisations", "Actions collectives", "Ecoute & proximite", "Informations regulieres"]
        }
      ]
    }'::jsonb
  ),
  (
    'contact_strip',
    'Une question ? Besoin d''aide ?',
    'Les elus FOCOM sont a votre ecoute.',
    '{
      "phone": "01 87 15 43 11",
      "phoneNote": "Appel non surtaxe",
      "email": "contact@focom-iliad.fr",
      "emailNote": "Nous vous repondons rapidement",
      "buttonLabel": "Nous contacter"
    }'::jsonb
  )
ON CONFLICT (key) DO NOTHING;
