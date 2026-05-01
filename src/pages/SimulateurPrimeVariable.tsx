import React, { useState, useEffect } from 'react';

// Injection des polices (DM Sans pour la lisibilité, IBM Plex Mono pour la data)
const injectStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

  .font-sans-ui { font-family: 'DM Sans', sans-serif; }
  .font-mono-data { font-family: 'IBM Plex Mono', monospace; }

  /* Scanline subtle overlay */
  .bg-industrial {
    background-color: #09090b;
    background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 32px 32px;
  }
  
  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #09090b; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 0px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
`;

const PV_BASE = 400;

// Configurations des spécialités
const SPECS = {
  reseau: { label: 'Réseau', eMax: [15, 5, 25], eNames: ['GTR Zone CIR', 'GTI Zone CIR', 'GTR Zone RR'] },
  radio: { label: 'Radio', eMax: [20, 15, 10], eNames: ['GTR 2G/3G', 'GTR 4G/5G', 'GTI Global'] },
  fibre: { label: 'Fibre', eMax: [15, 15, 15], eNames: ['GTR Grand Public', 'GTR Pro', 'GTI Curatif'] }
};

// Configurations des profils V1
const PROFILES = {
  CDEM: { perfMax: 4, prodMax: 6 },
  CQIS: { perfMax: 4, prodMax: 1 },
  PQIS: { perfMax: 2, prodMax: 1 }
};

type Specialty = keyof typeof SPECS;
type Profile = keyof typeof PROFILES;

export default function SimulateurPrimeVariableComplet() {
  // --- STATES ---
  const [specialty, setSpecialty] = useState<Specialty>('reseau');
  const [profile, setProfile] = useState<Profile>('CDEM');
  const [showDoc, setShowDoc] = useState(false);

  const [eData, setEData] = useState([87, 88, 86]);
  const [rData, setRData] = useState({ r1: 1.5, r2: 96, r3: 41, r4: 92, r5: 'stable', r6: 1.15 });
  const [eciData, setEciData] = useState([3, 3, 2, 3, 3]);
  const [eciBonus, setEciBonus] = useState({ dep: false, form: false, hno: false, col: false, pro: false, marge: 2 });
  
  const [v1Data, setV1Data] = useState({ perf: 3, prod: 4, eciPct: 15, qisPct: 0, bonifPct: 0 });
  const [snapshots, setSnapshots] = useState<any[]>([]);

  // Safety resets
  useEffect(() => {
    setV1Data(prev => ({
      ...prev,
      perf: Math.min(prev.perf, PROFILES[profile].perfMax),
      prod: Math.min(prev.prod, PROFILES[profile].prodMax)
    }));
  }, [profile]);

  // --- MATH LOGIC ---
  const calcE = (val: number, maxPts: number) => {
    if (val >= 90) return { p: maxPts, b: val > 92 };
    const step = maxPts / 15;
    const diff = 90 - val;
    const pts = Math.max(0, Math.round(maxPts - (diff * step)));
    return { p: pts, b: false };
  };

  const cE1 = calcE(eData[0], SPECS[specialty].eMax[0]);
  const cE2 = calcE(eData[1], SPECS[specialty].eMax[1]);
  const cE3 = calcE(eData[2], SPECS[specialty].eMax[2]);

  const cR1 = rData.r1 === 0 ? 5 : rData.r1 < 2 ? 4 : rData.r1 < 5 ? 2 : rData.r1 < 10 ? 1 : 0;
  const cR2 = rData.r2 >= 100 ? 5 : rData.r2 >= 95 ? 4 : rData.r2 >= 90 ? 3 : rData.r2 >= 85 ? 2 : rData.r2 >= 80 ? 1 : 0;
  const cR3 = rData.r3 >= 42 ? { p: 5, b: rData.r3 > 43 } : rData.r3 >= 41 ? { p: 4, b: false } : rData.r3 >= 40 ? { p: 3, b: false } : rData.r3 >= 39 ? { p: 2, b: false } : rData.r3 >= 38 ? { p: 1, b: false } : { p: 0, b: false };
  const cR4 = rData.r4 >= 100 ? 10 : rData.r4 >= 55 ? Math.floor((rData.r4 - 55) / 5) + 1 : 0;
  const cR5 = rData.r5 === 'hausse' ? 0 : 5;
  const cR6 = rData.r6 < 1.1 ? 5 : rData.r6 < 1.2 ? 4 : rData.r6 < 1.3 ? 3 : rData.r6 < 1.4 ? 2 : rData.r6 < 1.5 ? 1 : 0;

  const eBase = eciData.reduce((a, b) => a + b, 0);
  const bonChecks = Object.values(eciBonus).filter(v => v === true).length;
  const bonTotal = bonChecks + eciBonus.marge;
  const varBonuses = (cE1.b ? 1 : 0) + (cE2.b ? 1 : 0) + (cE3.b ? 1 : 0) + (cR3.b ? 1 : 0);

  const v2PtsTotal = (cE1.p + cE2.p + cE3.p) + (cR1 + cR2 + cR3.p + cR4 + cR5 + cR6) + eBase + bonTotal + varBonuses;
  const v2Euros = Math.round((v2PtsTotal / 114) * PV_BASE);

  const v1PerfPct = (v1Data.perf / PROFILES[profile].perfMax) * 40;
  const v1ProdPct = (v1Data.prod / PROFILES[profile].prodMax) * 40;
  const v1TotalPct = Math.min(100, Math.max(0, v1PerfPct + v1ProdPct + v1Data.eciPct + v1Data.qisPct + v1Data.bonifPct));
  const v1Euros = Math.round((v1TotalPct / 100) * PV_BASE);

  const delta = v2Euros - v1Euros;

  const saveSnapshot = () => {
    const snap = { id: Date.now(), name: `${SPECS[specialty].label} - ${v2Euros}€`, v1: v1Euros, v2: v2Euros, delta };
    setSnapshots([snap, ...snapshots].slice(0, 5));
  };

  return (
    <div className="min-h-screen bg-industrial text-zinc-300 font-sans-ui p-4 md:p-8 selection:bg-amber-500/30">
      <style dangerouslySetInnerHTML={{ __html: injectStyles }} />

      <div className="max-w-7xl mx-auto">
        
        {/* TOP BAR / Header */}
        <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-mono-data text-white">SYS. PV_V2</h1>
            <p className="text-xs text-zinc-500 font-mono-data tracking-widest uppercase mt-1">Émulateur de modèle de rémunération</p>
          </div>
          <button 
            onClick={() => setShowDoc(!showDoc)}
            className={`font-mono-data text-[10px] uppercase tracking-widest px-4 py-2 border transition-colors ${showDoc ? 'bg-amber-500 text-zinc-950 border-amber-500' : 'bg-zinc-900 border-zinc-700 text-amber-500 hover:bg-zinc-800'}`}
          >
            {showDoc ? 'Fermer le manuel [X]' : 'Manuel Opératoire [?]'}
          </button>
        </div>

        {/* DOCUMENTATION PANEL (Toggled) */}
        {showDoc && (
          <div className="bg-zinc-900 border border-amber-500/30 mb-8 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>
            <h2 className="text-sm font-mono-data text-amber-500 uppercase tracking-widest mb-6">/ Documentation Technique & Exemples</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-zinc-400">
              <div>
                <h3 className="font-mono-data text-white mb-2">1. Changement de Paradigme (La "Double Peine")</h3>
                <p className="mb-4 leading-relaxed">
                  <strong>En V1 :</strong> La prime était un % d'une enveloppe globale. Si les résultats globaux de la zone étaient mauvais (SLA non tenus), toute l'enveloppe baissait. Le technicien subissait une "double peine" : ses efforts personnels n'étaient pas récompensés.
                </p>
                <p className="mb-4 leading-relaxed">
                  <strong>En V2 :</strong> Le système fonctionne par <span className="text-amber-500 font-mono-data">CUMUL DE POINTS</span>. Chaque action individuelle rapporte des points définitifs. Les indicateurs sont <em>cloisonnés</em>. Un mauvais chiffre sur le réseau n'annule plus les points gagnés sur la rigueur.
                </p>
                
                <h3 className="font-mono-data text-white mb-2 mt-6">2. Valeur Mathématique</h3>
                <ul className="list-disc pl-4 space-y-1 font-mono-data text-xs">
                  <li>Base maximale standard = 100 points.</li>
                  <li>Valeur financière : 400€ / 100 (ou 114) ≈ <strong className="text-zinc-200">3,50€ le point</strong>.</li>
                  <li><strong>Bonus de dépassement :</strong> Il est possible d'atteindre jusqu'à 114 points en cas de sur-performance, permettant de dépasser le plafond historique de 400€.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="bg-zinc-950 border border-zinc-800 p-4">
                  <h4 className="font-mono-data text-xs text-emerald-400 mb-2">Étude de Cas A : Le technicien pénalisé par le réseau</h4>
                  <p className="text-xs leading-relaxed">
                    Un mois avec des intempéries majeures. Les GTR/GTI sont rouges vif (50%).<br/>
                    <strong>En V1 :</strong> La note globale s'effondre, la prime tend vers 50€ ou 0€.<br/>
                    <strong>En V2 :</strong> Le technicien a continué à bien remplir ses tickets (R1-R6 = 30 pts) et a été solidaire (ECI = 18 pts). Il encaisse mécaniquement ~48 points, soit <strong className="text-white">~168€ sécurisés</strong> malgré la crise.
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-4">
                  <h4 className="font-mono-data text-xs text-amber-400 mb-2">Étude de Cas B : Le Sur-Performeur</h4>
                  <p className="text-xs leading-relaxed">
                    Un excellent mois. Les GTR dépassent 92% (déclenchement de bonus : +3 pts). Présence loguée au top (R3 &gt; 43% : +1 pt). Le manager donne 2 bonus ECI.<br/>
                    <strong>Résultat V2 :</strong> Le technicien cumule 110 points. 110 pts × 3.51€ = <strong className="text-white">386€</strong> (et peut dépasser 400€ s'il atteint 114pts). Chaque dépassement d'objectif est payé, ce qui n'existait pas en V1.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* --- LEFT PANEL: CONTROLS --- */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            
            {/* Top Bar Settings */}
            <div className="flex flex-col sm:flex-row gap-4 bg-zinc-900 border border-zinc-800 p-4 shadow-xl">
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono-data block mb-2">Spécialité Technique</label>
                <div className="flex border border-zinc-700 rounded-sm overflow-hidden">
                  {(Object.keys(SPECS) as Specialty[]).map(s => (
                    <button key={s} onClick={() => setSpecialty(s)} className={`flex-1 py-1.5 text-xs font-mono-data font-medium transition-colors ${specialty === s ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}>
                      {SPECS[s].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono-data block mb-2">Profil V1 (Héritage)</label>
                <div className="flex border border-zinc-700 rounded-sm overflow-hidden">
                  {(Object.keys(PROFILES) as Profile[]).map(p => (
                    <button key={p} onClick={() => setProfile(p)} className={`flex-1 py-1.5 text-xs font-mono-data font-medium transition-colors ${profile === p ? 'bg-zinc-300 text-zinc-900' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* E1-E3 Inputs */}
              <Section title="E / Qualité Service (Max 45 pts)">
                {SPECS[specialty].eNames.map((name, i) => (
                  <Slider key={i} label={name} val={eData[i]} min={50} max={100} unit="%" setVal={(v: number) => { const n = [...eData]; n[i] = v; setEData(n); }} />
                ))}
              </Section>

              {/* R1-R6 Inputs */}
              <Section title="R / Rigueur Terrain (Max 35 pts)">
                <Slider label="R1: Oubli Délog" val={rData.r1} min={0} max={15} step={0.5} unit="%" setVal={(v: number) => setRData({...rData, r1: v})} invertColors />
                <Slider label="R2: Réussite vs Med." val={rData.r2} min={60} max={110} unit="%" setVal={(v: number) => setRData({...rData, r2: v})} />
                <Slider label="R3: Présence loguée" val={rData.r3} min={20} max={60} unit="%" setVal={(v: number) => setRData({...rData, r3: v})} />
                <Slider label="R4: Volume vs Med." val={rData.r4} min={40} max={120} unit="%" setVal={(v: number) => setRData({...rData, r4: v})} />
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-zinc-400 font-mono-data">R5: Backlog</span>
                  <div className="flex bg-zinc-950 border border-zinc-800 text-[11px] font-mono-data">
                    <button onClick={() => setRData({...rData, r5: 'baisse'})} className={`px-2 py-1 ${rData.r5==='baisse'?'bg-amber-500/20 text-amber-500':'text-zinc-600'}`}>Baisse</button>
                    <button onClick={() => setRData({...rData, r5: 'stable'})} className={`px-2 py-1 border-x border-zinc-800 ${rData.r5==='stable'?'bg-amber-500/20 text-amber-500':'text-zinc-600'}`}>Stable</button>
                    <button onClick={() => setRData({...rData, r5: 'hausse'})} className={`px-2 py-1 ${rData.r5==='hausse'?'bg-red-500/20 text-red-500':'text-zinc-600'}`}>Hausse</button>
                  </div>
                </div>

                <Slider label="R6: Inter / Ticket" val={rData.r6} min={0.8} max={2.5} step={0.05} setVal={(v: number) => setRData({...rData, r6: v})} invertColors />
              </Section>

              {/* ECI Inputs */}
              <Section title="ECI / Savoir-Être (Base 20 pts + Bonus)">
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {['Terr.', 'Auto.', 'Vol.', 'Entr.', 'Admin.'].map((label, i) => (
                    <div key={label} className="text-center">
                      <div className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">{label}</div>
                      <input type="number" min={0} max={4} value={eciData[i]} onChange={e => { const n = [...eciData]; n[i] = Number(e.target.value); setEciData(n); }} 
                        className="w-full bg-zinc-950 border border-zinc-800 text-center text-amber-500 font-mono-data text-sm py-1 outline-none focus:border-amber-500" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    {k:'dep', l:'Dépannage'}, {k:'form', l:'Formateur'}, {k:'hno', l:'HNO'}, {k:'col', l:'Soutien Col.'}, {k:'pro', l:'Projet'}
                  ].map((b) => (
                    <button key={b.k} onClick={() => setEciBonus({...eciBonus, [b.k]: !eciBonus[b.k as keyof typeof eciBonus]})}
                      className={`text-[10px] font-mono-data px-2 py-1 border transition-colors ${eciBonus[b.k as keyof typeof eciBonus] ? 'bg-amber-500 text-zinc-950 border-amber-500' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>
                      {b.l}
                    </button>
                  ))}
                </div>
                <Slider label="Marge CIR" val={eciBonus.marge} min={0} max={5} unit=" pts" setVal={(v: number) => setEciBonus({...eciBonus, marge: v})} />
              </Section>

              {/* V1 Manual Inputs */}
              <Section title="Paramètres V1 (Pour Comparaison)">
                <Slider label={`PERF Obj. (Max ${PROFILES[profile].perfMax})`} val={v1Data.perf} min={0} max={PROFILES[profile].perfMax} step={0.5} setVal={(v: number) => setV1Data({...v1Data, perf: v})} />
                <Slider label={`PROD Pts (Max ${PROFILES[profile].prodMax})`} val={v1Data.prod} min={0} max={PROFILES[profile].prodMax} step={1} setVal={(v: number) => setV1Data({...v1Data, prod: v})} />
                <Slider label="ECI % (0-20%)" val={v1Data.eciPct} min={0} max={20} unit="%" setVal={(v: number) => setV1Data({...v1Data, eciPct: v})} />
                <Slider label="Ajust. QIS (+/-)" val={v1Data.qisPct} min={-20} max={20} unit="%" setVal={(v: number) => setV1Data({...v1Data, qisPct: v})} invertColors />
                <Slider label="Bonif HZ/HNO" val={v1Data.bonifPct} min={0} max={20} unit="%" setVal={(v: number) => setV1Data({...v1Data, bonifPct: v})} />
              </Section>

            </div>
          </div>

          {/* --- RIGHT PANEL: LIVE RESULTS HUD --- */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-8 flex flex-col gap-6">
            
            <div className="bg-zinc-950 border border-zinc-800 shadow-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                <h2 className="text-sm font-mono-data uppercase tracking-widest text-zinc-400">Télémétrie Financière</h2>
                <button onClick={saveSnapshot} className="text-[10px] font-mono-data bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-sm transition-colors uppercase">
                  + Snapshot
                </button>
              </div>

              {/* V2 Output */}
              <div className="mb-8">
                <div className="text-[10px] uppercase tracking-widest text-amber-500 font-mono-data mb-2">Modèle V2 (Cible)</div>
                <div className="flex items-end gap-2">
                  <div className="text-5xl font-mono-data font-medium text-zinc-100 tracking-tight">{v2Euros}</div>
                  <div className="text-xl font-mono-data text-zinc-500 mb-1">€</div>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 mt-4 overflow-hidden relative">
                  {/* Pointers for base 100 vs bonus */}
                  <div className="absolute top-0 bottom-0 left-[87.7%] w-px bg-zinc-600 z-10" title="Plafond de base (100 pts)"></div>
                  <div className="bg-amber-500 h-full transition-all duration-300 relative z-0" style={{ width: `${Math.min(100, (v2PtsTotal/114)*100)}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono-data text-zinc-500 mt-2">
                  <span>Total Points: <strong className="text-amber-500">{v2PtsTotal}</strong> / 114 max</span>
                  <span>1 pt = {(PV_BASE/114).toFixed(2)}€</span>
                </div>
              </div>

              {/* V1 Output */}
              <div className="mb-8 p-4 bg-zinc-900/50 border border-zinc-800/50">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono-data mb-2">Modèle V1 (Héritage)</div>
                <div className="flex items-end gap-2 opacity-60">
                  <div className="text-3xl font-mono-data text-zinc-300">{v1Euros}</div>
                  <div className="text-base font-mono-data text-zinc-500 mb-1">€</div>
                </div>
                <div className="text-[10px] font-mono-data text-zinc-600 mt-1">{v1TotalPct.toFixed(1)}% du plafond global</div>
              </div>

              {/* Delta Status */}
              <div className={`p-4 border ${delta >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono-data mb-1">Différentiel V2 vs V1</div>
                <div className={`text-2xl font-mono-data ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {delta >= 0 ? '+' : ''}{delta} €
                </div>
              </div>

            </div>

            {/* Snapshots Log */}
            {snapshots.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 p-4">
                <h3 className="text-[10px] font-mono-data uppercase tracking-widest text-zinc-500 mb-3">Snapshots Récents</h3>
                <div className="space-y-2">
                  {snapshots.map((s) => (
                    <div key={s.id} className="flex justify-between items-center text-xs font-mono-data bg-zinc-950 px-3 py-2 border border-zinc-800/50">
                      <span className="text-zinc-400">{s.name}</span>
                      <span className={s.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}>{s.delta >= 0 ? '+' : ''}{s.delta}€</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// --- UI HELPERS ---

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5">
      <h3 className="text-[10px] font-mono-data uppercase tracking-widest text-amber-500/70 mb-5 border-b border-zinc-800 pb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function Slider({ label, val, min, max, step = 1, unit = '', invertColors = false, setVal }: any) {
  const pct = (val - min) / (max - min);
  const isGood = invertColors ? pct < 0.3 : pct > 0.7;
  const isWarn = invertColors ? pct > 0.7 : pct < 0.3;
  
  const valColor = isGood ? 'text-emerald-400' : isWarn ? 'text-red-400' : 'text-amber-500';

  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1">
        <label className="text-xs text-zinc-400 font-mono-data">{label}</label>
        <span className={`font-mono-data text-sm ${valColor}`}>{val}{unit}</span>
      </div>
      <input 
        type="range" min={min} max={max} step={step} value={val} 
        onChange={(e) => setVal(Number(e.target.value))}
        className="w-full h-1 bg-zinc-950 appearance-none rounded-none accent-amber-500 outline-none cursor-ew-resize"
      />
    </div>
  );
}
