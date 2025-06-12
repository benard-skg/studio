
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIconLucide, ChevronLeft, ChevronRight, Info, Tag as TagIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { EventType } from '@/lib/types';
import { format, parseISO, startOfMonth, addMonths, subMonths, isSameDay, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

interface EventCalendarSectionProps {
  events: EventType[];
}

const linkClasses = "transition-all duration-200 ease-out hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-1 focus:ring-ring rounded-sm";

export default function EventCalendarSection({ events }: EventCalendarSectionProps) {
  const router = useRouter();
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  const [animatedMonth, setAnimatedMonth] = useState<Date | null>(null);

  // UI Logging State
  const [uiLogEventsProp, setUiLogEventsProp] = useState<string>("");
  const [uiLogEventDays, setUiLogEventDays] = useState<string>("");
  const [uiLogEventsForSelectedDate, setUiLogEventsForSelectedDate] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
    setUiLogEventsProp(`[EventCalendarSection] Received events prop: ${events ? events.length : 'null/undefined'} items. Data (first 2 shown):\n${JSON.stringify(events?.slice(0,2), null, 2)}`);
    console.log('[EventCalendarSection] Received events prop:', JSON.stringify(events, null, 2));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]); // Only re-run if events prop changes

  const eventDays = useMemo(() => {
    if (!Array.isArray(events)) {
      console.warn('[EventCalendarSection] events prop is not an array:', events);
      setUiLogEventDays(`[EventCalendarSection] Calculated eventDays: events prop is not an array. Received: ${JSON.stringify(events)}`);
      return [];
    }
    const calculatedDays = events.map(event => {
      if (event && typeof event.date === 'string') {
        const parsedDate = parseISO(event.date);
        return isValid(parsedDate) ? parsedDate : null;
      }
      console.warn('[EventCalendarSection] Invalid event or event.date:', event);
      return null;
    }).filter(date => date !== null) as Date[];
    
    setUiLogEventDays(`[EventCalendarSection] Calculated eventDays: ${calculatedDays.length} days with events. Dates:\n${JSON.stringify(calculatedDays.map(d => d.toISOString().substring(0,10)), null, 2)}`);
    console.log('[EventCalendarSection] Calculated eventDays:', calculatedDays);
    return calculatedDays;
  }, [events]);

  const dayHasEvent = (day: Date): boolean => {
    return eventDays.some(eventDate => isSameDay(day, eventDate));
  };

  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate || !Array.isArray(events)) {
      setUiLogEventsForSelectedDate(`[EventCalendarSection] eventsForSelectedDate: No selected date or events is not an array. Selected: ${selectedDate}, Events: ${JSON.stringify(events?.length)}`);
      console.log('[EventCalendarSection] eventsForSelectedDate: No selected date or events is not an array.');
      return [];
    }
    const filteredEvents = events
      .filter(event => {
        if (event && typeof event.date === 'string') {
          const parsedEventDate = parseISO(event.date);
          return isValid(parsedEventDate) && isSameDay(parsedEventDate, selectedDate);
        }
        return false;
      })
      .sort((a, b) => (a.startTime && b.startTime ? a.startTime.localeCompare(b.startTime) : 0));
    
    setUiLogEventsForSelectedDate(`[EventCalendarSection] eventsForSelectedDate (for ${selectedDate.toISOString().substring(0,10)}): ${filteredEvents.length} events. Data:\n${JSON.stringify(filteredEvents, null, 2)}`);
    console.log('[EventCalendarSection] Calculated eventsForSelectedDate (for ' + (selectedDate ? selectedDate.toISOString().substring(0,10) : 'null') + '):', filteredEvents);
    return filteredEvents;
  }, [selectedDate, events]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };
  
  const changeMonth = (newMonth: Date) => {
    setAnimatedMonth(newMonth); 
    setTimeout(() => {
      setCurrentDisplayMonth(startOfMonth(newMonth));
      setAnimatedMonth(null); 
    }, 200); 
  };

  const goToPreviousMonth = () => {
    changeMonth(subMonths(currentDisplayMonth, 1));
  };

  const goToNextMonth = () => {
    changeMonth(addMonths(currentDisplayMonth, 1));
  };

  if (!isMounted) {
    return (
      <section id="event-calendar" className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <CalendarIconLucide className="mx-auto h-12 w-12 text-accent mb-4" />
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
              Upcoming Events
            </h2>
            <p className="font-body text-lg text-muted-foreground mt-2">
              Loading calendar...
            </p>
          </div>
          <div className="max-w-md mx-auto bg-card p-4 sm:p-6 rounded-xl shadow-lg border border-border animate-pulse">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="h-8 w-8 bg-muted rounded-md"></div>
              <div className="h-6 w-32 bg-muted rounded-md"></div>
              <div className="h-8 w-8 bg-muted rounded-md"></div>
            </div>
            <div className="h-64 bg-muted rounded-md"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="event-calendar" className="py-16 md:py-24 bg-secondary transition-opacity duration-500 ease-in-out opacity-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">UI Debug Info (Event Calendar Section):</strong>
            <details className="text-xs mt-1">
                <summary>Events Prop (Raw, first 2)</summary>
                <pre className="whitespace-pre-wrap max-h-32 overflow-y-auto">{uiLogEventsProp}</pre>
            </details>
            <details className="text-xs mt-1">
                <summary>Processed Event Days</summary>
                <pre className="whitespace-pre-wrap max-h-32 overflow-y-auto">{uiLogEventDays}</pre>
            </details>
            <details className="text-xs mt-1">
                <summary>Events for Selected Date</summary>
                <pre className="whitespace-pre-wrap max-h-32 overflow-y-auto">{uiLogEventsForSelectedDate}</pre>
            </details>
        </div>

        <div className="text-center mb-12">
          <CalendarIconLucide className="mx-auto h-12 w-12 text-accent mb-4" />
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
            Upcoming Events
          </h2>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Stay updated with our classes, streams, and tournaments.
          </p>
        </div>

        <Card className="max-w-md mx-auto p-0 sm:p-2 rounded-xl shadow-lg border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 sm:px-2 border-b border-border">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth} aria-label="Previous month" className="hover:bg-accent/20">
              <ChevronLeft className="h-5 w-5 text-accent" />
            </Button>
            <CardTitle className="font-headline text-xl text-foreground tracking-tight">
              {format(currentDisplayMonth, 'MMMM yyyy')}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={goToNextMonth} aria-label="Next month" className="hover:bg-accent/20">
              <ChevronRight className="h-5 w-5 text-accent" />
            </Button>
          </CardHeader>
          <CardContent className={cn(
            "p-2 sm:p-3 transition-transform duration-300 ease-in-out",
            animatedMonth ? (animatedMonth > currentDisplayMonth ? 'animate-slide-left' : 'animate-slide-right') : ''
          )}>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(day) => day && handleDayClick(day)}
              month={currentDisplayMonth}
              onMonthChange={setCurrentDisplayMonth} 
              showOutsideDays={true}
              className="p-0 w-full"
              classNames={{
                months: "p-0",
                month: "space-y-3 p-0",
                caption: "hidden", 
                nav: "hidden", 
                table: "w-full border-collapse",
                head_row: "flex justify-around mb-1",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] uppercase",
                row: "flex w-full mt-1.5 justify-around",
                cell: "p-0 text-center text-sm relative focus-within:relative focus-within:z-20",
                day: cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-9 w-9 p-0 font-normal text-muted-foreground rounded-full hover:bg-accent/10 hover:text-accent transition-all duration-200 ease-in-out hover:scale-110",
                  "aria-selected:opacity-100"
                ),
                day_selected: "bg-accent text-accent-foreground font-bold scale-110 shadow-md animate-pulse-once",
                day_today: "border-2 border-accent/70 text-accent font-semibold rounded-full",
                day_outside: "text-muted-foreground/50 opacity-70",
                day_disabled: "text-muted-foreground/30 opacity-50 cursor-not-allowed",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              }}
              modifiers={{
                eventDay: dayHasEvent,
              }}
              modifiersClassNames={{
                eventDay: 'event-day-modifier', 
              }}
              disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) && !isSameDay(date, new Date())}
            />
          </CardContent>
        </Card>

        {selectedDate && eventsForSelectedDate.length > 0 && (
          <div className="mt-8 max-w-xl mx-auto">
            <h3 className="font-headline text-2xl mb-4 text-center">
              Events on {format(selectedDate, 'MMMM dd, yyyy')}
            </h3>
            <ScrollArea className="h-[300px] rounded-md border border-border shadow-sm bg-card">
              <div className="space-y-3 p-4">
                {eventsForSelectedDate.map(event => (
                  <Card 
                    key={event.id || event.title || Math.random().toString()} // Added fallback key
                    className={cn("shadow-sm hover:shadow-lg transition-shadow cursor-pointer border-border bg-background hover:bg-accent/5", linkClasses)}
                    onClick={() => event.detailsPageSlug && router.push(`/events/${event.detailsPageSlug}`)}
                    tabIndex={0} 
                    onKeyPress={(e) => { if ((e.key === 'Enter' || e.key === ' ') && event.detailsPageSlug) router.push(`/events/${event.detailsPageSlug}`); }}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-headline text-lg text-accent mb-1">{event.title || "Untitled Event"}</h4>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                         <CalendarIconLucide className="h-4 w-4 mr-1.5" />
                         {event.startTime || "Time TBD"} {event.endTime ? `- ${event.endTime}` : ''}
                      </div>
                      {event.type && (
                        <div className="flex items-center text-xs text-muted-foreground mb-2">
                          <TagIcon className="h-3 w-3 mr-1.5" />
                          <span className="capitalize bg-muted px-1.5 py-0.5 rounded-sm">{event.type}</span>
                        </div>
                      )}
                      {event.description && (
                        <p className="font-body text-sm text-card-foreground/80 line-clamp-2">{event.description}</p>
                      )}
                       {!event.detailsPageSlug && (
                        <p className="font-body text-xs text-destructive mt-1">Details page link missing.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
         {selectedDate && eventsForSelectedDate.length === 0 && dayHasEvent(selectedDate) && (
           <div className="mt-8 max-w-xl mx-auto text-center p-6 bg-card rounded-lg shadow-md border border-border">
             <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2"/>
             <p className="font-body text-muted-foreground">No specific event details listed for this day yet.</p>
             <p className="font-body text-xs text-muted-foreground/70 mt-1">It's marked as having activity, details might be general or coming soon.</p>
           </div>
        )}
         {selectedDate && !dayHasEvent(selectedDate) && (
           <div className="mt-8 max-w-xl mx-auto text-center p-6 bg-card rounded-lg shadow-md border border-border">
            <CalendarIconLucide className="h-8 w-8 mx-auto text-muted-foreground mb-2"/>
            <p className="font-body text-muted-foreground">No events scheduled for {format(selectedDate, 'MMMM dd, yyyy')}.</p>
           </div>
         )}
      </div>
    </section>
  );
}
