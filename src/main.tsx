import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Diagnostic temporaire et opt-in : ajouter ?perf-debug=1 à l'URL.
// Les tâches longues (> 50 ms) sont alors signalées dans la console,
// sans modifier le comportement normal du site.
if (
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("perf-debug") === "1"
) {
  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn("[FO COM perf] Tâche longue détectée", {
            durationMs: Math.round(entry.duration),
            startTimeMs: Math.round(entry.startTime),
            name: entry.name,
            attribution: "attribution" in entry ? (entry as PerformanceEntry & { attribution?: unknown }).attribution : undefined,
          });
        }
      });
      observer.observe({ type: "longtask", buffered: true });
      console.info("[FO COM perf] Diagnostic actif : tâches longues > 50 ms.");
    } catch (error) {
      console.warn("[FO COM perf] API Long Tasks indisponible.", error);
    }
  } else {
    console.info("[FO COM perf] Ce navigateur ne prend pas en charge Long Tasks.");
  }
}

createRoot(document.getElementById("root")!).render(<App />);
