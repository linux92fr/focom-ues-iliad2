import { Link } from "react-router-dom";
import logoFocom from "@/assets/logo-focom.png";

export default function PageHeader() {
  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
      <div className="px-4 h-14 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoFocom} alt="FOCOM" className="w-9 h-9 object-contain" />
          <div className="leading-none">
            <div className="font-display font-black text-primary text-base leading-none">FOCOM</div>
            <div className="font-display font-black text-secondary text-sm leading-none mt-0.5">UES ILIAD</div>
          </div>
        </Link>
      </div>
    </header>
  );
}
