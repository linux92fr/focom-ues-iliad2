import { useLocation } from "react-router-dom";
import Home from "./Home";
import HomePreview from "./HomePreview";

/** Choisit explicitement la maquette sans modifier l'accueil de production. */
export default function Landing() {
  const location = useLocation();
  return new URLSearchParams(location.search).get("preview") === "maquette"
    ? <HomePreview />
    : <Home />;
}
