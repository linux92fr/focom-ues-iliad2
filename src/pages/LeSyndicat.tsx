import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  ClipboardList,
  Flag,
  Globe,
  Handshake,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

const missions = [
  {
    icon: Target,
    title: "Défense des droits",
    description: "Nous représentons et défendons les intérêts des salariés dans les instances, les négociations et les situations individuelles ou collectives.",
  },
  {
    icon: Globe,
    title: "Information et formation",
    description: "Nous informons les salariés sur leurs droits, les accords, les consultations CSE et les enjeux sociaux du groupe.",
  },
  {
    icon: Handshake,
    title: "Négociation collective",
    description: "Nous portons les revendications FO COM pour améliorer les salaires, les conditions de travail, les avantages sociaux et le dialogue social.",
  },
];

const keyFigures = [
  { icon: Users, value: "200+", label: "adhérents et sympathisants mobilisés" },
  { icon: ShieldCheck, value: "5", label: "sociétés représentées dans l’UES" },
  { icon: ClipboardList, value: "CSE", label: "actions suivies et bilan de mandat" },
];

const entities = ["Free SAS", "ILIAD SA", "Free Réseau", "Free Mobile", "Assunet"];

const representants = [
  {
    nom: "N'deye Yacine SIDIBÉ",
    poste: "Secrétaire Générale du Syndicat FOCOM UES ILIAD",
    service: "FREE RÉSEAU",
    email: "nysidibe@focomues-iliad.fr",
    telephone: "06.23.29.02.23",
    mandat: "Élue Titulaire CSE, Déléguée Syndicale",
    photo: "/candidats/nysidibe.jpg",
  },
  {
    nom: "Mounir ZERARKA",
    poste: "Conducteur de Travaux",
    service: "FREE MOBILE",
    email: "mounir@focomues-iliad.fr",
    telephone: "06.50.95.86.66",
    mandat: "Délégué Syndical, Élu Titulaire CSE",
    photo: "/candidats/mzerarka.png",
  },
  {
    nom: "Anthony LAVILLE",
    poste: "TMF (ex-TFO)",
    service: "FREE RÉSEAU",
    email: "alaville@focomues-iliad.fr",
    telephone: "07.60.15.10.79",
    mandat: "Délégué Syndical",
    photo: "/candidats/alaville.png",
  },
  {
    nom: "Fabien RACAULT",
    poste: "TMF (ex-TFO)",
    service: "ROF (ex-Free Infra)",
    email: "fabien@focomues-iliad.fr",
    telephone: "06.31.57.33.42",
    mandat: "Élu Titulaire CSE, Délégué syndical, Membre CSSCT",
  },
  {
    nom: "Didier BROU",
    poste: "CIR (ex-VPI)",
    service: "FREE RÉSEAU",
    email: "didier@focomues-iliad.fr",
    telephone: "06.50.54.10.32",
    mandat: "Représentant syndical",
    photo: "/candidats/dbrou.png",
  },
  {
    nom: "Fadil KENDIRA",
    poste: "TMRE (ex-PDEM)",
    service: "FREE RÉSEAU",
    email: "fadil@focomues-iliad.fr",
    telephone: "06.50.77.28.25",
    mandat: "Délégué syndical, Élu Titulaire CSE, Administrateur du site",
  },
  {
    nom: "Régis CRITON",
    poste: "Retraité — Ex Concepteur FM",
    service: "FREE MOBILE",
    email: "",
    mandat: "Ex-Délégué syndical, Ex-Élu du CSE, Ex-Commission Économique",
  },
];

const presenceTerrain = [
  {
    icon: Building2,
    title: "Présence dans les entités",
    text: "Des représentants et relais FO COM présents dans les sociétés de l’UES : Free SAS, ILIAD SA, Free Réseau, Free Mobile et Assunet.",
  },
  {
    icon: MapPin,
    title: "Relais régionaux et terrain",
    text: "Un lien direct avec les équipes terrain, les techniciens, les fonctions support, les cadres et les salariés des différents sites.",
  },
  {
    icon: Handshake,
    title: "Accompagnement de proximité",
    text: "Écoute, conseils, préparation des dossiers, accompagnement individuel et remontée des situations collectives auprès des instances.",
  },
];

const historyTimeline = [
  {
    year: "1895",
    title: "Naissance du syndicalisme confédéré",
    description: "Création de la CGT, premier syndicat national, dans un contexte de structuration du mouvement ouvrier.",
  },
  {
    year: "1947",
    title: "Naissance de Force Ouvrière",
    description: "Création de FO pour défendre un syndicalisme libre, réformiste et indépendant des partis politiques.",
  },
  {
    year: "1948",
    title: "Affirmation des principes FO",
    description: "Indépendance, démocratie syndicale, laïcité et défense des droits des salariés deviennent les piliers de l’organisation.",
  },
  {
    year: "2000s",
    title: "FO COM dans les télécoms",
    description: "Développement de la Fédération FO Communication dans les télécommunications, l’audiovisuel, la presse et les nouvelles technologies.",
  },
  {
    year: "Aujourd’hui",
    title: "FO COM UES ILIAD",
    description: "Une représentation active des salariés du groupe ILIAD : Free SAS, ILIAD SA, Free Réseau, Free Mobile et Assunet.",
  },
];

const representatives = [
  {
    role: "Représentation syndicale",
    text: "Vos délégués FO COM accompagnent les salariés, portent les revendications et interviennent auprès de la Direction lorsque c’est nécessaire.",
  },
  {
    role: "Élus CSE",
    text: "Les élus FO COM participent aux consultations, expertises, réclamations, travaux de commissions et actions de terrain.",
  },
  {
    role: "Relais de proximité",
    text: "FO COM s’appuie sur des salariés engagés dans les différentes entités de l’UES pour rester au plus près du terrain.",
  },
];

function getInitials(nom: string) {
  return nom
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

function cleanTel(phone: string) {
  return phone.replace(/[^0-9+]/g, "");
}

function RepresentantCard({ rep }: { rep: typeof representants[number] }) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = Boolean(rep.photo && !imgError);

  return (
    <Card className="group overflow-hidden border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-100 hover:shadow-md">
      <CardContent className="flex h-full flex-col items-center p-5 text-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-red-600 to-red-800 text-xl font-black text-white shadow-md">
          {showPhoto ? (
            <img
              src={rep.photo}
              alt={rep.nom}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{getInitials(rep.nom)}</span>
          )}
        </div>

        <div className="mt-4 min-w-0">
          <h3 className="text-base font-extrabold leading-tight text-slate-900 group-hover:text-red-600">{rep.nom}</h3>
          <Badge variant="outline" className="mt-2 whitespace-normal border-red-200 bg-red-50 text-center text-[10px] leading-tight text-red-700">
            {rep.mandat}
          </Badge>
        </div>

        <div className="mt-4 w-full space-y-2 text-sm">
          <div className="flex items-center justify-center gap-1.5 font-medium text-slate-700">
            <Briefcase className="h-3.5 w-3.5 shrink-0 text-teal-600" />
            <span className="truncate">{rep.poste}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-slate-500">
            <Flag className="h-3.5 w-3.5 shrink-0 text-teal-600" />
            <span>{rep.service}</span>
          </div>
        </div>

        <div className="mt-4 w-full border-t border-slate-100 pt-4 text-xs text-slate-500">
          {rep.email && (
            <a href={`mailto:${rep.email}`} className="flex items-center justify-center gap-1.5 hover:text-red-600">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{rep.email}</span>
            </a>
          )}
          {rep.telephone && (
            <a href={`tel:${cleanTel(rep.telephone)}`} className="mt-2 flex items-center justify-center gap-1.5 hover:text-red-600">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{rep.telephone}</span>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LeSyndicat() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10">À propos</Badge>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Le syndicat FO COM UES ILIAD
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-lg">
              FO COM UES ILIAD représente les salariés du groupe ILIAD. Notre rôle : informer, défendre, négocier et construire un rapport de force utile au quotidien.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {entities.map((entity) => (
                <span key={entity} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                  {entity}
                </span>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-red-600 text-white hover:bg-red-700">
                <Link to="/adhesion">Adhérer à FO COM <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/contact">Contacter un représentant</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {keyFigures.map((figure) => (
              <div key={figure.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <figure.icon className="mb-3 h-5 w-5 text-red-200" />
                <p className="text-3xl font-black text-white">{figure.value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/60">{figure.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {missions.map((mission) => (
          <Card key={mission.title} className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <mission.icon className="h-5 w-5" />
              </div>
              <h2 className="font-extrabold text-slate-900">{mission.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{mission.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-8 space-y-5">
        <div className="text-center">
          <Badge variant="secondary" className="mb-3">Équipe syndicale</Badge>
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Nos Représentants FOCOM UES ILIAD</h2>
          <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Une équipe de représentants élus et mandatés pour défendre vos droits, vous accompagner et porter vos revendications au sein de l’UES ILIAD.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {representants.map((rep) => (
            <RepresentantCard key={rep.nom} rep={rep} />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge className="mb-3 bg-teal-50 text-teal-700 hover:bg-teal-50">Présence terrain</Badge>
            <h2 className="text-2xl font-extrabold text-slate-900">Un syndicat au plus près des salariés</h2>
            <p className="mt-1 text-sm text-slate-500">Une alternative plus claire qu’une carte : qui nous représentons, où nous intervenons, comment nous accompagnons.</p>
          </div>
          <Button asChild variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
            <Link to="/contact">Demander un contact</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {presenceTerrain.map((item) => (
            <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Comprendre notre action syndicale</h2>
            <p className="mt-1 text-sm text-slate-500">
              Consultez le bilan CSE, suivez les élections, découvrez nos positions et contactez vos représentants.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-red-600 text-white hover:bg-red-700">
              <Link to="/bilan-mandat">Voir le bilan CSE</Link>
            </Button>
            <Button asChild variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
              <Link to="/elections">Résultats CSE 2026</Link>
            </Button>
          </div>
        </div>
      </section>

      <Tabs defaultValue="presentation" className="mt-8">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="presentation">Présentation</TabsTrigger>
          <TabsTrigger value="histoire">Notre histoire</TabsTrigger>
        </TabsList>

        <TabsContent value="presentation" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Notre engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  FO COM UES ILIAD agit pour la reconnaissance des droits des salariés, l’amélioration des conditions de travail, la prévention des risques professionnels et le maintien d’un dialogue social réellement utile.
                </p>
                <p>
                  Nous portons les valeurs de solidarité, d’égalité, d’indépendance syndicale et de justice sociale dans toutes nos actions et revendications.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline">Force Ouvrière</Badge>
                  <Badge variant="outline">FO COM</Badge>
                  <Badge variant="outline">UES ILIAD</Badge>
                  <Badge variant="outline">Négociation collective</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Représentants et relais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {representatives.map((item) => (
                  <div key={item.role} className="rounded-xl bg-slate-50 p-4">
                    <p className="font-bold text-slate-900">{item.role}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="histoire" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <CardTitle>L’histoire de Force Ouvrière</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  Force Ouvrière naît en décembre 1947 d’une scission au sein de la CGT, dans un contexte de fortes tensions politiques. Des militants réformistes souhaitent défendre une organisation syndicale indépendante.
                </p>
                <p>
                  FO affirme ses principes fondateurs : indépendance vis-à-vis des partis politiques et des gouvernements, démocratie syndicale, laïcité et défense des travailleurs par la négociation et le rapport de force.
                </p>
                <div className="rounded-xl border-l-4 border-red-600 bg-red-50 p-4">
                  <p className="font-bold text-slate-900">FO COM dans les télécoms</p>
                  <p className="mt-1 text-sm text-slate-600">
                    FO COM regroupe les syndicats du secteur des télécommunications, de l’audiovisuel, de la presse et des nouvelles technologies.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="relative space-y-4">
              <div className="absolute bottom-0 left-4 top-2 w-0.5 bg-slate-200" />
              {historyTimeline.map((event) => (
                <div key={event.year} className="relative pl-10">
                  <div className="absolute left-2 top-4 h-5 w-5 rounded-full border-4 border-white bg-red-600 shadow" />
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{event.year}</Badge>
                        <h3 className="font-extrabold text-slate-900">{event.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">{event.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <section className="mt-8 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white shadow-lg sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-xl font-extrabold">Besoin d’un représentant FO COM ?</h2>
            <p className="mt-2 text-sm leading-relaxed text-teal-50">
              Une question sur vos droits, un dossier individuel, une difficulté avec la Direction ou un besoin d’accompagnement : contactez-nous.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-white text-teal-700 hover:bg-teal-50">
              <Link to="/contact"><Mail className="mr-2 h-4 w-4" /> Contact</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
              <a href="tel:0187154311"><Phone className="mr-2 h-4 w-4" /> 01 87 15 43 11</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
