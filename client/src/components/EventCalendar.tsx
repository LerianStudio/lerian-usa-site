import { useState, useMemo } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";


interface Event {
  id: number;
  titlePt: string;
  titleEn: string;
  descriptionPt?: string | null;
  descriptionEn?: string | null;
  location: string | null;
  eventDate: Date;
  eventUrl?: string | null;
  imageUrl?: string | null;
}

interface EventCalendarProps {
  events: Event[];
}

export function EventCalendar({ events }: EventCalendarProps) {
  const { t, language } = useI18n();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const locale = language === "pt" ? ptBR : enUS;
  const weekDays = language === "pt" 
    ? ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get all days to display in the calendar (including padding days from prev/next month)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { locale });
    const calendarEnd = endOfWeek(monthEnd, { locale });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth, locale]);

  // Group events by day
  const eventsByDay = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    
    events.forEach((event) => {
      const dateKey = format(new Date(event.eventDate), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  }, [events]);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const getEventsForDay = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    return eventsByDay[dateKey] || [];
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale })}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="hidden sm:inline-flex"
          >
            {t("calendar.today")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            aria-label={t("calendar.previousMonth")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            aria-label={t("calendar.nextMonth")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] border-r border-b border-border p-2 ${
                  !isCurrentMonth ? "bg-muted/20" : ""
                } ${index % 7 === 6 ? "border-r-0" : ""}`}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      !isCurrentMonth
                        ? "text-muted-foreground"
                        : isToday
                        ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                        : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <a
                      key={event.id}
                      href={event.eventUrl || "#"}
                      target={event.eventUrl ? "_blank" : undefined}
                      rel={event.eventUrl ? "noopener noreferrer" : undefined}
                      className="block"
                    >
                      <div
                        className="group cursor-pointer bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded px-2 py-1 transition-colors"
                      >
                        <p className="text-xs font-medium text-primary line-clamp-1 group-hover:text-primary">
                          {language === "pt" ? event.titlePt : event.titleEn}
                        </p>
                        {event.location && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            <span className="line-clamp-1">{event.location}</span>
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-muted-foreground text-center py-0.5">
                      +{dayEvents.length - 3} {t("calendar.more")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span>{t("calendar.today")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-primary/20 bg-primary/10"></div>
          <span>{t("calendar.event")}</span>
        </div>
      </div>
    </div>
  );
}
