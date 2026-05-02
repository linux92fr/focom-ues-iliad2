import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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

const eventTypeLabels: Record<string, { label: string; color: string }> = {
  reunion: { label: "Réunion", color: "bg-blue-500" },
  manifestation: { label: "Manifestation", color: "bg-red-500" },
  formation: { label: "Formation", color: "bg-green-500" },
  assemblee: { label: "Assemblée Générale", color: "bg-purple-500" },
  autre: { label: "Autre", color: "bg-gray-500" },
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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Agenda Syndical</h1>
          <p className="text-muted-foreground">
            Retrouvez tous les événements et rendez-vous de votre syndicat FOCOM
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: fr })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Aujourd'hui
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for padding */}
                {Array.from({ length: paddingDays }).map((_, index) => (
                  <div key={`padding-${index}`} className="h-20 sm:h-24" />
                ))}

                {/* Days of the month */}
                {daysInMonth.map((day) => {
                  const dayEvents = getEventsForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "h-20 sm:h-24 p-1 border rounded-lg text-left transition-colors hover:bg-accent/50",
                        isToday && "border-primary",
                        isSelected && "bg-accent",
                        !isSameMonth(day, currentMonth) && "text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      <div className="mt-1 space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-xs px-1 py-0.5 rounded truncate text-white",
                              eventTypeLabels[event.event_type || "autre"]?.color || "bg-gray-500"
                            )}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground px-1">
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

          {/* Event details sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {selectedDate
                    ? format(selectedDate, "EEEE d MMMM", { locale: fr })
                    : "Sélectionnez une date"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground text-sm">Chargement...</p>
                ) : selectedDate ? (
                  selectedDateEvents.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className="border-l-4 pl-4 py-2"
                          style={{
                            borderColor: eventTypeLabels[event.event_type || "autre"]?.color.replace("bg-", "") || "#6b7280",
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{event.title}</h4>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {eventTypeLabels[event.event_type || "autre"]?.label || "Autre"}
                            </Badge>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                          )}
                          
                          <div className="space-y-1">
                            {!event.all_day && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>
                                  {formatTime(event.start_date)}
                                  {event.end_date && ` - ${formatTime(event.end_date)}`}
                                </span>
                              </div>
                            )}
                            
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Aucun événement prévu ce jour.
                    </p>
                  )
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Cliquez sur une date pour voir les événements.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Légende</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(eventTypeLabels).map(([key, { label, color }]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded", color)} />
                      <span className="text-sm text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Agenda;
