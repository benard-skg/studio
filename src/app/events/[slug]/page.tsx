
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

// SECURITY WARNING: The access key is hardcoded below for prototype demonstration ONLY.
// In a real application, this key MUST be stored in environment variables (e.g., .env.local)
// and accessed via process.env.NEXT_PUBLIC_JSONBIN_ACCESS_KEY.
const JSONBIN_EVENTS_BIN_ID = '6847dd9e8a456b7966aba67c';
const JSONBIN_ACCESS_KEY = '$2a$10$3Fh5hpLyq/Ou/V/O78u8xurtpTG6XomBJ7CqijLm3YgGX4LC3SFZy'; // <-- CORRECTED KEY

async function fetchEventsForStaticParams(): Promise<EventType[]> {
  console.log(`[EventSlugPage] Fetching events for static params from Bin ID: ${JSONBIN_EVENTS_BIN_ID} using Access Key (first 5 chars): ${JSONBIN_ACCESS_KEY.substring(0,5)}...`);
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_EVENTS_BIN_ID}/latest`, {
      method: 'GET',
      headers: { 'X-Access-Key': JSONBIN_ACCESS_KEY },
      next: { revalidate: 3600 } 
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EventSlugPage] Error fetching events for static params. Status: ${response.status}, Key Used (prefix): ${JSONBIN_ACCESS_KEY.substring(0,5)}..., Response: ${errorText}`);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data.record) ? data.record : [];
  } catch (error) {
    console.error("[EventSlugPage] Error fetching events for static params:", error);
    return [];
  }
}


async function getEventBySlug(slug: string): Promise<EventType | null> {
  console.log(`[EventSlugPage] getEventBySlug: Fetching event with slug '${slug}' from Bin ID: ${JSONBIN_EVENTS_BIN_ID} using Access Key (first 5 chars): ${JSONBIN_ACCESS_KEY.substring(0,5)}...`);
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_EVENTS_BIN_ID}/latest`, {
      method: 'GET',
      headers: {
        'X-Access-Key': JSONBIN_ACCESS_KEY,
      },
      next: { revalidate: 600 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EventSlugPage] Failed to fetch events for slug ${slug}. Status: ${response.status}, Key Used (prefix): ${JSONBIN_ACCESS_KEY.substring(0,5)}..., Response: ${errorText}`);
      return null;
    }
    const data = await response.json();
    const events: EventType[] = Array.isArray(data.record) ? data.record : [];
    const event = events.find(e => e.detailsPageSlug === slug);
    return event || null;
  } catch (error) {
    console.error(`[EventSlugPage] Error fetching event by slug ${slug}:`, error);
    return null;
  }
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
      type: 'event',
    },
  };
}

export async function generateStaticParams() {
  const events = await fetchEventsForStaticParams();
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
