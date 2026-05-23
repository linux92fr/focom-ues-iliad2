import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, Star, FileCheck, AlertCircle, Euro, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculerResultats } from './simulateur-mobilite/calculs';
import { ColonneResultat } from './simulateur-mobilite/ColonneResultat';
import { ExemplesRapides } from './simulateur-mobilite/ExemplesRapides';
import { DISPOSITIFS, colorConfig } from './simulateur-mobilite/constants';
import type { Profil, Options, Dispositif, ExemplePreset } from './simulateur-mobilite/types';

const DEFAULT_PROFIL: Profil = { salaireBrut: '', anciennete: '', age: '', rqth: false, categorie: 'employe' };
const DEFAULT_OPTIONS: Options = {
  mobiliteGeo: false, situationFamiliale: 'seul',
  typeMobiliteInterne: 'decroissance_vers_tension',
  concretisationRapide: false, typeAutoEntrepreneur: false,
};

const SimulateurMobilite = () => {
  const [profil, setProfil]           = useState<Profil>(DEFAULT_PROFIL);
  const [dispositif, setDispositif]   = useState<Dispositif>(null);
  const [options, setOptions]         = useState<Options>(DEFAULT_OPTIONS);
  const [showResults, setShowResults] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const lignes       = showResults ? calculerResultats(profil, dispositif, options) : [];
  const canCalculate = !!profil.salaireBrut && !!profil.anciennete && !!profil.age && !!dispositif;
  const isSenior     = parseInt(profil.age) >= 50 || profil.rqth;

  const resetField = () => { setShowResults(false); setActivePresetId(null); };

  const handleLoadPreset = useCallback((preset: ExemplePreset) => {
    setProfil({ salaireBrut: preset.salaire, anciennete: preset.anciennete, age: preset.age, rqth: false, categorie: preset.categorie });
    setDispositif(preset.dispositif);
    setOptions(o => ({ ...o, concretisationRapide: false, typeAutoEntrepreneur: false }));
    setActivePresetId(preset.id);
    setShowResults(true);
  }, []);

  const handleReset = () => {
    setProfil(DEFAULT_PROFIL);
    setDispositif(null);
    setOptions(DEFAULT_OPTIONS);
    setShowResults(false);
    setActivePresetId(null);
  };

  return (
    <div className="p-4 lg:p-8">
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-screen-2xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">Simulateur Mobilité GEPP UES ILIAD</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Direction · FOCOM · Accord signé ·{' '}
              <strong className="text-violet-700">Accord (sans plafond)</strong>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/30 bg-primary/5">
                <Star className="w-3 h-3" />FOCOM — propositions VF 27/02/2026
              </Badge>
              <Badge className="text-xs gap-1 bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
                <FileCheck className="w-3 h-3" />Accord GEPP signé — 9 avr. 2026
              </Badge>
              <Badge className="text-xs gap-1 bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-100">
                <FileCheck className="w-3 h-3" />Colonne sans plafond (comparatif)
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">

            {/* Colonne formulaire */}
            <div className="flex flex-col gap-5">
              <ExemplesRapides onLoad={handleLoadPreset} activeId={activePresetId} />

              {/* Profil */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</span>
                    Votre profil
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'salaire',    label: 'Salaire brut mensuel (€)', placeholder: 'ex. 3500', field: 'salaireBrut' as const, step: undefined },
                      { id: 'anciennete', label: 'Ancienneté (années)',       placeholder: 'ex. 5',    field: 'anciennete'  as const, step: '0.5'    },
                      { id: 'age',        label: 'Âge',                       placeholder: 'ex. 42',   field: 'age'         as const, step: undefined },
                    ].map(({ id, label, placeholder, field, step }) => (
                      <div key={id} className="flex flex-col gap-1.5">
                        <Label htmlFor={id} className="text-xs">{label}</Label>
                        <Input id={id} type="number" min="0" placeholder={placeholder} step={step} value={profil[field]}
                          onChange={e => { setProfil(p => ({ ...p, [field]: e.target.value })); resetField(); }} />
                      </div>
                    ))}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs block mb-1">RQTH</Label>
                      <div className="flex gap-1">
                        {[{ val: false, label: 'Non' }, { val: true, label: 'Oui' }].map(({ val, label }) => (
                          <Button key={label} type="button" size="sm" variant={profil.rqth === val ? 'default' : 'outline'}
                            onClick={() => { setProfil(p => ({ ...p, rqth: val })); resetField(); }}
                            className="flex-1 h-9 text-xs">{label}</Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Catégorie professionnelle</Label>
                    <div className="flex gap-1.5">
                      {([{ val: 'employe', label: 'Employé / Tech.' }, { val: 'cadre', label: 'Cadre' }] as const).map(({ val, label }) => (
                        <Button key={val} type="button" size="sm" variant={profil.categorie === val ? 'default' : 'outline'}
                          onClick={() => { setProfil(p => ({ ...p, categorie: val })); resetField(); }}
                          className="flex-1 h-9 text-xs">{label}</Button>
                      ))}
                    </div>
                  </div>
                  {isSenior && (
                    <Alert className="border-primary/30 bg-primary/5 py-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      <AlertDescription className="text-xs">Bonifications senior/RQTH appliquées</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Dispositif */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">2</span>
                    Dispositif
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {DISPOSITIFS.map(d => {
                      const c        = colorConfig[d.color];
                      const selected = dispositif === d.id;
                      const Icon     = d.icon;
                      return (
                        <button key={d.id} type="button"
                          onClick={() => { setDispositif(d.id); resetField(); }}
                          className={cn('w-full text-left p-2.5 rounded-lg border-2 transition-all',
                            selected ? `${c.bg} ${c.border}` : 'border-border hover:border-primary/30 bg-card')}>
                          <div className="flex items-center gap-2">
                            <div className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0', selected ? c.bg : 'bg-muted')}>
                              <Icon className={cn('w-3.5 h-3.5', selected ? c.text : 'text-muted-foreground')} />
                            </div>
                            <div>
                              <p className={cn('font-semibold text-xs', selected ? c.text : 'text-foreground')}>{d.label}</p>
                              <p className="text-[10px] text-muted-foreground leading-tight">{d.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Options */}
              {dispositif && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">3</span>
                      Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {dispositif === 'mobilite_interne' && (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs">Type de mobilité (FOCOM)</Label>
                          <div className="flex flex-col gap-1.5">
                            {([
                              { val: 'decroissance_vers_tension',   label: 'Décroissance → Tension (20k€)'   },
                              { val: 'decroissance_vers_equilibre', label: 'Décroissance → Équilibre (15k€)' },
                              { val: 'equilibre_vers_tension',      label: 'Équilibre → Tension (12,5k€)'    },
                            ] as const).map(({ val, label }) => (
                              <Button key={val} type="button" size="sm" variant={options.typeMobiliteInterne === val ? 'default' : 'outline'}
                                onClick={() => { setOptions(o => ({ ...o, typeMobiliteInterne: val })); setShowResults(false); }}
                                className="h-7 text-xs justify-start">{label}</Button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Mobilité géographique (≥50km)</Label>
                          <div className="flex gap-1">
                            {[{ val: false, label: 'Non' }, { val: true, label: 'Oui' }].map(({ val, label }) => (
                              <Button key={label} type="button" size="sm" variant={options.mobiliteGeo === val ? 'default' : 'outline'}
                                onClick={() => { setOptions(o => ({ ...o, mobiliteGeo: val })); setShowResults(false); }}
                                className="h-7 text-xs px-2">{label}</Button>
                            ))}
                          </div>
                        </div>
                        {options.mobiliteGeo && (
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs text-muted-foreground">Situation familiale</Label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {([
                                { val: 'seul', label: 'Seul(e)' }, { val: 'couple', label: 'Couple' },
                                { val: 'enfant1', label: '1-2 enfants' }, { val: 'enfant2plus', label: '3+ enfants' },
                              ] as const).map(({ val, label }) => (
                                <Button key={val} type="button" size="sm" variant={options.situationFamiliale === val ? 'default' : 'outline'}
                                  onClick={() => { setOptions(o => ({ ...o, situationFamiliale: val })); setShowResults(false); }}
                                  className="h-7 text-xs">{label}</Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {dispositif !== 'mobilite_interne' && (
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-xs">Concrétisation rapide (CDI)</Label>
                          <p className="text-[10px] text-muted-foreground">Accord signé 80% (art. 26.k)</p>
                        </div>
                        <div className="flex gap-1">
                          {[{ val: false, label: 'Non' }, { val: true, label: 'Oui' }].map(({ val, label }) => (
                            <Button key={label} type="button" size="sm" variant={options.concretisationRapide === val ? 'default' : 'outline'}
                              onClick={() => { setOptions(o => ({ ...o, concretisationRapide: val })); setShowResults(false); }}
                              className="h-7 text-xs px-2">{label}</Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {dispositif === 'creation_entreprise' && (
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Type de création</Label>
                        <div className="flex gap-1">
                          {[{ val: false, label: 'Entreprise' }, { val: true, label: 'Auto-entr.' }].map(({ val, label }) => (
                            <Button key={label} type="button" size="sm" variant={options.typeAutoEntrepreneur === val ? 'default' : 'outline'}
                              onClick={() => { setOptions(o => ({ ...o, typeAutoEntrepreneur: val })); setShowResults(false); }}
                              className="h-7 text-xs px-2">{label}</Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Button size="lg" className="w-full" disabled={!canCalculate} onClick={() => { if (canCalculate) setShowResults(true); }}>
                <Calculator className="w-4 h-4 mr-2" />Calculer et comparer
              </Button>
              {showResults && (
                <Button variant="outline" size="sm" className="w-full" onClick={handleReset}>
                  Réinitialiser
                </Button>
              )}
            </div>

            {/* Résultats */}
            <div className="lg:col-span-3">
              {!showResults ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-12 rounded-2xl border-2 border-dashed border-border">
                    <Euro className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Remplissez le formulaire</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">ou chargez un exemple ci-contre</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                    <ColonneResultat type="syndicat"  titre="Revendications FOCOM"       sous_titre="Propositions VF — 27 fév. 2026"         lignes={lignes} getMontant={l => l.montantSyn}      getDetail={l => l.detailSyn}      />
                    <ColonneResultat type="accord"    titre="Accord GEPP signé"          sous_titre="UES ILIAD — 9 avr. 2026 (plaf. 70k€)"  lignes={lignes} getMontant={l => l.montantAccord}    getDetail={l => l.detailAccord}   />
                    <ColonneResultat type="accordSP"  titre="Accord GEPP (sans plafond)" sous_titre="Rupture sans plafond 70k€"              lignes={lignes} getMontant={l => l.montantAccordSP}  getDetail={l => l.detailAccordSP} />
                  </div>
                  <Alert className="border-amber-300 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-xs text-amber-800">
                      <strong>Simulation indicative.</strong>{' '}
                      Accord GEPP UES ILIAD signé le 9 avril 2026 —
                      Art. 26.e : durées congé (6 mois emploi salarié, +3 mois ≥50 ans/RQTH ; 9 mois création/reconversion) —
                      Art. 26.f : 75% — Art. 26.k : 80% concrétisation — Art. 26.l : ×2,5 plafonné <strong>70 000 €</strong> —
                      Art. 26.m : CPF 4k€, RNCP 10k€ (+2k€ senior) — Art. 26.n : création 12k€/8k€ — Art. 23.5.d : mobilité interne 12k€ +500€ senior/RQTH.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimulateurMobilite;
