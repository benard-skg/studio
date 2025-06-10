
import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import ClassShowcaseSection from '@/components/sections/class-showcase-section';
import BlogSection from '@/components/sections/blog-section';
import Footer from '@/components/layout/footer';
import EventCalendarSection from '@/components/sections/event-calendar-section';
import type { EventType } from '@/lib/types';

async function getEvents(): Promise<EventType[]> {
  const binId = process.env.NEXT_PUBLIC_JSONBIN_EVENTS_BIN_ID; 
  const accessKey = process.env.NEXT_PUBLIC_JSONBIN_ACCESS_KEY;

  if (!binId || !accessKey) {
    console.error("[HomePage] JSONBin.io Bin ID or Access Key is not configured in environment variables.");
    return [];
  }

  console.log(`[HomePage] Fetching events from Bin ID: ${binId} using Access Key (first 5 chars): ${accessKey.substring(0,5)}...`);

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      method: 'GET',
      headers: {
        'X-Access-Key': accessKey,
      },
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[HomePage] Failed to fetch events. Status: ${response.status}, Key Used (prefix): ${accessKey.substring(0,5)}..., Body: ${errorBody}`);
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
      <main className="flex-grow pt-20"> {/* Add pt-20 to account for fixed navbar height */}
        <HeroSection />
        <CoachProfileSection displayMode="singleRandom" />
        <EventCalendarSection events={events} />
        <ClassShowcaseSection />
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
}
