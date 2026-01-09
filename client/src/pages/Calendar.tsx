import { useState, useMemo, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin,
  ExternalLink,
  Clock,
  X
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  startOfWeek, 
  endOfWeek,
  isAfter,
  isBefore,
  addMonths,
  subMonths
} from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

type EventType = "webinar" | "workshop" | "conference" | "networking" | "other";

interface Event {
  id: number;
  titlePt: string;
  titleEn: string;
  descriptionPt?: string | null;
  descriptionEn?: string | null;
  eventType: EventType;
  location: string | null;
  eventDate: Date;
  eventUrl?: string | null;
  imageUrl?: string | null;
}

const EVENT_TYPE_LABELS: Record<EventType, { pt: string; en: string }> = {
  webinar: { pt: "Webinar", en: "Webinar" },
  workshop: { pt: "Workshop", en: "Workshop" },
  conference: { pt: "Conferência", en: "Conference" },
  networking: { pt: "Networking", en: "Networking" },
  other: { pt: "Outro", en: "Other" },
};

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  webinar: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  workshop: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  conference: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  networking: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function Calendar() {
  const { t, language } = useI18n();
  const { data: events, isLoading } = trpc.events.getAll.useQuery();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState<EventType | "all">("all");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  
  const locale = language === "pt" ? ptBR : enUS;
  const weekDays = language === "pt" 
    ? ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]
    : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Filter events by type
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (selectedFilter === "all") return events;
    return events.filter(e => e.eventType === selectedFilter);
  }, [events, selectedFilter]);

  // Get all days to display in the calendar
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Group filtered events by day
  const eventsByDay = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    
    filteredEvents.forEach((event) => {
      const dateKey = format(new Date(event.eventDate), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event as Event);
    });
    
    return grouped;
  }, [filteredEvents]);

  // Get events for current month
  const monthEvents = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    return filteredEvents.filter(e => {
      const eventDate = new Date(e.eventDate);
      return eventDate >= monthStart && eventDate <= monthEnd;
    }).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [filteredEvents, currentMonth]);

  // Get default featured event (next upcoming in month)
  const defaultFeaturedEvent = useMemo(() => {
    if (monthEvents.length === 0) return null;
    
    const now = new Date();
    // Get first upcoming event in the current month
    const upcomingInMonth = monthEvents
      .filter(e => isAfter(new Date(e.eventDate), now))
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    
    if (upcomingInMonth.length > 0) {
      return upcomingInMonth[0] as Event;
    }
    
    // If no upcoming in month, get most recent past event in the month
    const pastInMonth = monthEvents
      .filter(e => isBefore(new Date(e.eventDate), now))
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    
    return (pastInMonth[0] as Event) || null;
  }, [monthEvents]);

  // Featured event: selected event or default
  const featuredEvent = useMemo(() => {
    if (selectedEventId !== null) {
      const selected = monthEvents.find(e => e.id === selectedEventId);
      if (selected) return selected as Event;
    }
    return defaultFeaturedEvent;
  }, [selectedEventId, monthEvents, defaultFeaturedEvent]);

  // Reset selected event when month changes
  useEffect(() => {
    setSelectedEventId(null);
  }, [currentMonth]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getEventsForDay = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    return eventsByDay[dateKey] || [];
  };

  const hasEventsOnDay = (day: Date) => {
    return getEventsForDay(day).length > 0;
  };

  const handleDayClick = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      // If only one event, select it directly as featured
      if (dayEvents.length === 1) {
        setSelectedEventId(dayEvents[0].id);
      } else {
        // Multiple events: open modal to choose
        setSelectedDay(day);
        setDayModalOpen(true);
      }
    }
  };

  const handleEventSelect = (eventId: number) => {
    setSelectedEventId(eventId);
    setDayModalOpen(false);
  };

  const getEventTypeLabel = (type: EventType) => {
    return EVENT_TYPE_LABELS[type]?.[language] || type;
  };

  // Count events by type for stats
  const eventCountByType = useMemo(() => {
    if (!events) return {};
    const counts: Record<string, number> = {};
    events.forEach(e => {
      const type = e.eventType || "other";
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [events]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Title and Featured Event */}
            <div className="space-y-8">
              {/* Title Section */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  <span className="text-foreground">{t("calendar.eventsOf")}</span>{" "}
                  <span className="text-primary">{t("calendar.technology")}</span>
                </h1>
                <p className="text-muted-foreground">
                  {t("calendar.subtitle")}
                </p>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={selectedFilter === "all" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => setSelectedFilter("all")}
                >
                  {t("calendar.all")}
                </Button>
                <Button 
                  variant={selectedFilter === "webinar" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => setSelectedFilter("webinar")}
                >
                  Webinars
                </Button>
                <Button 
                  variant={selectedFilter === "workshop" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => setSelectedFilter("workshop")}
                >
                  Workshops
                </Button>
                <Button 
                  variant={selectedFilter === "conference" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => setSelectedFilter("conference")}
                >
                  {t("calendar.conferences")}
                </Button>
                <Button 
                  variant={selectedFilter === "networking" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => setSelectedFilter("networking")}
                >
                  Networking
                </Button>
              </div>

              {/* Featured Event Card */}
              {featuredEvent ? (
                <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
                  {featuredEvent.imageUrl && (
                    <div className="relative aspect-video">
                      <img 
                        src={featuredEvent.imageUrl} 
                        alt={language === "pt" ? featuredEvent.titlePt : featuredEvent.titleEn}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full uppercase">
                          {t("calendar.featured")}
                        </span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase border ${EVENT_TYPE_COLORS[featuredEvent.eventType]}`}>
                          {getEventTypeLabel(featuredEvent.eventType)}
                        </span>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Date Badge */}
                      <div className="flex-shrink-0 text-center">
                        <div className="text-4xl font-bold text-primary">
                          {format(new Date(featuredEvent.eventDate), "dd")}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {format(new Date(featuredEvent.eventDate), "MMM yyyy", { locale })}
                        </div>
                      </div>
                      
                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                          {language === "pt" ? featuredEvent.titlePt : featuredEvent.titleEn}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {language === "pt" ? featuredEvent.descriptionPt : featuredEvent.descriptionEn}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          {featuredEvent.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{featuredEvent.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(featuredEvent.eventDate), "HH:mm", { locale })}</span>
                          </div>
                        </div>
                        
                        {featuredEvent.eventUrl && (
                          <a 
                            href={featuredEvent.eventUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" className="gap-2">
                              {t("calendar.register")}
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/50 bg-card/30">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    {t("calendar.noEvents")}
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Events List - only show if there are events in the month */}
              {monthEvents.length > 1 && featuredEvent && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t("calendar.upcomingEvents")}</h3>
                  <div className="space-y-3">
                    {monthEvents.slice(0, 3).map((event) => (
                      <a 
                        key={event.id}
                        href={event.eventUrl || "#"}
                        target={event.eventUrl ? "_blank" : undefined}
                        rel={event.eventUrl ? "noopener noreferrer" : undefined}
                        className="block group"
                      >
                        <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors">
                          <div className="flex-shrink-0 text-center w-12">
                            <div className="text-lg font-bold text-primary">
                              {format(new Date(event.eventDate), "dd")}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase">
                              {format(new Date(event.eventDate), "MMM", { locale })}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                {language === "pt" ? event.titlePt : event.titleEn}
                              </h4>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${EVENT_TYPE_COLORS[event.eventType as EventType]}`}>
                                {getEventTypeLabel(event.eventType as EventType)}
                              </span>
                            </div>
                            {event.location && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Calendar */}
            <div className="space-y-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold capitalize">
                  {format(currentMonth, "MMMM yyyy", { locale })}
                </h2>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousMonth}
                    aria-label={t("calendar.previousMonth")}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNextMonth}
                    aria-label={t("calendar.nextMonth")}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">{t("common.loading")}</p>
                </div>
              ) : (
                <div className="bg-card/30 rounded-xl border border-border/50 p-4">
                  {/* Week day headers */}
                  <div className="grid grid-cols-7 mb-2">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="p-2 text-center text-xs font-medium text-muted-foreground"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day) => {
                      const isCurrentMonth = isSameMonth(day, currentMonth);
                      const isToday = isSameDay(day, new Date());
                      const hasEvents = hasEventsOnDay(day);
                      const dayEvents = getEventsForDay(day);
                      
                      return (
                        <div
                          key={day.toISOString()}
                          onClick={() => handleDayClick(day)}
                          className={`
                            relative aspect-square flex flex-col items-center justify-center rounded-lg transition-colors
                            ${!isCurrentMonth ? "text-muted-foreground/40" : ""}
                            ${isToday ? "bg-muted/50 ring-1 ring-primary/50" : ""}
                            ${hasEvents && isCurrentMonth ? "cursor-pointer hover:bg-muted/30" : ""}
                          `}
                          title={dayEvents.map(e => language === "pt" ? e.titlePt : e.titleEn).join(", ")}
                        >
                          <span
                            className={`
                              text-sm font-medium
                              ${isToday ? "text-primary font-bold" : ""}
                            `}
                          >
                            {format(day, "d")}
                          </span>
                          
                          {/* Event indicator dot */}
                          {hasEvents && isCurrentMonth && (
                            <div className="absolute bottom-1.5 flex gap-0.5">
                              {dayEvents.slice(0, 3).map((event, i) => (
                                <div 
                                  key={i} 
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    event.eventType === "webinar" ? "bg-blue-400" :
                                    event.eventType === "workshop" ? "bg-purple-400" :
                                    event.eventType === "conference" ? "bg-orange-400" :
                                    event.eventType === "networking" ? "bg-pink-400" :
                                    "bg-primary"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span>Webinar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  <span>Workshop</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                  <span>{language === "pt" ? "Conferência" : "Conference"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                  <span>Networking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm ring-1 ring-primary/50 bg-muted/50"></div>
                  <span>{t("calendar.today")}</span>
                </div>
              </div>

              {/* Stats Section */}
              <Card className="border-border/50 bg-card/30">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">{t("calendar.statistics")}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-2xl font-bold text-primary">
                        {events?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("calendar.totalEvents")}
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-2xl font-bold text-blue-400">
                        {eventCountByType.webinar || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Webinars
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-2xl font-bold text-purple-400">
                        {eventCountByType.workshop || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Workshops
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-2xl font-bold text-orange-400">
                        {eventCountByType.conference || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {language === "pt" ? "Conferências" : "Conferences"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Day Events Modal */}
      <Dialog open={dayModalOpen} onOpenChange={setDayModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDay && (
                <>
                  <span className="text-primary font-bold">
                    {format(selectedDay, "dd")}
                  </span>
                  <span>
                    {format(selectedDay, "MMMM yyyy", { locale })}
                  </span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedDay && getEventsForDay(selectedDay).map((event) => (
              <div 
                key={event.id}
                className={`p-4 rounded-lg border bg-card/50 cursor-pointer transition-colors hover:bg-card/70 ${
                  selectedEventId === event.id 
                    ? "border-primary ring-1 ring-primary/50" 
                    : "border-border/50"
                }`}
                onClick={() => handleEventSelect(event.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-center">
                    <div className="text-lg font-bold text-primary">
                      {format(new Date(event.eventDate), "HH:mm")}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${EVENT_TYPE_COLORS[event.eventType]}`}>
                        {getEventTypeLabel(event.eventType)}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-1">
                      {language === "pt" ? event.titlePt : event.titleEn}
                    </h4>
                    {(event.descriptionPt || event.descriptionEn) && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {language === "pt" ? event.descriptionPt : event.descriptionEn}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant={selectedEventId === event.id ? "default" : "secondary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventSelect(event.id);
                        }}
                      >
                        {selectedEventId === event.id 
                          ? (language === "pt" ? "Selecionado" : "Selected")
                          : (language === "pt" ? "Ver Destaque" : "View Featured")
                        }
                      </Button>
                      {event.eventUrl && (
                        <a 
                          href={event.eventUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button size="sm" variant="outline" className="gap-2">
                            {t("calendar.register")}
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
