import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';
import { COLONNE_STYLES } from './constants';
import { formatEur } from './calculs';
import type { ColonneType, LigneResultat } from './types';

interface ColonneResultatProps {
  type: ColonneType;
  titre: string;
  sous_titre: string;
  lignes: LigneResultat[];
  getMontant: (l: LigneResultat) => number | null;
  getDetail:  (l: LigneResultat) => string | undefined;
}

export function ColonneResultat({ type, titre, sous_titre, lignes, getMontant, getDetail }: ColonneResultatProps) {
  const styles       = COLONNE_STYLES[type];
  const total        = lignes.reduce((s, l) => s + (getMontant(l) ?? 0), 0);
  const hasUndefined = lignes.some(l => getMontant(l) === null);

  return (
    <div className="flex flex-col rounded-xl border border-border overflow-hidden shadow-sm h-full">
      <div className={cn('px-4 py-3', styles.header)}>
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-sm leading-tight">{titre}</p>
          {styles.badge}
        </div>
        <p className="text-xs mt-0.5 opacity-70">{sous_titre}</p>
      </div>

      <div className="px-4 py-3 border-b border-border bg-card">
        <p className="text-xs text-muted-foreground mb-0.5">Total estimé</p>
        <p className={cn('font-extrabold tabular-nums text-2xl', styles.total)}>
          {hasUndefined && type === 'syndicat'
            ? <span className="italic text-xl">≥ {formatEur(total)}</span>
            : formatEur(total)
          }
        </p>
        {hasUndefined && type === 'syndicat' && (
          <p className="text-[10px] text-muted-foreground mt-0.5">Certains montants en frais réels</p>
        )}
      </div>

      <div className="flex-1 divide-y divide-border bg-card">
        {lignes.map(ligne => {
          const montant = getMontant(ligne);
          const detail  = getDetail(ligne);
          const showArrow =
            (type === 'accord'   && ligne.montantAccord   > ligne.montantDir) ||
            (type === 'accordSP' && ligne.montantAccordSP > ligne.montantDir) ||
            (type === 'syndicat' && (ligne.montantSyn ?? 0) > ligne.montantDir);

          return (
            <div key={ligne.key} className={cn('px-3 py-2.5', ligne.highlight ? 'bg-muted/40' : '')}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {showArrow && <ArrowUp className="w-3 h-3 text-emerald-500 shrink-0" />}
                    <p className={cn('text-xs font-medium leading-snug', ligne.highlight ? 'text-foreground' : 'text-muted-foreground')}>
                      {ligne.label}
                    </p>
                  </div>
                  {detail && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{detail}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {montant === null ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Variable
                    </span>
                  ) : montant === 0 && type === 'direction' ? (
                    <span className="text-xs text-muted-foreground italic">—</span>
                  ) : (
                    <span className={cn(
                      'text-xs font-bold tabular-nums',
                      showArrow
                        ? type === 'accordSP' ? 'text-violet-600' : 'text-emerald-600'
                        : ligne.highlight
                          ? type === 'accordSP' ? 'text-violet-700'
                          : type === 'accord'   ? 'text-emerald-700'
                          : type === 'syndicat' ? 'text-primary'
                          : 'text-foreground'
                          : 'text-muted-foreground',
                    )}>
                      {formatEur(montant)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
