import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { PortalPageHero } from "@/components/PortalPageHero";
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ShareWhatsAppButton } from "@/components/ShareWhatsAppButton";
import { buildEventShareText } from "@/lib/whatsapp";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  all_day: boolean;
  event_type: string | null;
  is_public: boolean;
}

const eventTypeLabels: Record<string, { label: string; color: string; border: string }> = {
  reunion: { label: "Réunion", color: "bg-teal-500", border: "border-teal-500" },
  manifestation: { label: "Manifestation", color: "bg-red-500", border: "border-red-500" },
  formation: { label: "Formation", color: "bg-emerald-500", border: "border-emerald-500" },
  assemblee: { label: "Assemblée Générale", color: "bg-blue-500", border: "border-blue-500" },
  autre: { label: "Autre", color: "bg-slate-500", border: "border-slate-500" },
};

const Agenda = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", format(currentMonth, "yyyy-MM")],
    queryFn: async () => {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("start_date", format(start, "yyyy-MM-dd"))
        .lte("start_date", format(end, "yyyy-MM-dd"))
        .eq("is_public", true)
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data as unknown as Event[];
    },
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the first day of the week for padding (Monday = 0)
  const startDayOfWeek = getDay(monthStart);
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.start_date), date));
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return null;
    return format(new Date(dateStr), "HH:mm");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <PageBreadcrumb steps={[{ label: 'Agenda' }]} />

        <PortalPageHero
          eyebrow="Agenda FO COM"
          title="Les rendez-vous de la vie syndicale."
          description="Retrouvez les réunions, formations, mobilisations et temps forts FO COM UES ILIAD."
          icon={CalendarDays}
          badge={`${events.length} événement${events.length > 1 ? 's' : ''} ce mois-ci`}
          aside={
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">
              <Calendar className="h-5 w-5 text-teal-300" />
              <p className="mt-3 text-sm font-extrabold">Un agenda lisible</p>
              <p className="mt-1 text-xs leading-relaxed text-white/65">
                Sélectionnez une date pour consulter les horaires, le lieu et les détails pratiques.
              </p>
            </div>
          }
        />

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <Card className="overflow-hidden rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03] lg:col-span-2">
            <CardHeader className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-red-600">Calendrier</p>
                <CardTitle className="mt-1 text-2xl font-extrabold capitalize tracking-tight text-slate-900">
                  {format(currentMonth, "MMMM yyyy", { locale: fr })}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Mois précédent"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="rounded-xl border-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                  className="rounded-xl border-slate-200 font-semibold"
                >
                  Aujourd'hui
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Mois suivant"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="rounded-xl border-slate-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-3 py-4 sm:px-5 sm:py-5">
              <div className="mb-2 grid grid-cols-7 gap-1">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                  <div key={day} className="py-2 text-center text-[10px] font-extrabold uppercase tracking-wide text-slate-400 sm:text-xs">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: paddingDays }).map((_, index) => (
                  <div key={`padding-${index}`} className="h-20 sm:h-24" />
                ))}

                {daysInMonth.map((day) => {
                  const dayEvents = getEventsForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toString()}
                      type="button"
                      aria-label={`${format(day, "d MMMM yyyy", { locale: fr })}, ${dayEvents.length} événement${dayEvents.length > 1 ? 's' : ''}`}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "h-20 rounded-xl border border-slate-100 bg-white p-1 text-left transition-colors hover:border-teal-200 hover:bg-teal-50/40 sm:h-24 sm:p-1.5",
                        isToday && "border-red-200 bg-red-50/40",
                        isSelected && "border-teal-500 bg-teal-50 ring-2 ring-teal-100",
                        !isSameMonth(day, currentMonth) && "text-muted-foreground opacity-60"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center text-xs font-bold text-slate-700 sm:text-sm",
                          isToday && "rounded-full bg-red-600 text-white"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      <div className="mt-1 space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "truncate rounded px-1 py-0.5 text-[9px] font-semibold text-white sm:text-[10px]",
                              eventTypeLabels[event.event_type || "autre"]?.color || "bg-slate-500"
                            )}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="px-1 text-[9px] text-slate-400 sm:text-[10px]">
                            +{dayEvents.length - 2} autres
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5 lg:sticky lg:top-20">
            <Card className="overflow-hidden rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03]">
              <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Calendar className="h-4 w-4" />
                  </div>
                  {selectedDate
                    ? format(selectedDate, "EEEE d MMMM", { locale: fr })
                    : "Sélectionnez une date"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {isLoading ? (
                  <p className="text-sm text-slate-500">Chargement…</p>
                ) : selectedDate ? (
                  selectedDateEvents.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "border-l-4 py-1 pl-4",
                            eventTypeLabels[event.event_type || "autre"]?.border || "border-slate-500"
                          )}
                        >
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <h3 className="font-extrabold text-slate-900">{event.title}</h3>
                            <Badge variant="outline" className="shrink-0 border-slate-200 text-xs text-slate-600">
                              {eventTypeLabels[event.event_type || "autre"]?.label || "Autre"}
                            </Badge>
                          </div>

                          {event.description && (
                            <p className="mb-2 text-sm leading-relaxed text-slate-500">{event.description}</p>
                          )}

                          <div className="space-y-1">
                            {!event.all_day && (
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock className="h-3.5 w-3.5 text-red-500" />
                                <span>
                                  {formatTime(event.start_date)}
                                  {event.end_date && ` - ${formatTime(event.end_date)}`}
                                </span>
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <MapPin className="h-3.5 w-3.5 text-teal-600" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3">
                            <ShareWhatsAppButton
                              size="sm"
                              label="WhatsApp"
                              text={buildEventShareText(event, `${window.location.origin}/agenda`)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Aucun événement prévu ce jour.</p>
                  )
                ) : (
                  <p className="text-sm leading-relaxed text-slate-500">Cliquez sur une date pour voir les événements.</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03]">
              <CardHeader className="px-5 pb-3 pt-5">
                <CardTitle className="text-lg font-extrabold text-slate-900">Légende</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-2.5">
                  {Object.entries(eventTypeLabels).map(([key, { label, color }]) => (
                    <div key={key} className="flex items-center gap-2.5">
                      <div className={cn("h-2.5 w-2.5 rounded-full", color)} />
                      <span className="text-sm text-slate-500">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Agenda;
