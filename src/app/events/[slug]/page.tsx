
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import type { EventType } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar, Clock, Info, Tag } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';

interface EventPageProps {
  params: {
    slug: string;
  };
}

const BIN_ID = "YOUR_JSONBIN_EVENTS_BIN_ID"; // Placeholder for events bin
const ACCESS_KEY = "$2a$10$ruiuDJ8CZrmUGcZ/0T4oxupL/lYNqs2tnITLQ2KNt0NkhEDq.6CQG"; // Replaced placeholder

const isValidEvent = (event: any): event is EventType => {
  return event &&
    typeof event.id === 'string' && event.id.trim() !== '' &&
    typeof event.title === 'string' && event.title.trim() !== '' &&
    typeof event.date === 'string' && event.date.trim() !== '' &&
    typeof event.startTime === 'string' && event.startTime.trim() !== '' &&
    typeof event.type === 'string' && event.type.trim() !== '' &&
    typeof event.detailsPageSlug === 'string' && event.detailsPageSlug.trim() !== '';
};

async function fetchAllValidEvents(): Promise<EventType[]> {
  if (!BIN_ID || !ACCESS_KEY || BIN_ID === 'YOUR_JSONBIN_EVENTS_BIN_ID' || ACCESS_KEY === '$2a$10$ruiuDJ8CZrmUGcZ/0T4oxupL/lYNqs2tnITLQ2KNt0NkhEDq.6CQG') {
    console.error("[EventUtils] JSONBin.io Events Bin ID or Access Key is not configured in .env or is using placeholder values.");
    return [];
  }
  
  console.log(`[EventUtils] Fetching all events from Bin ID: ${BIN_ID}.`);
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      method: 'GET',
      headers: { 'X-Access-Key': ACCESS_KEY },
      next: { revalidate: 60 } 
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EventUtils] Error fetching all events. Status: ${response.status}, Response: ${errorText}`);
      return [];
    }
    const data = await response.json();
    const rawEvents = Array.isArray(data.record) ? data.record : [];
    
    const validEvents = rawEvents
      .filter(isValidEvent) 
      .sort((a: EventType, b: EventType) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime));

     if (rawEvents.length > 0 && validEvents.length !== rawEvents.length) {
      console.warn(`[EventUtils] Filtered out ${rawEvents.length - validEvents.length} malformed event entries during full fetch.`);
    }
    return validEvents;
  } catch (error) {
    console.error("[EventUtils] Error fetching all events:", error);
    return [];
  }
}


async function getEventBySlug(slug: string): Promise<EventType | null> {
  console.log(`[EventSlugPage] getEventBySlug: Processing slug '${slug}'`);
  const events = await fetchAllValidEvents(); 
  const event = events.find(e => e.detailsPageSlug === slug);
  if (event) {
    console.log(`[EventSlugPage] Found event for slug '${slug}': ${event.title}`);
  } else {
    console.log(`[EventSlugPage] No event found for slug '${slug}' among valid events.`);
  }
  return event || null;
}

export async function generateMetadata(
  { params }: EventPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    return {
      title: 'Event Not Found - LCA',
      description: 'The event you are looking for could not be found.',
    };
  }
  
  const parsedDate = isValid(parseISO(event.date)) ? format(parseISO(event.date), 'MMMM dd, yyyy') : 'Date TBD';

  return {
    title: `${event.title} - LCA Event`,
    description: event.description || `Details for the event: ${event.title} on ${parsedDate}.`,
    openGraph: {
      title: `${event.title} - LCA Event`,
      description: event.description || `Join us for ${event.title}!`,
      type: 'article', 
    },
  };
}

export async function generateStaticParams() {
  const events = await fetchAllValidEvents(); 
  console.log(`[EventSlugPage] generateStaticParams: Found ${events.length} valid events for static generation.`);
  return events.map((event) => ({
    slug: event.detailsPageSlug,
  }));
}


export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  const parsedDate = isValid(parseISO(event.date)) ? parseISO(event.date) : null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight mb-3">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground font-body text-sm">
            {parsedDate && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>{format(parsedDate, 'EEEE, MMMM dd, yyyy')}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              <span>{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</span>
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1.5" />
              <span className="capitalize">{event.type}</span>
            </div>
          </div>
        </header>

        {event.description && (
          <section className="mb-8 prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto">
            <h2 className="font-headline text-2xl font-semibold mb-3 flex items-center">
              <Info className="h-6 w-6 mr-2 text-accent" />
              About this Event
            </h2>
            <p className="font-body leading-relaxed">{event.description}</p>
          </section>
        )}
        
        <div className="font-body text-muted-foreground text-sm mt-12 text-center">
            Event ID: {event.id}
        </div>

      </main>
      <Footer />
    </div>
  );
}
