import React from 'react';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Heart, Users, CheckCircle2, Download } from 'lucide-react';
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

  return (
    <div className="p-4 lg:p-8">

      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Adhérer au syndicat</h1>
            <p className="text-lg text-muted-foreground">
              Rejoignez FOCOM UES ILIAD et participez à la défense de vos droits
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Avantages */}
            <div className="space-y-6">
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
                    La cotisation syndicale est de 35 euros Trimestriel.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Déductible fiscalement de 66 %</span>
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

              {/* Option bulletin papier */}
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Vous préférez le format papier ? Téléchargez le bulletin d'adhésion au format PDF.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('/bulletin-adhesion-focom.pdf', '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le bulletin PDF
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire d'adhésion — remplace le placeholder "en cours de développement" */}
            <AdhesionFormFOCOM />
          </div>
        </div>
      </main>

    </div>
  );
};

export default Adhesion;