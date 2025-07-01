
import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import ClassShowcaseSection from '@/components/sections/class-showcase-section';
import BlogSection from '@/components/sections/blog-section'; 
import Footer from '@/components/layout/footer';
import EventCalendarSection from '@/components/sections/event-calendar-section';
import LichessTVEmbedSection from '@/components/sections/lichess-tv-embed-section';
import type { EventType as AppEventType } from '@/lib/types'; 
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

interface EventType extends AppEventType {
  id: string; 
  createdAt?: Timestamp;
  updatedAt?: Timestamp; 
}

async function getEventsForCalendar(): Promise<EventType[]> {
  try {
    const eventsCol = collection(db, "events");
    const q = query(eventsCol, orderBy("date", "asc"), orderBy("startTime", "asc"));
    const eventsSnapshot = await getDocs(q);
    const eventsList = eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate().toISOString().split('T')[0] : data.date, 
      } as EventType;
    });
    return eventsList;
  } catch (error) {
    // Intentionally kept for debugging server-side data fetching
    console.error("[PageServerComponent] getEventsForCalendar: Error fetching events from Firestore:", error);
    return []; 
  }
}

function HomePageContent({
  fetchedEvents,
  blogSectionContent,
}: {
  fetchedEvents: EventType[];
  blogSectionContent: React.ReactNode;
}) {
  "use client"; 

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20">
        <HeroSection />
        <CoachProfileSection displayMode="singleRandom" />

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 items-start">
          <EventCalendarSection events={fetchedEvents} />
          <LichessTVEmbedSection />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 items-start">
          <ClassShowcaseSection />
          {blogSectionContent}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default async function Page() {
  const calendarEvents = await getEventsForCalendar();

  return (
    <HomePageContent
      fetchedEvents={calendarEvents}
      blogSectionContent={<BlogSection />} 
    />
  );
}
