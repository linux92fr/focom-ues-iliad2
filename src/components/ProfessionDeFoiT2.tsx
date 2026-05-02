/**
 * ProfessionDeFoiT2.tsx
 * Importe toutes les données depuis elections.data.ts — zéro duplication.
 */

import { Printer, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CANDIDATS_T2_FLAT,
  PRINT_COLORS,
} from './elections.data';

const { red: RED, dark: DARK, smoke: SMOKE, mid: MID } = PRINT_COLORS;

const titulaires = CANDIDATS_T2_FLAT.filter(c => c.titulaire);
const suppleants = CANDIDATS_T2_FLAT.filter(c => !c.titulaire);

// ─── Composants de structure ──────────────────────────────────────────────────

function A4Page({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '210mm', height: '297mm',
      background: 'white',
      margin: '0 auto 20px',
      boxShadow: '0 8px 40px rgba(0,0,0,.3)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
      pageBreakAfter: 'always',
      // AJOUTEZ CES DEUX LIGNES POUR LE PDF :
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact',
    }}>
      {children}
    </div>
  );
}

function PageHeader({ title }: { title: string }) {
  return (
    <div style={{
      background: DARK, padding: '12px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/logo.png" alt="FO" style={{ width: 45, height: 45, objectFit: 'contain' }} />
        <div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: 1 }}>
            {title}
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 2 }}>
            FO COM · UES ILIAD
          </div>
        </div>
      </div>
      <div style={{
        background: RED, color: 'white',
        fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 600,
        padding: '6px 12px', borderRadius: 6, textAlign: 'right', lineHeight: 1.4,
        textTransform: 'uppercase',
      }}>
        2<sup>e</sup> Tour<br />29 Avr — 06 Mai 2026
      </div>
    </div>
  );
}

function PageFooter() {
  return (
    <div style={{
      background: RED, padding: '15px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0, gap: 14, marginTop: 'auto',
    }}>
      <div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, textTransform: 'uppercase', color: 'white', lineHeight: 1.1 }}>
          Votez FO-COM UES ILIAD
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.75)', marginTop: 2 }}>
          Faites-vous entendre — 29 avr. au 6 mai 2026
        </div>
      </div>
      <div style={{ background: 'white', padding: 4, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://focomues-iliad.fr"
          alt="QR"
          style={{ width: 55, height: 55, display: 'block' }}
        />
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 7, fontWeight: 700, color: DARK, textTransform: 'uppercase' }}>
          SCANNEZ-MOI
        </span>
      </div>
    </div>
  );
}

function SecLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: 2, color: RED, marginBottom: 8,
    }}>
      <span style={{ display: 'block', width: 20, height: 3, background: RED, borderRadius: 2 }} />
      {children}
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function Page1() {
  return (
    <A4Page>
      <PageHeader title="Profession de foi" />
      <div style={{ background: RED, padding: '15px 20px', color: 'white', fontFamily: 'Oswald, sans-serif', fontSize: 24, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center' }}>
        FAITES-VOUS ENTENDRE !<br />
        <span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,.7)' }}>Élections Professionnelles CSE — UES ILIAD</span>
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ background: DARK, borderRadius: 12, padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', top: -10, left: 10, fontSize: 80, opacity: 0.2, color: RED, fontFamily: 'serif' }}>"</span>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontStyle: 'italic', color: 'white', lineHeight: 1.6, textAlign: 'center', position: 'relative', zIndex: 1 }}>
            Pour une représentation <strong>forte</strong>, solidaire et utile à toutes et à tous…
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: '✊', t: 'Agir',     d: "Pour une société plus juste et équitable pour tous les salariés de l'UES." },
            { icon: '🛡️', t: 'Préserver', d: "La défense sans faille de vos acquis sociaux et droits fondamentaux." },
            { icon: '💼', t: 'Défendre', d: "La protection de votre emploi, de votre contrat et de votre avenir." },
          ].map((item, i) => (
            <div key={i} style={{ background: SMOKE, padding: '15px', borderRadius: 10, borderTop: `5px solid ${RED}`, textAlign: 'center' }}>
              <div style={{ marginBottom: 10 }}>{item.icon}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, textTransform: 'uppercase', fontSize: 14, marginBottom: 5 }}>{item.t}</div>
              <div style={{ fontSize: 11, color: MID, lineHeight: 1.4 }}>{item.d}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff5f5', padding: '15px', borderRadius: 12, borderLeft: `5px solid ${RED}`, display: 'flex', gap: 15, alignItems: 'center' }}>
          <AlertTriangle style={{ color: RED, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: MID, margin: 0 }}>
            <strong>L'URGENCE DU VOTE :</strong> Au 2<sup>ème</sup> tour, <strong style={{ color: RED }}>aucun quorum n'est requis</strong>. Chaque voix compte directement pour peser face à la direction.
          </p>
        </div>

        <div style={{ background: SMOKE, padding: '20px', borderRadius: 12, border: `1px solid #ddd` }}>
          <SecLabel>Nos engagements</SecLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            {[
              "Fidélité à nos principes face aux transformations.",
              "Justice, écoute, éthique et exigence syndicale.",
              "Missions fondamentales du syndicalisme libre.",
              "Humanité et empathie au plus proche de vous.",
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, color: MID }}>
                <CheckCircle size={14} color={RED} /> {t}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: DARK, color: 'white', padding: '20px', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, textTransform: 'uppercase', color: RED, marginBottom: 8 }}>Nos Valeurs</div>
          <p style={{ fontSize: 12, lineHeight: 1.6, opacity: 0.9 }}>
            Nous sommes un syndicat libre, à l'écoute et au service des salariés. Force de proposition constructive et pragmatique, nous privilégions la concertation pour faire aboutir vos demandes concrètes.
          </p>
        </div>
      </div>
      <PageFooter />
    </A4Page>
  );
}

function Page2() {
  return (
    <A4Page>
      <PageHeader title="Qui sommes-nous ?" />
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', borderRadius: 15, overflow: 'hidden', height: 130, border: `3px solid ${RED}` }}>
            <img src="/candidats/nysidibe.jpg" alt="Yacine" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, width: '100%', background: RED, color: 'white', fontSize: 10, textAlign: 'center', fontWeight: 700, padding: '2px 0' }}>Yacine</div>
          </div>
          <div>
            <SecLabel>Notre syndicat</SecLabel>
            <p style={{ fontSize: 12, color: MID, lineHeight: 1.6 }}>
              FO COM UES ILIAD représente les salariés d'Iliad et défend leurs intérêts au quotidien.
              Nous œuvrons pour un environnement de travail <strong>respectueux et équitable</strong>.
              <br /><br />
              <strong style={{ color: DARK }}>Avec FO COM, on ne subit pas. On riposte.</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 20, alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: MID, lineHeight: 1.6 }}>
            Nos militants sont sur le terrain pour <strong>faire entendre vos revendications, coûte que coûte</strong>.
            Quand il y a un problème, FO COM répond présent : conflits, pressions ou injustices, nous sommes organisés et solidaires.
          </p>
          <div style={{ position: 'relative', borderRadius: 15, overflow: 'hidden', height: 130, border: `3px solid ${RED}` }}>
            <img src="/candidats/fracault.jpg" alt="Fabien" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, width: '100%', background: RED, color: 'white', fontSize: 10, textAlign: 'center', fontWeight: 700, padding: '2px 0' }}>Fabien</div>
          </div>
        </div>

        <div style={{ background: DARK, padding: '12px', borderRadius: 8, color: 'white', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontSize: 14, textTransform: 'uppercase' }}>
          👥 Engagement total et quotidien à vos côtés
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', borderRadius: 15, overflow: 'hidden', height: 130, border: `3px solid ${RED}` }}>
            <img src="/candidats/fkendira.png" alt="Fadil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, width: '100%', background: RED, color: 'white', fontSize: 10, textAlign: 'center', fontWeight: 700, padding: '2px 0' }}>Fadil</div>
          </div>
          <p style={{ fontSize: 12, color: MID, lineHeight: 1.6 }}>
            Nous nous battons pour la reconnaissance des droits et l'amélioration des conditions de travail.
            Notre détermination nous a permis de devenir <strong>le syndicat numéro un dans l'UES</strong>.
          </p>
        </div>

        <SecLabel>Nos 3 piliers fondamentaux</SecLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
          {[
            { icon: '🤝', t: 'Solidarité',   d: "Personne n'est laissé seul face à l'employeur." },
            { icon: '👁️', t: 'Transparence', d: 'Une information claire sur toutes les décisions.' },
            { icon: '🔥', t: 'Courage',       d: 'Oser dire non quand les droits sont bafoués.' },
          ].map(p => (
            <div key={p.t} style={{ background: SMOKE, padding: '15px', borderRadius: 12, textAlign: 'center', borderBottom: `4px solid ${RED}` }}>
              <div style={{ fontSize: 24, marginBottom: 5 }}>{p.icon}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', marginBottom: 5 }}>{p.t}</div>
              <div style={{ fontSize: 11, color: MID }}>{p.d}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff5f5', padding: '15px', borderRadius: 12, border: `1px solid ${RED}`, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 24 }}>⭐</div>
          <p style={{ fontSize: 12, color: MID, margin: 0 }}>
            <strong>Voter FO, c'est choisir un syndicat reconnu :</strong> Acteur puissant et crédible auprès de la branche télécom. Plus nous sommes forts, plus vos messages sont entendus.
          </p>
        </div>
      </div>
      <PageFooter />
    </A4Page>
  );
}

function Page3() {
  return (
    <A4Page>
      <PageHeader title="Objectifs & Actions" />
      <div style={{ background: RED, padding: '10px 20px', color: 'white', fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, textAlign: 'center' }}>
        FO COM UES ILIAD — Un syndicat libre et indépendant
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 15 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 20, alignItems: 'center', background: SMOKE, padding: '15px', borderRadius: 12 }}>
          <div>
            <SecLabel>Indépendance totale</SecLabel>
            <p style={{ fontSize: 12, color: MID, lineHeight: 1.6 }}>
              Le seul syndicat libre et indépendant. C'est la garantie de servir vos intérêts sans aucune influence extérieure.
              <br /><br />
              <strong>Démocratie :</strong> Chaque décision est prise en assemblée, à la majorité.
            </p>
          </div>
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 110, border: `3px solid ${RED}` }}>
            <img src="/candidats/adiallo.png" alt="Awa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, width: '100%', background: RED, color: 'white', fontSize: 10, textAlign: 'center', fontWeight: 700, padding: '2px 0' }}>Awa</div>
          </div>
        </div>

        <div style={{ background: DARK, padding: '10px', borderRadius: 8, color: 'white', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontSize: 14, textTransform: 'uppercase' }}>
          ⚖️ Nos objectifs sur les 4 ans à venir
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: '🚫', t: 'Fini le « Fait Accompli »',      d: "Transparence totale sur les réorganisations. Chaque impacté doit être consulté en amont." },
            { icon: '🪪', t: 'Identité Professionnelle',        d: "Respect strict des contrats. On ne change pas un intitulé de poste en un clic." },
            { icon: '💶', t: 'Salaire de base solide',          d: "Priorité à la revalorisation du fixe face à l'inflation. Moins de primes, plus de garanties." },
            { icon: '🎓', t: 'Compétences & Sens',              d: "Formations certifiantes et sécurité SST sans flicage. L'expertise est notre force." },
          ].map((obj, i) => (
            <div key={i} style={{ background: SMOKE, padding: '12px', borderRadius: 10, borderLeft: `4px solid ${RED}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span>{obj.icon}</span>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>{obj.t}</span>
              </div>
              <p style={{ fontSize: 11, color: MID, lineHeight: 1.4 }}>{obj.d}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff5f5', padding: '15px', borderRadius: 12, borderLeft: `5px solid ${RED}`, display: 'flex', gap: 12, alignItems: 'center' }}>
          <Lightbulb style={{ color: RED, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: MID, margin: 0 }}>
            <strong>Le saviez-vous ?</strong> Un CSE fort peut bloquer des décisions unilatérales et imposer des négociations sur la QVT. Votre vote est l'outil légal pour nous donner ce pouvoir.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', padding: '10px 0' }}>
          {[
            { name: 'Yacine', photo: '/candidats/nysidibe.jpg' },
            { name: 'Fabien', photo: '/candidats/fracault.jpg' },
            { name: 'Awa',    photo: '/candidats/adiallo.png'  },
            { name: 'Fadil',  photo: '/candidats/fkendira.png' },
          ].map(p => (
            <div key={p.name} style={{ textAlign: 'center', width: 70 }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', border: `2px solid ${RED}`, overflow: 'hidden', margin: '0 auto 5px', background: '#eee' }}>
                <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'Oswald, sans-serif' }}>{p.name}</span>
            </div>
          ))}
        </div>

        <div style={{ background: SMOKE, padding: '15px', borderRadius: 12, borderLeft: `4px solid ${RED}` }}>
          <SecLabel>Engagements</SecLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            {["Défendre tous les salariés", "Meilleures subventions", "Actions concrètes", "Gestion démocratique"].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: MID }}>
                <CheckCircle size={12} color={RED} /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
      <PageFooter />
    </A4Page>
  );
}

function Page4() {
  return (
    <A4Page>
      <PageHeader title="Vos Candidats" />
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 15 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: SMOKE, padding: '12px', borderRadius: 10, borderLeft: `5px solid ${RED}` }}>
          <div style={{ fontSize: 24 }}>👥</div>
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, textTransform: 'uppercase' }}>Une équipe engagée pour vous défendre</div>
            <div style={{ fontSize: 11, color: MID }}>Vote électronique — Du 29 avril au 6 mai 2026</div>
          </div>
        </div>

        <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #2d1010 100%)`, borderRadius: 14, padding: '20px', color: 'white', textAlign: 'center', border: `3px solid ${RED}` }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
            🗳️ VOTEZ POUR LA LISTE FO — <span style={{ color: RED }}>PAS UN SEUL NOM !</span>
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.6, opacity: 0.9 }}>
            Le 2<sup>ème</sup> tour fonctionne à la <strong>représentation proportionnelle par liste</strong>.
            Votre bulletin vaut pour <strong>toute l'équipe FO COM UES ILIAD</strong>.
            <br /><strong style={{ color: '#ffd700' }}>Ne panachez pas : votez FO en bloc !</strong>
          </p>
        </div>

        {/* SECTION TITULAIRES */}
<div>
  <div style={{ background: RED, color: 'white', padding: '8px', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, borderRadius: '8px 8px 0 0' }}>
    Titulaires — Employés
  </div>
  <div style={{ border: '1px solid #ddd', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
    {titulaires.map((c, i) => (
      <div key={i} style={{ 
        padding: '5px 10px', 
        fontSize: 10, 
        borderBottom: '1px solid #eee', 
        background: i % 2 === 0 ? SMOKE : 'white', 
        display: 'flex', 
        gap: 8,
        color: MID, /* <-- UTILISATION DE VOTRE COULEUR 'MID' (ou '#475569' pour un gris ardoise) */
        fontWeight: 600 
      }}>
        <span style={{ background: RED, color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, flexShrink: 0 }}>
          {i + 1}
        </span>
        <span>{c.name || `${c.prenom || ''} ${c.nom || ''}`}</span>
      </div>
    ))}
  </div>
</div>

{/* SECTION SUPPLÉANTS */}
<div>
  <div style={{ background: MID, color: 'white', padding: '8px', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, borderRadius: '8px 8px 0 0' }}>
    Suppléants — Employés
  </div>
  <div style={{ border: '1px solid #ddd', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
    {suppleants.map((c, i) => (
      <div key={i} style={{ 
        padding: '5px 10px', 
        fontSize: 10, 
        borderBottom: '1px solid #eee', 
        background: i % 2 === 0 ? SMOKE : 'white', 
        display: 'flex', 
        gap: 8,
        color: MID, /* <-- UTILISATION DE VOTRE COULEUR 'MID' */
        fontWeight: 600 
      }}>
        <span style={{ background: MID, color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, flexShrink: 0 }}>
          {i + 1}
        </span>
        <span>{c.name || `${c.prenom || ''} ${c.nom || ''}`}</span>
      </div>
    ))}
  </div>
</div>

        <div style={{ background: SMOKE, padding: '12px', borderRadius: 10, textAlign: 'center', borderTop: `4px solid ${RED}` }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: DARK, margin: 0 }}>
            <strong style={{ color: RED }}>Votre Voix, Notre Force :</strong> Plus nous serons nombreux, plus nous serons forts.
          </p>
        </div>

        <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: 12, borderLeft: `5px solid ${RED}` }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13, color: DARK, marginBottom: 8 }}>📧 Contactez-nous</div>
          <div style={{ fontSize: 11, color: MID, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            <div>📧 contact@focomues-iliad.fr</div>
            <div>🌐 focomues-iliad.fr</div>
            <div style={{ gridColumn: 'span 2' }}>📘 facebook.com/groups/focomiliad</div>
          </div>
        </div>
      </div>
      <PageFooter />
    </A4Page>
  );
}

// ─── Export principal ─────────────────────────────────────────────────────────

export default function ProfessionDeFoiT2() {
  return (
    <div style={{ background: '#8a8a8a', padding: '20px 0' }}>
      <div
        className="print:hidden"
        style={{ maxWidth: '210mm', margin: '0 auto 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', padding: '0 20px' }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 'bold' }}>Profession de foi — Export PDF</h2>
        <Button onClick={() => window.print()} className="bg-red-600 hover:bg-red-700 text-white font-bold gap-2">
          <Printer className="h-4 w-4" /> Imprimer en PDF
        </Button>
      </div>
      <div id="fo-pdf-root">
        <Page1 />
        <Page2 />
        <Page3 />
        <Page4 />
      </div>
    </div>
  );
}
