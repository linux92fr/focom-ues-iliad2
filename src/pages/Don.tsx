import { Heart, Shield, Users, CreditCard } from "lucide-react";

const AMOUNTS = [5, 10, 20, 50];

/**
 * Page de don — redirige vers PayPal sans dépendance SDK.
 * Pour activer les paiements en ligne, configurer VITE_PAYPAL_ME_URL
 * ou brancher @paypal/react-paypal-js ultérieurement.
 */
const Don = () => {
  const paypalUrl = import.meta.env.VITE_PAYPAL_ME_URL || "https://www.paypal.com/donate";

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-xl mx-auto py-8 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Soutenir la FOCOM</h1>
          <p className="text-slate-500 text-sm">
            Votre don permet de financer nos actions et de défendre vos droits.
          </p>
        </div>

        {/* Avantages */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Shield, label: "Action syndicale", desc: "Financez nos recours et négociations" },
            { icon: Users, label: "Solidarité", desc: "Renforcez le collectif" },
            { icon: CreditCard, label: "Déductible à 66%", desc: "De votre impôt sur le revenu" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
              <Icon className="w-6 h-6 text-teal-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* Montants suggérés */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Choisissez un montant</h2>
          <div className="grid grid-cols-4 gap-2">
            {AMOUNTS.map((amount) => (
              <a
                key={amount}
                href={`${paypalUrl}?amount=${amount}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 rounded-lg border border-slate-200 text-center text-sm font-bold text-slate-700 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
              >
                {amount} €
              </a>
            ))}
          </div>
          <div className="pt-2">
            <a
              href={paypalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold text-center rounded-lg transition-colors"
            >
              Choisir un autre montant via PayPal
            </a>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Paiement sécurisé via PayPal. Reçu fiscal fourni sur demande.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Don;
