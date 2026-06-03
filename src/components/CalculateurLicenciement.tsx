import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Scale } from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function CalculateurLicenciement() {
  const [anciennete, setAnciennete] = useState("");
  const [salaireBrut, setSalaireBrut] = useState("");
  const [age, setAge] = useState("");
  const [result, setResult] = useState<null | { legal: number; ccnt: number; applicable: number }>(null);

  const calculer = () => {
    const ans = parseFloat(anciennete);
    const sal = parseFloat(salaireBrut);
    const a = parseFloat(age);
    if (!ans || !sal || ans < 1) return;

    // Minimum légal : 1/4 mois/an jusqu'à 10 ans, puis 1/3
    const salMensuel = sal / 12;
    const legal =
      ans <= 10
        ? (salMensuel * ans) / 4
        : (salMensuel * 10) / 4 + (salMensuel * (ans - 10)) / 3;

    // CCNT : 3 % * salaire annuel * ans (1–9 ans), 4 % au-delà de 10 ans
    let ccnt = 0;
    if (ans <= 9) {
      ccnt = sal * 0.03 * ans;
    } else {
      ccnt = sal * 0.03 * 9 + sal * 0.04 * (ans - 9);
    }
    // Majoration 50+ ans
    if (a >= 50 && ans >= 10) {
      const taux = ans >= 20 ? 0.1 : 0.05;
      ccnt = ccnt * (1 + taux);
    }
    // Plafond 101 % salaire annuel brut
    ccnt = Math.min(ccnt, sal * 1.01);

    setResult({ legal: Math.round(legal), ccnt: Math.round(ccnt), applicable: Math.round(Math.max(legal, ccnt)) });
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="w-5 h-5 text-primary" />
          Simulateur d'indemnité de licenciement
        </CardTitle>
        <CardDescription>
          Compare l'indemnité légale et l'indemnité CCNT — la plus favorable vous est due.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="anciennete">Ancienneté (années)</Label>
            <Input
              id="anciennete"
              type="number"
              min="1"
              placeholder="ex : 8"
              value={anciennete}
              onChange={(e) => setAnciennete(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="salaire">Salaire brut annuel (€)</Label>
            <Input
              id="salaire"
              type="number"
              min="0"
              placeholder="ex : 36000"
              value={salaireBrut}
              onChange={(e) => setSalaireBrut(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="age">Âge (facultatif)</Label>
            <Input
              id="age"
              type="number"
              min="0"
              placeholder="ex : 52"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={calculer} className="w-full sm:w-auto">
          <Calculator className="w-4 h-4 mr-2" /> Calculer
        </Button>

        {result && (
          <div className="grid sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-lg bg-background border text-center">
              <p className="text-xs text-muted-foreground mb-1">Minimum légal</p>
              <p className="text-xl font-bold text-foreground">{fmt(result.legal)}</p>
            </div>
            <div className="p-4 rounded-lg bg-background border text-center">
              <p className="text-xs text-muted-foreground mb-1">Indemnité CCNT</p>
              <p className="text-xl font-bold text-primary">{fmt(result.ccnt)}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-300 text-center">
              <p className="text-xs text-green-700 mb-1 font-semibold flex items-center justify-center gap-1">
                <Scale className="w-3 h-3" /> Montant applicable
              </p>
              <p className="text-xl font-bold text-green-700">{fmt(result.applicable)}</p>
              {result.ccnt > result.legal && (
                <Badge className="mt-1 bg-green-500 text-white text-xs">CCNT plus favorable</Badge>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Simulation indicative — basée sur le salaire de référence (1/12e des 12 derniers mois ou 1/3 des 3 derniers mois, selon le plus favorable). Consultez un représentant syndical pour votre situation.
        </p>
      </CardContent>
    </Card>
  );
}
