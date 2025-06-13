
import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import ClassShowcaseSection from '@/components/sections/class-showcase-section';
import BlogSection from '@/components/sections/blog-section'; 
import Footer from '@/components/layout/footer';
import EventCalendarSection from '@/components/sections/event-calendar-section';
import LichessTVEmbedSection from '@/components/sections/lichess-tv-embed-section';
import type { EventType as AppEventType } from '@/lib/types'; // Renamed to avoid conflict
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

// Extend EventType to include Firestore document ID and potentially serverTimestamp
interface EventType extends AppEventType {
  id: string; // Firestore document ID
  createdAt?: Timestamp;
  updatedAt?: Timestamp; 
}

async function getEventsForCalendar(): Promise<EventType[]> {
  try {
    const eventsCol = collection(db, "events");
    // Order by date then start time for consistent display
    const q = query(eventsCol, orderBy("date", "asc"), orderBy("startTime", "asc"));
    const eventsSnapshot = await getDocs(q);
    const eventsList = eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure date is string if needed by EventCalendarSection,
        // Firestore might store it as Timestamp or string depending on how it was saved
        date: data.date instanceof Timestamp ? data.date.toDate().toISOString().split('T')[0] : data.date, 
      } as EventType;
    });
    console.log("[PageServerComponent] getEventsForCalendar: Fetched events from Firestore:", eventsList.length);
    return eventsList;
  } catch (error) {
    console.error("[PageServerComponent] getEventsForCalendar: Error fetching events from Firestore:", error);
    return []; // Return empty array on error
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
