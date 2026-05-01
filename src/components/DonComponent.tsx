import { useState } from 'react';
import { Heart, ExternalLink } from 'lucide-react';

const DON_MONTANTS = [
  { montant: 1, emoji: '☕', label: '1 cafe' },
  { montant: 2, emoji: '☕☕', label: '2 cafes' },
  { montant: 5, emoji: '🎁', label: '5 cafes' },
];

const DonComponent = () => {
  const [selected, setSelected] = useState<number | null>(null);

  const kofiUrl = selected
    ? 'https://ko-fi.com/fadilkendira?amount=' + selected
    : 'https://ko-fi.com/fadilkendira';

  const btnLabel = selected
    ? 'Offrir ' + selected + ' EUR via Ko-fi'
    : 'Faire un don via Ko-fi';

  return (
    <div className="rounded-2xl border border-yellow-200 dark:border-yellow-800/40 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 overflow-hidden shadow-md">
      <div className="bg-yellow-400 px-5 py-4">
        <p className="font-extrabold text-yellow-900 text-base leading-tight">Soutenir le site</p>
        <p className="text-yellow-800 text-xs mt-0.5">Ce site est finance sur fonds personnels (~400 EUR/an)</p>
      </div>
      <div className="px-5 py-4 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hebergement, licences et maintenance sont pris en charge benevolement.
          Votre soutien, meme modeste, fait la difference.{' '}
          <strong className="text-foreground">Merci !</strong>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DON_MONTANTS.map((don) => (
            <button
              key={don.montant}
              onClick={() => setSelected(don.montant)}
              className={
                selected === don.montant
                  ? 'rounded-xl border-2 py-3 px-2 text-center font-bold text-sm border-yellow-500 bg-yellow-400 text-yellow-900 shadow-md scale-105 transition-all'
                  : 'rounded-xl border-2 py-3 px-2 text-center font-bold text-sm border-yellow-200 bg-white dark:bg-background text-foreground hover:border-yellow-400 hover:bg-yellow-50 transition-all'
              }
            >
              <div className="text-lg mb-1">{don.emoji}</div>
              <div>{don.montant} EUR</div>
            </button>
          ))}
        </div>
        <a
          href={kofiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-yellow-400 hover:bg-yellow-500 transition-colors px-5 py-3 text-sm font-extrabold text-yellow-900 shadow-md"
        >
          <Heart className="h-4 w-4" />
          <span>{btnLabel}</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
        </a>
        <p className="text-xs text-muted-foreground text-center">
          Paiement securise via Ko-fi - 0% de commission
        </p>
      </div>
    </div>
  );
};

export default DonComponent;
