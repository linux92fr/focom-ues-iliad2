import { useMemo, useState } from "react";
import { CalendarDays, Clock, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formatDate = (d: Date) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const toIso = (d: Date) => [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
function upcomingDates() {
 const today=new Date();today.setHours(0,0,0,0);const dates:Date[]=[];
 for(let offset=0;offset<8&&dates.length<12;offset++){const month=new Date(today.getFullYear(),today.getMonth()+offset,1);let count=0;for(let day=1;day<=31;day++){const d=new Date(month.getFullYear(),month.getMonth(),day);if(d.getMonth()!==month.getMonth())break;if(d.getDay()===3&&++count%2===1&&d>=today)dates.push(d);}}
 return dates.slice(0,12);
}
export default function Permanences(){
 const dates=useMemo(upcomingDates,[]);const [date,setDate]=useState(dates[0]?toIso(dates[0]):"");
 const [form,setForm]=useState({nom:"",prenom:"",email:"",telephone:"",entreprise:"",sujet:"",message:""});
 const [busy,setBusy]=useState(false);const [sent,setSent]=useState(false);const [error,setError]=useState("");
 const change=(key:string,value:string)=>setForm(old=>({...old,[key]:value}));
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError("");const {error:insertError}=await(supabase as any).from("permanence_demandes").insert({...form,date_souhaitee:date,nom:form.nom.trim(),prenom:form.prenom.trim(),email:form.email.trim().toLowerCase(),sujet:form.sujet.trim(),message:form.message.trim()||null});setBusy(false);if(insertError){setError("Votre demande n’a pas pu être transmise. Merci de réessayer ou de nous contacter.");return;}setSent(true);};
 return <div className="mx-auto max-w-5xl space-y-8 p-4 lg:p-8">
 <section className="overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl md:p-10"><div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-teal-300"><CalendarDays className="h-5 w-5"/> FO COM UES ILIAD</div><h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight md:text-5xl">Des permanences syndicales pour vous écouter et vous accompagner.</h1><p className="mt-4 max-w-2xl text-slate-300">Vous souhaitez échanger avec un représentant FO, poser une question ou être accompagné dans une difficulté professionnelle ? Demandez un rendez-vous.</p></section>
 <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><div className="space-y-5">
 <section className="rounded-2xl border bg-card p-6"><h2 className="text-xl font-extrabold">Permanences à Paris</h2><div className="mt-4 space-y-4 text-sm"><div className="flex gap-3"><CalendarDays className="h-5 w-5 text-primary"/><div><b>1er et 3e mercredi de chaque mois</b><p className="text-muted-foreground">Sur rendez-vous</p></div></div><div className="flex gap-3"><Clock className="h-5 w-5 text-primary"/><div><b>De 12 h à 14 h</b><p className="text-muted-foreground">Créneau de permanence</p></div></div><div className="flex gap-3"><MapPin className="h-5 w-5 text-primary"/><div><b>Local FO – Siège social</b><p className="text-muted-foreground">16 rue de la Ville-l’Évêque, Paris 8e</p></div></div></div></section>
 <section className="rounded-2xl border bg-card p-6"><h2 className="font-extrabold">Prochaines dates</h2><ul className="mt-3 space-y-2">{dates.map(d=><li key={toIso(d)} className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2 text-sm"><span className="capitalize">{formatDate(d)}</span><span className="shrink-0 font-semibold text-primary">12 h – 14 h</span></li>)}</ul><p className="mt-3 text-xs text-muted-foreground">Les permanences dans les régions, notamment par téléphone, seront annoncées ultérieurement.</p></section>
 <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5 text-sm text-teal-950"><div className="flex items-center gap-2 font-bold"><ShieldCheck className="h-5 w-5"/> Confidentialité</div><p className="mt-2">Les informations transmises sont destinées à organiser votre rendez-vous et seront traitées avec discrétion par les représentants FO COM.</p></section></div>
 <section className="rounded-2xl border bg-card p-6 md:p-7">{sent?<div className="py-10 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-teal-600"/><h2 className="mt-4 text-2xl font-extrabold">Demande transmise</h2><p className="mt-2 text-muted-foreground">Votre demande a bien été enregistrée. Un représentant FO COM reviendra vers vous pour confirmer le rendez-vous.</p><Button className="mt-6" onClick={()=>{setSent(false);setForm({nom:"",prenom:"",email:"",telephone:"",entreprise:"",sujet:"",message:""});}}>Envoyer une autre demande</Button></div>:<><h2 className="text-2xl font-extrabold">Demander un rendez-vous</h2><p className="mt-1 text-sm text-muted-foreground">La demande ne vaut pas confirmation du rendez-vous.</p><form onSubmit={submit} className="mt-6 space-y-4">
 <div className="grid gap-4 sm:grid-cols-2"><div><Label>Nom *</Label><Input required maxLength={100} value={form.nom} onChange={e=>change("nom",e.target.value)}/></div><div><Label>Prénom *</Label><Input required maxLength={100} value={form.prenom} onChange={e=>change("prenom",e.target.value)}/></div></div>
 <div><Label>Adresse e-mail *</Label><Input required type="email" maxLength={254} value={form.email} onChange={e=>change("email",e.target.value)}/></div>
 <div className="grid gap-4 sm:grid-cols-2"><div><Label>Téléphone</Label><Input type="tel" maxLength={30} value={form.telephone} onChange={e=>change("telephone",e.target.value)}/></div><div><Label>Entreprise / service</Label><Input maxLength={150} value={form.entreprise} onChange={e=>change("entreprise",e.target.value)}/></div></div>
 <div><Label>Date souhaitée *</Label><select required value={date} onChange={e=>setDate(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{dates.map(d=><option key={toIso(d)} value={toIso(d)}>{formatDate(d)}</option>)}</select></div>
 <div><Label>Objet de votre demande *</Label><Input required minLength={2} maxLength={200} value={form.sujet} onChange={e=>change("sujet",e.target.value)} placeholder="Ex. : conditions de travail, rémunération, droits…"/></div>
 <div><Label>Message complémentaire (facultatif)</Label><Textarea maxLength={2000} rows={4} value={form.message} onChange={e=>change("message",e.target.value)} placeholder="Vous pouvez préciser brièvement votre demande."/></div>
 {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit" className="w-full" disabled={busy}>{busy?"Envoi en cours…":"Transmettre ma demande"}</Button><p className="text-xs text-muted-foreground">Ces informations sont utilisées uniquement pour organiser votre prise de contact avec FO COM UES ILIAD.</p></form></>}</section></div></div>;
}
