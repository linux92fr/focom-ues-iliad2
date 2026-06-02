import { Clock, Mail, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logoFocom from "@/assets/logo-focom.png";

export default function ProfilEnAttente() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-8 text-center space-y-5">
        <img src={logoFocom} alt="FOCOM" className="h-14 w-14 object-contain mx-auto" />

        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7 text-amber-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">Compte en attente de validation</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Votre inscription a bien été enregistrée. Un administrateur va vérifier votre profil et activer votre accès dans les meilleurs délais.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Ce que vous pouvez faire :</p>
          <ul className="text-sm text-amber-700 space-y-1">
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 shrink-0" /> Consulter les pages publiques du site</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" /> Nous contacter via le formulaire</li>
          </ul>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Compte enregistré</p>
          <p className="text-sm text-slate-700 font-medium">{user?.email}</p>
        </div>

        <p className="text-xs text-slate-400">
          Vous recevrez un email dès que votre compte sera activé.
        </p>

        <Button variant="outline" size="sm" onClick={signOut} className="gap-2 w-full">
          <LogOut className="w-4 h-4" /> Se déconnecter
        </Button>
      </div>
    </div>
  );
}
