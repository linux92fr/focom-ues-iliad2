import { useRef } from "react";
import { Download, ShieldCheck, Star, Hash, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  memberSince?: string;
  accessKey?: string | null;
  avatarUrl?: string | null;
}

const statusLabel: Record<string, string> = {
  actif: "Adhérent actif",
  inactif: "Adhérent inactif",
  suspendu: "Suspendu",
};

const statusColor: Record<string, string> = {
  actif: "bg-green-500",
  inactif: "bg-slate-400",
  suspendu: "bg-amber-500",
};

export default function CarteAdherent({
  firstName,
  lastName,
  email,
  status,
  memberSince,
  accessKey,
  avatarUrl,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const initials = ((firstName?.charAt(0) || "") + (lastName?.charAt(0) || ""))
    .toUpperCase() || email.substring(0, 2).toUpperCase();

  const formattedSince = memberSince
    ? new Date(memberSince).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : null;

  const handlePrint = () => {
    const card = cardRef.current;
    if (!card) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carte adhérent FOCOM</title>
          <style>
            body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; background: #f1f5f9; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            .card { width: 380px; background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: white; border-radius: 16px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
            .logo { font-size: 11px; font-weight: 800; letter-spacing: 3px; opacity: 0.8; margin-bottom: 20px; text-transform: uppercase; }
            .avatar { width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 16px; border: 3px solid rgba(255,255,255,0.4); overflow: hidden; }
            .avatar img { width: 100%; height: 100%; object-fit: cover; }
            .name { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
            .email { font-size: 12px; opacity: 0.7; margin-bottom: 16px; }
            .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 20px; }
            .dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; }
            .info { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 16px; }
            .info-row { display: flex; align-items: center; gap: 8px; font-size: 12px; opacity: 0.85; }
            .footer { margin-top: 16px; font-size: 9px; opacity: 0.5; text-align: center; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">FO COM · UES ILIAD</div>
            <div class="avatar">${avatarUrl ? `<img src="${avatarUrl}" />` : initials}</div>
            <div class="name">${firstName} ${lastName}</div>
            <div class="email">${email}</div>
            <div class="badge"><div class="dot" style="background:${status === "actif" ? "#4ade80" : "#94a3b8"}"></div>${statusLabel[status] || status}</div>
            <div class="info">
              ${formattedSince ? `<div class="info-row">Membre depuis ${formattedSince}</div>` : ""}
              ${accessKey ? `<div class="info-row">Clé : ${accessKey}</div>` : ""}
            </div>
            <div class="footer">SYNDICAT FO COMMUNICATIONS · UES ILIAD · ${new Date().getFullYear()}</div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Carte visuelle */}
      <div
        ref={cardRef}
        className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          minHeight: 220,
        }}
      >
        {/* Motif décoratif */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />

        <div className="relative p-6 text-white">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase opacity-80">
              FO COM · UES ILIAD
            </span>
            <ShieldCheck className="w-5 h-5 opacity-60" />
          </div>

          {/* Avatar + nom */}
          <div className="flex items-center gap-4 mb-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-white/40 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xl font-bold flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight">
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Adhérent"}
              </p>
              <p className="text-xs opacity-70 truncate">{email}</p>
            </div>
          </div>

          {/* Badge statut */}
          <div className="flex items-center gap-1.5 mb-4">
            <span className={`w-2 h-2 rounded-full ${statusColor[status] || "bg-slate-400"}`} />
            <span className="text-xs font-semibold">{statusLabel[status] || status}</span>
          </div>

          {/* Infos */}
          <div className="border-t border-white/15 pt-3 flex flex-col gap-1.5 text-xs opacity-80">
            {formattedSince && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>Membre depuis {formattedSince}</span>
              </div>
            )}
            {accessKey && (
              <div className="flex items-center gap-2">
                <Hash className="w-3 h-3" />
                <span className="font-mono">{accessKey}</span>
              </div>
            )}
          </div>
        </div>

        {/* Étoiles décoratives */}
        <Star className="absolute bottom-4 right-5 w-3 h-3 text-white/20" fill="white" />
        <Star className="absolute bottom-8 right-10 w-2 h-2 text-white/15" fill="white" />
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
          <Download className="w-4 h-4" />
          Télécharger / Imprimer
        </Button>
      </div>

      {/* Légende statuts */}
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          Votre carte adhérent FOCOM UES Iliad — valide tant que votre adhésion est active.
        </p>
        {status !== "actif" && (
          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
            <User className="w-3 h-3 mr-1" />
            Statut : {statusLabel[status] || status} — contactez un délégué pour régulariser.
          </Badge>
        )}
      </div>
    </div>
  );
}
