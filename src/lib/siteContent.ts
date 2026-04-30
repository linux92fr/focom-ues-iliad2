import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteContentRecord<T> = {
  title: string;
  subtitle: string;
  content: T;
};

export const defaultSiteContent = {
  bilan_mandat: {
    title: "BILAN DE MANDAT 2021 - 2024",
    subtitle: "3 annees d'actions au service de tous les salaries",
    content: {
      stats: [
        { value: "42", label: "Accords signes et ameliores", icon: "handshake", color: "secondary" },
        { value: "78", label: "Reunions de negociation", icon: "users", color: "primary" },
        { value: "126", label: "Dossiers individuels accompagnes", icon: "file", color: "secondary" },
        { value: "100%", label: "Presents a vos cotes", icon: "check", color: "primary" },
      ],
      progress: [
        { label: "Pouvoir d'achat", val: 85 },
        { label: "Conditions de travail", val: 90 },
        { label: "Egalite professionnelle", val: 75 },
        { label: "Gestion des emplois", val: 80 },
        { label: "Qualite de vie au travail", val: 70 },
      ],
      engagementTitle: "Notre engagement",
      engagementText: "Transparence, ecoute et action : notre priorite, c'est vous.",
    },
  },
  espace_adherent: {
    title: "ESPACE ADHERENT",
    subtitle: "Un espace structure pour les adherents et l'administration du site.",
    content: {
      items: [
        { title: "Documents", desc: "Modeles, accords et ressources utiles", icon: "file" },
        { title: "Avantages", desc: "Informations reservees aux adherents", icon: "users" },
        { title: "Rendez-vous", desc: "Demander un echange avec un elu FOCOM", icon: "calendar" },
        { title: "Questions", desc: "Solliciter un accompagnement personnalise", icon: "message" },
        { title: "Contacts", desc: "Identifier les bons interlocuteurs", icon: "mail" },
        { title: "Administration", desc: "Gestion des contenus et des comptes autorises", icon: "shield" },
      ],
    },
  },
  combats: {
    title: "NOS COMBATS, VOS DROITS",
    subtitle: "La FOCOM agit chaque jour pour defendre vos droits",
    content: {
      columns: [
        {
          title: "Defendre",
          sub: "Nous defendons vos droits individuels et collectifs",
          icon: "shield",
          items: ["Respect des accords", "Egalite & non-discrimination", "Sante & securite", "Droit a la deconnexion"],
        },
        {
          title: "Negocier",
          sub: "Nous negocions pour ameliorer vos conditions de travail",
          icon: "message",
          items: ["Salaires & primes", "Teletravail", "Organisation du temps de travail", "Formation"],
        },
        {
          title: "Agir ensemble",
          sub: "La solidarite est notre force",
          icon: "sparkles",
          items: ["Mobilisations", "Actions collectives", "Ecoute & proximite", "Informations regulieres"],
        },
      ],
    },
  },
  contact_strip: {
    title: "Une question ? Besoin d'aide ?",
    subtitle: "Les elus FOCOM sont a votre ecoute.",
    content: {
      phone: "01 87 15 43 11",
      phoneNote: "Appel non surtaxe",
      email: "contact@focom-iliad.fr",
      emailNote: "Nous vous repondons rapidement",
      buttonLabel: "Nous contacter",
    },
  },
} satisfies Record<string, SiteContentRecord<unknown>>;

export type SiteContentKey = keyof typeof defaultSiteContent;

export function useSiteContent<T extends SiteContentKey>(key: T) {
  const fallback = defaultSiteContent[key];
  const [section, setSection] = useState(fallback);

  useEffect(() => {
    let mounted = true;

    const fetchSection = async () => {
      const { data, error } = await (supabase as any)
        .from("site_content")
        .select("title, subtitle, content")
        .eq("key", key)
        .maybeSingle();

      if (!mounted || error || !data) return;

      setSection({
        title: data.title || fallback.title,
        subtitle: data.subtitle || fallback.subtitle,
        content: data.content || fallback.content,
      } as typeof fallback);
    };

    fetchSection();

    return () => {
      mounted = false;
    };
  }, [fallback, key]);

  return section;
}
