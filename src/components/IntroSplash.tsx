import { useEffect, useState } from "react";
import introBanner from "@/assets/intro-banner.jpeg";

const STORAGE_KEY = "focom_intro_seen";
const DISPLAY_MS = 3500;
const FADE_MS = 800;

const IntroSplash = () => {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (seen) return;
    setShow(true);
    requestAnimationFrame(() => setMounted(true));

    const fadeTimer = setTimeout(() => setFadeOut(true), DISPLAY_MS);
    const hideTimer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, DISPLAY_MS + FADE_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  const skip = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShow(false);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, FADE_MS);
  };

  return (
    <div
      onClick={skip}
      role="button"
      aria-label="Passer l'introduction"
      className={`fixed inset-0 z-[100] bg-white flex items-center justify-center cursor-pointer overflow-hidden transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {/* Background image with subtle zoom */}
      <img
        src={introBanner}
        alt="FOCOM UES ILIAD - 4 ans de combat pour vos droits"
        className="absolute inset-0 w-full h-full object-contain md:object-cover"
        style={{
          transform: mounted ? "scale(1.05)" : "scale(1)",
          transition: `transform 4000ms ease-out`,
        }}
      />

      {/* Sweep light effect */}
      <div
        className="absolute inset-y-0 w-1/3 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
          transform: mounted ? "translateX(400%)" : "translateX(-100%)",
          transition: "transform 1800ms cubic-bezier(0.22, 1, 0.36, 1) 600ms",
        }}
      />

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
        <div
          className="h-full bg-primary"
          style={{
            width: mounted ? "100%" : "0%",
            transition: `width ${DISPLAY_MS}ms linear`,
          }}
        />
      </div>

      {/* Skip hint */}
      <div
        className="absolute top-4 right-4 md:top-6 md:right-6 text-xs font-semibold text-foreground/60 bg-white/80 px-3 py-1.5 rounded-full backdrop-blur-sm"
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 500ms ease 1500ms",
        }}
      >
        Cliquez pour passer →
      </div>
    </div>
  );
};

export default IntroSplash;
