import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Heart, Users, CheckCircle2, Download, FileText, PenLine, Send } from 'lucide-react';
import AdhesionFormFOCOM from '@/components/AdhesionFormFOCOM';

const Adhesion = () => {
  const avantages = [
    {
      icon: Shield,
      title: "Protection juridique",
      description: "Assistance et défense en cas de conflit avec l'employeur"
    },
    {
      icon: Users,
      title: "Représentation",
      description: "Votre voix portée dans les instances de l'entreprise"
    },
    {
      icon: Heart,
      title: "Solidarité",
      description: "Faire partie d'un collectif fort et solidaire"
    }
  ];

  const steps = [
    {
      icon: PenLine,
      title: "Remplissez",
      description: "Saisissez vos informations et signez directement en ligne."
    },
    {
      icon: FileText,
      title: "Téléchargez",
      description: "Le bulletin officiel FO COM est généré automatiquement en PDF."
    },
    {
      icon: Send,
      title: "Transmettez",
      description: "Envoyez-le par email ou via la messagerie du site."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10 lg:py-14">
        <div className="max-w-6xl mx-auto">
          <section className="mb-10 overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 lg:p-10 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Bulletin officiel FO COM pré-rempli
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
                  Adhérer au syndicat FO COM UES ILIAD
                </h1>
                <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                  Remplissez le formulaire, signez en ligne, puis téléchargez votre bulletin d'adhésion officiel prêt à transmettre.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground">
                    <a href="#formulaire-adhesion">Commencer l'adhésion</a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open('/bulletin-adhesion.pdf', '_blank')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le PDF vierge
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                {steps.map((step, index) => (
                  <div key={step.title} className="flex gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{index + 1}. {step.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
            <div className="space-y-6 lg:sticky lg:top-20">
              <Card>
                <CardHeader>
                  <CardTitle>Pourquoi adhérer ?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {avantages.map((avantage, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {React.createElement(avantage.icon, { className: "w-6 h-6 text-primary" })}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{avantage.title}</h3>
                        <p className="text-muted-foreground text-sm">{avantage.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cotisation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    La cotisation syndicale est de <strong>35 € par trimestre</strong>.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Déductible fiscalement à hauteur de 66 %</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Prélèvement automatique possible</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Participation aux décisions syndicales</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Vous préférez le format papier ? Téléchargez le bulletin officiel vierge.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('/bulletin-adhesion.pdf', '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le bulletin vierge
                  </Button>
                </CardContent>
              </Card>
            </div>

            <section id="formulaire-adhesion" className="scroll-mt-20">
              <AdhesionFormFOCOM />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Adhesion;
