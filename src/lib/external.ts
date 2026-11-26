// Chargement des ressources externes (polices Google, notifications push PushEngage).
// Ce module garde index.html minimal : tout est initialisé ici au démarrage de l'application.
// Le code se retrouve dans le bundle minifié au lieu d'être lisible dans le code source de la page.

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700;800&family=Public+Sans:wght@400;500;600;700;800&display=swap";

const PUSHENGAGE_APP_ID = "8deac885-6ceb-4a88-a9f5-2c325f357126";
const PUSHENGAGE_SDK_URL = "https://clientcdn.pushengage.com/sdks/pushengage-web-sdk.js";

type PushEngageQueue = unknown[];

function loadFonts(): void {
  // Preload puis feuille de style non bloquante (media print -> all une fois chargée),
  // identique à l'ancien motif présent dans index.html.
  const preload = document.createElement("link");
  preload.rel = "preload";
  preload.as = "style";
  preload.href = FONTS_URL;
  document.head.appendChild(preload);

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = FONTS_URL;
  stylesheet.media = "print";
  stylesheet.onload = () => {
    stylesheet.media = "all";
  };
  document.head.appendChild(stylesheet);
}

function initPushEngage(): void {
  const w = window as unknown as { PushEngage?: PushEngageQueue; _peq?: PushEngageQueue };
  w.PushEngage = w.PushEngage || [];
  w._peq = w._peq || [];
  w.PushEngage.push(["init", { appId: PUSHENGAGE_APP_ID }]);

  const script = document.createElement("script");
  script.src = PUSHENGAGE_SDK_URL;
  script.async = true;
  document.head.appendChild(script);
}

loadFonts();
initPushEngage();
