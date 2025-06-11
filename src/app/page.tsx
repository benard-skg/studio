
import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import ClassShowcaseSection from '@/components/sections/class-showcase-section';
import BlogSection from '@/components/sections/blog-section';
import Footer from '@/components/layout/footer';
import EventCalendarSection from '@/components/sections/event-calendar-section';
import LichessTVEmbedSection from '@/components/sections/lichess-tv-embed-section';
import type { EventType } from '@/lib/types';

const ENV_EVENTS_BIN_ID = process.env.NEXT_PUBLIC_JSONBIN_EVENTS_BIN_ID;
const ENV_ACCESS_KEY = process.env.NEXT_PUBLIC_JSONBIN_ACCESS_KEY;

// Log raw environment variable values at module load time
console.log(`[HomePage] INIT - Raw ENV_EVENTS_BIN_ID: "${ENV_EVENTS_BIN_ID}" (type: ${typeof ENV_EVENTS_BIN_ID})`);
console.log(`[HomePage] INIT - Raw ENV_ACCESS_KEY: "${ENV_ACCESS_KEY ? ENV_ACCESS_KEY.substring(0,5) + '...' : ENV_ACCESS_KEY}" (type: ${typeof ENV_ACCESS_KEY})`);


async function getEvents(): Promise<EventType[]> {
  const currentBinId = ENV_EVENTS_BIN_ID;
  const currentAccessKey = ENV_ACCESS_KEY;

  if (currentBinId === undefined || currentAccessKey === undefined) {
    console.error("[HomePage] CRITICAL: JSONBin.io Events Bin ID or Access Key is UNDEFINED in environment. Check .env file, ensure variable names (NEXT_PUBLIC_JSONBIN_EVENTS_BIN_ID, NEXT_PUBLIC_JSONBIN_ACCESS_KEY) are correct, and that the server was restarted.");
    return [];
  }
  if (currentBinId === 'YOUR_JSONBIN_EVENTS_BIN_ID' || currentAccessKey === 'YOUR_JSONBIN_ACCESS_KEY') {
    console.error("[HomePage] CRITICAL: JSONBin.io Events Bin ID or Access Key is using PLACEHOLDER values (e.g., 'YOUR_JSONBIN_EVENTS_BIN_ID'). Please replace them in your .env file with your actual credentials and restart the server.");
    return [];
  }
   if (!currentBinId || !currentAccessKey) { // Catches empty strings if they somehow pass the above
    console.error("[HomePage] CRITICAL: JSONBin.io Events Bin ID or Access Key is an EMPTY STRING. Check .env file values and ensure server was restarted.");
    return [];
  }

  console.log(`[HomePage] DEBUG: Value of BIN_ID variable used for fetch: "${currentBinId}"`);
  console.log(`[HomePage] DEBUG: Value of ACCESS_KEY variable used for fetch (first 5 chars): "${currentAccessKey ? currentAccessKey.substring(0,5) + '...' : 'UNDEFINED'}"`);


  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${currentBinId}/latest`, {
      method: 'GET',
      headers: {
        'X-Access-Key': currentAccessKey,
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
