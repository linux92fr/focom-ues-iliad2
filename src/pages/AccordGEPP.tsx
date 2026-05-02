import ScrollToTop from '@/components/ScrollToTop';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  FileText, Users, GraduationCap, Briefcase, ArrowRight,
  Shield, Brain, CheckCircle, Clock, Banknote, Info,
  TrendingUp, Star, Lightbulb, Calculator,
} from 'lucide-react';

const AccordGEPP = () => {
  return (
    <div className="p-4 lg:p-8">
      <ScrollToTop />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl space-y-10">

          {/* ── Hero ── */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Accord GEPP 2026</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Gestion des Emplois et des Parcours Professionnels — UES Iliad<br />
              <span className="text-sm">Signé au terme de 8 séances de négociations par FO Com</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Star className="h-3.5 w-3.5" />
                Dispositifs ouverts pour 2026
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800/40 px-4 py-1.5 text-sm font-medium text-green-800 dark:text-green-400">
                <CheckCircle className="h-3.5 w-3.5" />
                100 % sur la base du volontariat
              </div>
            </div>
          </div>

          {/* ── Chiffres clés ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Chiffres clés de l'accord
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { value: '1 700',    label: 'Salariés potentiellement concernés',  icon: Users },
                  { value: '288',      label: 'Postes identifiés en décroissance',    icon: Briefcase },
                  { value: '12 000 €', label: 'Prime de mobilité interne',            icon: Banknote },
                  { value: '75 %',     label: 'Du salaire maintenu pendant le congé', icon: Shield },
                  { value: '70 000 €', label: "Indemnité de départ maximum",          icon: Banknote },
                  { value: '9 mois',   label: 'De congé mobilité pour reconversion',  icon: Clock },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="rounded-xl border border-border bg-muted/30 p-4 text-center flex flex-col items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="text-2xl md:text-3xl font-bold text-primary">{item.value}</div>
                      <div className="text-xs text-muted-foreground leading-tight">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ── Section titre ── */}
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
              <Briefcase className="h-6 w-6 text-primary" />
              Vos droits selon votre situation
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-4">

              {/* Card 1 — Mobilité interne */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">Emplois en décroissance · CDI</Badge>
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/40">✓ Vous restez dans l'entreprise</Badge>
                  </div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Mobilité interne
                  </CardTitle>
                  <p className="text-xs text-muted-foreground italic">Vous changez de poste en interne — le contrat CDI se poursuit.</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Maintien de votre <strong className="text-foreground">salaire fixe</strong> garanti</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Variable moyen maintenu <strong className="text-foreground">6 mois</strong></li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><strong className="text-foreground">Prime 12 000 €</strong> brut après probatoire</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>+500 € si +50 ans ou RQTH</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Période probatoire sécurisée d'1 mois + retour possible</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Card 2 — Congé mobilité emploi salarié */}
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">Emplois en décroissance · CDI</Badge>
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/40">→ Vous quittez l'entreprise</Badge>
                  </div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Congé mobilité — emploi salarié
                  </CardTitle>
                  <p className="text-xs text-muted-foreground italic">Vous cherchez un CDI ailleurs — rupture accompagnée et indemnisée.</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><strong className="text-foreground">6 mois</strong> rémunérés à <strong className="text-foreground">75 % du salaire</strong></li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>+3 mois si 50 ans ou RQTH</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Aide à la formation : <strong className="text-foreground">4 000 €</strong> CPF abondé</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Prime de concrétisation rapide si CDI signé tôt</li>
<li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Indemnité de départ : <strong className="text-foreground">ICL + 1,5 × ICL — plafonné 70 000 €</strong> (art. 26.l)</li>                  </ul>
                </CardContent>
              </Card>

              {/* Card 3 — Reconversion */}
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="text-xs bg-muted text-muted-foreground mb-2 w-fit">Emplois en décroissance · CDI</Badge>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Congé mobilité — reconversion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><strong className="text-foreground">9 mois</strong> rémunérés à <strong className="text-foreground">75 % du salaire</strong></li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Formation prise en charge jusqu'à <strong className="text-foreground">10 000 €</strong></li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>+2 000 € si 50 ans ou RQTH</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Indemnité de départ : <strong className="text-foreground">ICL + 1,5 × ICL — plafonné 70 000 €</strong> (art. 26.l)</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Retour possible si période d'essai non concluante</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Card 4 — Création d'entreprise */}
              <Card>
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="text-xs bg-muted text-muted-foreground mb-2 w-fit">Emplois en décroissance · CDI</Badge>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-primary" />
                    Création / reprise d'entreprise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><strong className="text-foreground">9 mois</strong> de congé mobilité à <strong className="text-foreground">75 %</strong></li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Aide de <strong className="text-foreground">12 000 €</strong> brut (8 000 € auto-entrepreneur)</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Accompagnement par un cabinet extérieur</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Indemnité de départ : <strong className="text-foreground">ICL + 1,5 × ICL — plafonné 70 000 €</strong> (art. 26.l)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Formation ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Formation — ouverts à tous selon conditions d'ancienneté
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                  <strong className="text-primary text-sm block">CPF abondé 1 000 €</strong>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    +45 ans, 10 ans même poste, RQTH ou emploi en décroissance — ancienneté 5 ans min.
                  </span>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                  <strong className="text-primary text-sm block">Bilan de compétences 1 500 €</strong>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    + 24h sur temps de travail pris en charge — ancienneté 5 ans min.
                  </span>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                  <strong className="text-primary text-sm block">VAE : 48h salaire maintenu</strong>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    + abondement CPF 1 500 € — ancienneté 2 ans (maintien) / 5 ans (abondement).
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Fin de carrière ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Fin de carrière
                <Badge variant="outline" className="text-xs font-normal ml-1">Emploi en décroissance · Retraite à taux plein</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/60">
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Ancienneté</th>
                      <th className="px-4 py-3 font-semibold text-foreground text-left">Avantages</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-4 py-3 font-medium text-foreground">5 à 10 ans</td>
                      <td className="px-4 py-3 text-muted-foreground">Indemnité légale + <strong className="text-foreground">3 mois</strong> de salaire supplémentaires</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-3 font-medium text-foreground">10 à 15 ans</td>
                      <td className="px-4 py-3 text-muted-foreground">Indemnité légale + <strong className="text-foreground">4 mois</strong> de salaire supplémentaires</td>
                    </tr>
                    <tr className="border-t border-border bg-primary/5">
                      <td className="px-4 py-3 font-bold text-foreground">15 ans et +</td>
                      <td className="px-4 py-3 text-muted-foreground">Indemnité légale + <strong className="text-foreground">6 mois</strong> de salaire supplémentaires — aide rachat trimestres jusqu'à <strong className="text-foreground">5 000 €</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* ── Volontariat ── */}
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">100 % sur la base du volontariat</h2>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed max-w-2xl">
                Aucun dispositif ne peut vous être imposé. Chaque adhésion repose sur votre choix personnel et votre libre consentement.
                FO Com rappelle que cet accord est un levier pour <em>votre</em> projet professionnel, pas une contrainte de la direction.
                Pour les mobilités externes, la réussite dépend d'un projet sérieux et bien préparé en amont — les équipes RH et un cabinet externe sont là pour vous accompagner.
              </p>
            </div>
          </div>

          {/* ── IA Band ── */}
          <Card className="border-primary/30 bg-primary/5 dark:bg-primary/10 overflow-hidden">
            <CardContent className="py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="inline-flex items-center gap-2 shrink-0 rounded-lg bg-primary px-3 py-2">
                <Brain className="h-4 w-4 text-primary-foreground" />
                <span className="text-primary-foreground font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Nouveau : Académie IA</span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                FO Com a obtenu que l'IA soit inscrite dans le dialogue social :{' '}
                <strong className="text-foreground">formations concrètes, consultation du CSE avant tout déploiement impactant</strong>,
                et accès des représentants du personnel aux formations dédiées.
              </p>
            </CardContent>
          </Card>

          {/* ── CTA Simulateur ── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm mt-4">
            {/* Effet lumineux décoratif en arrière-plan */}
            <div className="absolute -right-10 -top-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/25">
                <Calculator className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Vous envisagez une mobilité ?</h2>
                <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                  Estimez instantanément vos droits, vos primes de mobilité interne ou vos indemnités de départ grâce à notre simulateur exclusif FO Com.
                </p>
              </div>
            </div>
            
            <div className="relative z-10 shrink-0 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto gap-2 shadow-xl hover:scale-105 transition-transform duration-300">
                <Link to="/simulateur-mobilite">
                  Accéder au simulateur
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AccordGEPP;
