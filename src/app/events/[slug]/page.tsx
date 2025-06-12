
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

// JSONBin.io configuration and fetch logic removed

async function getEventBySlug(slug: string): Promise<EventType | null> {
  console.log(`[EventSlugPage] getEventBySlug: Event fetching disabled. Slug: '${slug}'`);
  // Simulate no event found as JSONBin is disabled
  return null;
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
  // No events to fetch from JSONBin, so return empty array for static generation
  console.log(`[EventSlugPage] generateStaticParams: Event fetching disabled. Returning empty params.`);
  return [];
}


export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    // As fetching is disabled, all event slugs will result in notFound
    // Or, display a message that event details are unavailable.
    // For now, we'll lean towards notFound as per original logic if event is null.
    // If you want to show a page saying "details unavailable", this would change.
    notFound(); 
  }

  // The following code will not be reached due to notFound() above
  // It's kept for structure if JSONBin is re-enabled later.
  const parsedDate = isValid(parseISO(event.date)) ? parseISO(event.date) : null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="font-headline text-3xl mb-2">Event Details Unavailable</h1>
          <p className="font-body text-muted-foreground">Event fetching is currently disabled.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
