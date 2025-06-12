
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import type { EventType } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar, Clock, Info, Tag, AlertCircle } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';

interface EventPageProps {
  params: {
    slug: string;
  };
}

// JSONBin.io integration removed

async function getEventBySlug(slug: string): Promise<EventType | null> {
  console.warn(`[EventSlugPage] getEventBySlug: Event fetching disabled. Slug: '${slug}'`);
  return null; // Simulate no event found as JSONBin is disabled
}

export async function generateMetadata(
  { params }: EventPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // const event = await getEventBySlug(params.slug); // Data fetching disabled

  // if (!event) {
    return {
      title: 'Event Not Found - LCA',
      description: 'The event you are looking for could not be found or event details are currently unavailable.',
    };
  // }
  
  // const parsedDate = isValid(parseISO(event.date)) ? format(parseISO(event.date), 'MMMM dd, yyyy') : 'Date TBD';

  // return {
  //   title: `${event.title} - LCA Event`,
  //   description: event.description || `Details for the event: ${event.title} on ${parsedDate}.`,
  //   openGraph: {
  //     title: `${event.title} - LCA Event`,
  //     description: event.description || `Join us for ${event.title}!`,
  //     type: 'article', 
  //   },
  // };
}

export async function generateStaticParams() {
  console.warn(`[EventSlugPage] generateStaticParams: Event fetching disabled. Returning empty params.`);
  return []; // No events to fetch, so return empty array for static generation
}


export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    // Display a specific message for disabled feature
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="font-headline text-3xl mb-2">Event Details Unavailable</h1>
            <p className="font-body text-muted-foreground">
              Detailed event information is currently unavailable as this feature is disabled.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // This part of the code will not be reached if event is null (which it always will be now)
  // It's kept for structure if JSONBin is re-enabled later.
  const parsedDate = isValid(parseISO(event.date)) ? parseISO(event.date) : null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight mb-4">
            {event.title || "Event Title"}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
            {parsedDate && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-accent" />
                <span className="font-body">{format(parsedDate, 'MMMM dd, yyyy')}</span>
              </div>
            )}
            {(event.startTime || event.endTime) && (
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-accent" />
                <span className="font-body">
                  {event.startTime || "Time TBD"}
                  {event.endTime ? ` - ${event.endTime}` : ''}
                </span>
              </div>
            )}
            {event.type && (
              <div className="flex items-center">
                <Tag className="h-5 w-5 mr-2 text-accent" />
                <span className="font-body capitalize bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground text-xs">
                  {event.type}
                </span>
              </div>
            )}
          </div>
        </header>

        {event.description && (
          <section className="mb-8 prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg mx-auto">
            <h2 className="font-headline text-2xl font-bold mb-3">About this Event</h2>
            {event.description.split('\n').map((paragraph, index) => (
              <p key={index} className="font-body">{paragraph}</p>
            ))}
          </section>
        )}
        
        <p className="font-body text-xs text-muted-foreground text-center mt-12">Event ID: {event.id || "N/A"}</p>

      </main>
      <Footer />
    </div>
  );
}
