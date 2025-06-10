
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIconLucide, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventType } from '@/lib/types';
import { format, parseISO, startOfMonth, addMonths, subMonths, isSameDay, isValid } from 'date-fns';

interface EventCalendarSectionProps {
  events: EventType[];
}

export default function EventCalendarSection({ events }: EventCalendarSectionProps) {
  const router = useRouter();
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const eventDays = useMemo(() => {
    return events.map(event => {
      const parsedDate = parseISO(event.date);
      return isValid(parsedDate) ? parsedDate : null;
    }).filter(date => date !== null) as Date[];
  }, [events]);

  const dayHasEvent = (day: Date): boolean => {
    return eventDays.some(eventDate => isSameDay(day, eventDate));
  };

  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return events
      .filter(event => {
        const parsedEventDate = parseISO(event.date);
        return isValid(parsedEventDate) && isSameDay(parsedEventDate, selectedDate);
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, events]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const handleMonthChange = (month: Date) => {
    setCurrentDisplayMonth(startOfMonth(month));
  };
  
  const goToPreviousMonth = () => {
    setCurrentDisplayMonth(subMonths(currentDisplayMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentDisplayMonth(addMonths(currentDisplayMonth, 1));
  };


  return (
    <section id="event-calendar" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <CalendarIconLucide className="mx-auto h-12 w-12 text-accent mb-4" />
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
            Upcoming Events
          </h2>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Stay updated with our classes, streams, and tournaments.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-card p-4 sm:p-6 rounded-xl shadow-lg border border-border">
          <div className="flex items-center justify-between mb-4 px-1">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth} aria-label="Previous month">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h3 className="font-headline text-xl text-foreground">
              {format(currentDisplayMonth, 'MMMM yyyy')}
            </h3>
            <Button variant="ghost" size="icon" onClick={goToNextMonth} aria-label="Next month">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(day) => day && handleDayClick(day)}
            month={currentDisplayMonth}
            onMonthChange={handleMonthChange}
            className="p-0"
            classNames={{
              day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90',
              day_today: 'bg-accent/20 text-accent-foreground',
            }}
            modifiers={{
              eventDay: dayHasEvent,
            }}
            modifiersClassNames={{
              eventDay: 'event-day-modifier',
            }}
            disabled={ (date) => date < new Date(new Date().setDate(new Date().getDate() -1)) && !isSameDay(date, new Date()) } // Example: disable past dates
          />
        </div>

        {selectedDate && eventsForSelectedDate.length > 0 && (
          <div className="mt-8 max-w-xl mx-auto">
            <h3 className="font-headline text-2xl mb-4 text-center">
              Events on {format(selectedDate, 'MMMM dd, yyyy')}
            </h3>
            <div className="space-y-4">
              {eventsForSelectedDate.map(event => (
                <Card 
                  key={event.id} 
                  className="shadow-md hover:shadow-lg transition-shadow cursor-pointer border-border"
                  onClick={() => router.push(`/events/${event.detailsPageSlug}`)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-headline text-lg text-accent">{event.title}</h4>
                    <p className="font-body text-sm text-muted-foreground">
                      Time: {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
                    </p>
                    {event.description && <p className="font-body text-sm mt-1">{event.description}</p>}
                    <p className="font-body text-xs text-muted-foreground mt-1 capitalize">Type: {event.type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
         {selectedDate && eventsForSelectedDate.length === 0 && dayHasEvent(selectedDate) && (
           <div className="mt-8 max-w-xl mx-auto text-center">
             <p className="font-body text-muted-foreground">Details for events on this day are being updated. Check back soon!</p>
           </div>
        )}
      </div>
    </section>
  );
}
