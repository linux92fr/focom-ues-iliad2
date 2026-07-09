// Préfixe de l'espace admin, configurable via VITE_ADMIN_PREFIX dans .env
// Par défaut "admin" — changer pour obscurcir les routes en production
export const ADMIN_BASE = import.meta.env.VITE_ADMIN_PREFIX ?? "admin";

// Construit un chemin admin : adminPath("/adherents") → "/ges-fo/adherents"
export const adminPath = (sub = "") => `/${ADMIN_BASE}${sub}`;
