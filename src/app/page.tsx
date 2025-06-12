
import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import ClassShowcaseSection from '@/components/sections/class-showcase-section';
import BlogSection from '@/components/sections/blog-section';
import Footer from '@/components/layout/footer';
import EventCalendarSection from '@/components/sections/event-calendar-section';
import LichessTVEmbedSection from '@/components/sections/lichess-tv-embed-section';
import type { EventType } from '@/lib/types';

// --- JSONBin.io Configuration for Homepage Events ---
// IMPORTANT: Replace with your actual Bin ID and Access Key if these are placeholders.
const JSONBIN_EVENTS_BIN_ID = "6849cd828a456b7966ac6d55";
const JSONBIN_X_ACCESS_KEY = "$2a$10$3Fh5hpLyq/Ou/V/O78u8xurtpTG6XomBJ7CqijLm3YgGX4LC3SFZy"; 
// --- End JSONBin.io Configuration ---

async function getEvents(): Promise<EventType[]> {
  if (!JSONBIN_EVENTS_BIN_ID || JSONBIN_EVENTS_BIN_ID === "YOUR_JSONBIN_EVENTS_BIN_ID_HERE" || JSONBIN_EVENTS_BIN_ID.trim() === "") {
    console.warn("[HomePage] getEvents: JSONBin.io Events Bin ID is not configured or is using a placeholder. Event fetching disabled.");
    return [];
  }
  if (!JSONBIN_X_ACCESS_KEY || JSONBIN_X_ACCESS_KEY === "YOUR_JSONBIN_X_ACCESS_KEY_HERE" || JSONBIN_X_ACCESS_KEY.trim() === "") {
    console.warn("[HomePage] getEvents: JSONBin.io X-Access-Key is not configured or is using a placeholder. Event fetching disabled.");
    return [];
  }

  const eventsBinUrl = `https://api.jsonbin.io/v3/b/${JSONBIN_EVENTS_BIN_ID}/latest`;
  console.log(`[HomePage] getEvents: Fetching events from ${eventsBinUrl} using Access Key (snippet): ${JSONBIN_X_ACCESS_KEY.substring(0, 5)}...`);

  try {
    const response = await fetch(eventsBinUrl, {
      method: 'GET',
      headers: {
        'X-Access-Key': JSONBIN_X_ACCESS_KEY,
      },
      // Add cache revalidation strategy if needed, e.g. Next.js revalidate tag
      // next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[HomePage] Failed to fetch events. Status: ${response.status}, Key Used (hardcoded), Body: ${errorBody}`);
      return [];
    }

    const data = await response.json();
    
    // JSONBin.io often wraps the actual array in a 'record' property when fetching '/latest'
    if (data && data.record && Array.isArray(data.record)) {
      console.log(`[HomePage] getEvents: Successfully fetched ${data.record.length} events.`);
      return data.record as EventType[];
    } else if (Array.isArray(data)) { // If the bin stores the array directly
       console.log(`[HomePage] getEvents: Successfully fetched ${data.length} events (direct array).`);
       return data as EventType[];
    } else {
      console.warn("[HomePage] getEvents: Fetched data is not in the expected format (expected an array or an object with a 'record' array). Data:", data);
      return [];
    }

  } catch (error) {
    console.error("[HomePage] getEvents: Error fetching events:", error);
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
