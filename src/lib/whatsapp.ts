const SITE_NAME = "FO COM UES ILIAD";

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function openWhatsAppShare(text: string): void {
  window.open(whatsappShareUrl(text), "_blank", "noopener,noreferrer");
}

export interface WhatsAppEventData {
  title: string;
  description?: string | null;
  location?: string | null;
  start_date: string;
  end_date?: string | null;
  all_day?: boolean;
}

export function buildEventShareText(event: WhatsAppEventData, pageUrl: string): string {
  const date = new Date(event.start_date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = !event.all_day
    ? ` à ${new Date(event.start_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
    : "";

  const lines = [
    `📅 ${event.title}`,
    `${date.charAt(0).toUpperCase() + date.slice(1)}${time}`,
  ];
  if (event.location) lines.push(`📍 ${event.location}`);
  if (event.description) lines.push(event.description);
  lines.push(`Plus d'infos sur l'agenda ${SITE_NAME} : ${pageUrl}`);
  return lines.join("\n");
}

export interface WhatsAppArticleData {
  title: string;
  excerpt?: string | null;
}

export function buildArticleShareText(article: WhatsAppArticleData, articleUrl: string): string {
  const lines = [`📰 ${article.title}`];
  if (article.excerpt) lines.push(article.excerpt);
  lines.push(`Lire l'article complet sur ${SITE_NAME} : ${articleUrl}`);
  return lines.join("\n");
}

export function normalizeWhatsAppNumber(value: string): string {
  return value.replace(/[\s.-]/g, "").trim();
}

export function isValidWhatsAppNumber(value: string): boolean {
  return /^\+?[0-9]{8,15}$/.test(normalizeWhatsAppNumber(value));
}
