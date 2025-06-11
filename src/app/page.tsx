
import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import ClassShowcaseSection from '@/components/sections/class-showcase-section';
import BlogSection from '@/components/sections/blog-section';
import Footer from '@/components/layout/footer';
import EventCalendarSection from '@/components/sections/event-calendar-section';
import LichessTVEmbedSection from '@/components/sections/lichess-tv-embed-section';
import type { EventType } from '@/lib/types';

const BIN_ID = process.env.NEXT_PUBLIC_JSONBIN_EVENTS_BIN_ID;
const ACCESS_KEY = process.env.NEXT_PUBLIC_JSONBIN_ACCESS_KEY;

async function getEvents(): Promise<EventType[]> {
  if (!BIN_ID || !ACCESS_KEY || BIN_ID === 'YOUR_JSONBIN_EVENTS_BIN_ID' || ACCESS_KEY === 'YOUR_JSONBIN_ACCESS_KEY') {
    console.error("[HomePage] JSONBin.io Events Bin ID or Access Key is not configured in .env or is using placeholder values.");
    return [];
  }

  console.log(`[HomePage] Fetching events from Bin ID: ${BIN_ID} using Access Key (from .env).`);

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      method: 'GET',
      headers: {
        'X-Access-Key': ACCESS_KEY,
      },
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[HomePage] Failed to fetch events. Status: ${response.status}, Key Used (from .env), Body: ${errorBody}`);
      return [];
    }
    const data = await response.json();
    const rawEvents = Array.isArray(data.record) ? data.record : [];
    
    const validEvents = rawEvents.filter(event => 
      event && 
      typeof event.id === 'string' && event.id.trim() !== '' &&
      typeof event.title === 'string' && event.title.trim() !== '' &&
      typeof event.date === 'string' && event.date.trim() !== '' &&
      typeof event.startTime === 'string' && event.startTime.trim() !== '' &&
      typeof event.type === 'string' && event.type.trim() !== '' &&
      typeof event.detailsPageSlug === 'string' && event.detailsPageSlug.trim() !== ''
    ).sort((a: EventType, b: EventType) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime));
    
    if (rawEvents.length > 0 && validEvents.length !== rawEvents.length) {
      console.warn(`[HomePage] Filtered out ${rawEvents.length - validEvents.length} malformed event entries.`);
    }
    return validEvents;

  } catch (error) {
    console.error('[HomePage] Error fetching events from JSONBin.io:', error);
    return []; 
  }
}


export default async function Home() {
  const events = await getEvents();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20">
        <HeroSection />
        <CoachProfileSection displayMode="singleRandom" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 items-start">
          <EventCalendarSection events={events} />
          <LichessTVEmbedSection />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 items-start">
          <ClassShowcaseSection />
          <BlogSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
