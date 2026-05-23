import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXEMPLES_PRESETS, EXEMPLE_GROUPS, colorConfig } from './constants';
import type { ExemplePreset } from './types';

interface ExemplesRapidesProps {
  onLoad:   (preset: ExemplePreset) => void;
  activeId: string | null;
}

export function ExemplesRapides({ onLoad, activeId }: ExemplesRapidesProps) {
  return (
    <Card className="border-primary/20 bg-primary/3">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-900 text-xs font-bold flex items-center justify-center">
            <Zap className="w-3.5 h-3.5" />
          </span>
          Exemples rapides
        </CardTitle>
        <CardDescription className="text-xs">
          Profils types — accord GEPP signé le 9 avril 2026.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pb-4">
        {EXEMPLE_GROUPS.map(group => {
          const c = colorConfig[group.color];
          return (
            <div key={group.label} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className={cn('text-[11px] font-semibold', c.text)}>{group.label}</span>
                <span className="text-[10px] text-muted-foreground">— {group.subtitle}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.ids.map(id => {
                  const preset   = EXEMPLES_PRESETS.find(p => p.id === id)!;
                  const isActive = activeId === id;
                  return (
                    <button key={id} type="button" onClick={() => onLoad(preset)}
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all',
                        isActive
                          ? `${c.bg} ${c.border} ${c.text} shadow-sm`
                          : 'bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                      )}
                    >
                      {isActive && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                      {preset.label.replace(/^Ex\. \d+ — /, '')}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {activeId && (() => {
          const preset = EXEMPLES_PRESETS.find(p => p.id === activeId);
          if (!preset?.notes.length) return null;
          return (
            <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 flex flex-col gap-1">
              <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">
                Détail accord signé — {preset.label}
              </p>
              {preset.notes.map((note, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-[10px] font-mono text-emerald-600/60 shrink-0 mt-0.5">{i + 1}.</span>
                  <p className="text-[11px] text-emerald-800 leading-snug font-mono">{note}</p>
                </div>
              ))}
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}
