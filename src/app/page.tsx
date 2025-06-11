
import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import ClassShowcaseSection from '@/components/sections/class-showcase-section';
import BlogSection from '@/components/sections/blog-section';
import Footer from '@/components/layout/footer';
import EventCalendarSection from '@/components/sections/event-calendar-section';
import LichessTVEmbedSection from '@/components/sections/lichess-tv-embed-section';
import type { EventType } from '@/lib/types';

// Using constants for environment variables
const ENV_EVENTS_BIN_ID = "YOUR_JSONBIN_EVENTS_BIN_ID";
const ENV_ACCESS_KEY = "$2a$10$ruiuDJ8CZrmUGcZ/0T4oxupL/lYNqs2tnITLQ2KNt0NkhEDq.6CQG"; // Replaced placeholder

// Log raw environment variable values at module load time
console.log(`[HomePage] INIT - Raw ENV_EVENTS_BIN_ID: "${ENV_EVENTS_BIN_ID}" (type: ${typeof ENV_EVENTS_BIN_ID})`);
console.log(`[HomePage] INIT - Raw ENV_ACCESS_KEY: "${ENV_ACCESS_KEY ? (typeof ENV_ACCESS_KEY === 'string' ? ENV_ACCESS_KEY.substring(0,5) : 'NOT_A_STRING') + '...' : ENV_ACCESS_KEY}" (type: ${typeof ENV_ACCESS_KEY})`);


async function getEvents(): Promise<EventType[]> {
  const currentBinId = ENV_EVENTS_BIN_ID;
  const currentAccessKey = ENV_ACCESS_KEY;

  // Detailed checks
  if (currentAccessKey === undefined) {
    console.error("[HomePage] CRITICAL: JSONBin.io Access Key is UNDEFINED. Check if it's set in this file.");
    return [];
  }
  if (currentBinId === undefined) {
    console.error("[HomePage] CRITICAL: JSONBin.io Events Bin ID is UNDEFINED. Check if it's set in this file.");
    return [];
  }
  if (currentAccessKey === '$2a$10$ruiuDJ8CZrmUGcZ/0T4oxupL/lYNqs2tnITLQ2KNt0NkhEDq.6CQG') { // Check against actual key if used as placeholder
    console.warn("[HomePage] NOTICE: JSONBin.io Access Key is using a placeholder value. Ensure this is intended for your setup.");
  }
  if (currentBinId === 'YOUR_JSONBIN_EVENTS_BIN_ID') {
    console.error("[HomePage] CRITICAL: JSONBin.io Events Bin ID is using a PLACEHOLDER value ('YOUR_JSONBIN_EVENTS_BIN_ID'). Please replace it with your actual Bin ID.");
    return [];
  }
   if (!currentBinId || currentBinId.trim() === "") {
    console.error("[HomePage] CRITICAL: JSONBin.io Events Bin ID is an EMPTY STRING or not set. Check its value in this file.");
    return [];
  }
  if (!currentAccessKey || currentAccessKey.trim() === "") {
    console.error("[HomePage] CRITICAL: JSONBin.io Access Key is an EMPTY STRING or not set. Check its value in this file.");
    return [];
  }


  console.log(`[HomePage] DEBUG getEvents: Using BIN_ID: "${currentBinId}"`);
  console.log(`[HomePage] DEBUG getEvents: Using ACCESS_KEY (first 5 chars): "${currentAccessKey ? (typeof currentAccessKey === 'string' ? currentAccessKey.substring(0,5) : 'NOT_A_STRING') + '...' : 'UNDEFINED'}"`);


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
      console.error(`[HomePage] Failed to fetch events. Status: ${response.status}, Key Used (from env), Body: ${errorBody}`);
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
