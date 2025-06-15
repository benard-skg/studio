
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import type { EventType as AppEventType } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar, Clock, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, limit, orderBy as firestoreOrderBy } from 'firebase/firestore'; // Renamed orderBy to avoid conflict

interface EventType extends AppEventType {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface EventPageProps {
  params: {
    slug: string;
  };
}

async function getEventBySlug(slug: string): Promise<EventType | null> {
  try {
    const eventsCol = collection(db, "events");
    const q = query(eventsCol, where("detailsPageSlug", "==", slug), limit(1));
    const eventSnapshot = await getDocs(q);

    if (eventSnapshot.empty) {
      return null;
    }

    const doc = eventSnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "Event Title",
      date: data.date instanceof Timestamp ? data.date.toDate().toISOString().split('T')[0] : data.date,
      startTime: data.startTime || "Time TBD",
      endTime: data.endTime,
      type: data.type || "special",
      description: data.description,
      detailsPageSlug: data.detailsPageSlug || slug,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as EventType;
  } catch (error) {
    console.error(`[EventSlugPage] Error fetching event with slug ${slug}:`, error);
    return null;
  }
}

export async function generateMetadata(
  { params }: EventPageProps,
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
  try {
    const eventsCol = collection(db, "events");
    const eventsSnapshot = await getDocs(query(eventsCol, firestoreOrderBy("date", "desc")));
    const slugs = eventsSnapshot.docs.map(doc => ({
      slug: doc.data().detailsPageSlug as string,
    })).filter(item => !!item.slug);
    return slugs;
  } catch (error) {
    console.error("[EventSlugPage] generateStaticParams: Error fetching event slugs:", error);
    return [];
  }
}


export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  const parsedDate = event.date && isValid(parseISO(event.date)) ? parseISO(event.date) : null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter leading-tight mb-4">
            {event.title}
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
                  {event.startTime}
                  {event.endTime ? ` - ${event.endTime}` : ''}
                </span>
              </div>
            )}
            {event.type && (
              <div className="flex items-center">
                <Tag className="h-5 w-5 mr-2 text-accent" />
                <span className="font-body capitalize bg-secondary px-2 py-0.5 text-secondary-foreground text-xs">
                  {event.type}
                </span>
              </div>
            )}
          </div>
        </header>

        {event.description && (
          <section className="mb-8 prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg mx-auto">
            <h2 className="font-headline text-xl font-bold tracking-tighter mb-3">About this Event</h2>
            {event.description.split('\n').map((paragraph, index) => (
              <p key={index} className="font-body">{paragraph}</p>
            ))}
          </section>
        )}

        <p className="font-body text-xs text-muted-foreground text-center mt-12">Event ID: {event.id}</p>
        {event.createdAt && <p className="font-body text-xs text-muted-foreground text-center mt-1">Created: {format(event.createdAt.toDate(), 'MMM dd, yyyy HH:mm')}</p>}
        {event.updatedAt && <p className="font-body text-xs text-muted-foreground text-center mt-1">Last Updated: {format(event.updatedAt.toDate(), 'MMM dd, yyyy HH:mm')}</p>}

      </main>
      <Footer />
    </div>
  );
}
