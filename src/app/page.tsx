
import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import ClassShowcaseSection from '@/components/sections/class-showcase-section';
import BlogSection from '@/components/sections/blog-section';
import Footer from '@/components/layout/footer';
import EventCalendarSection from '@/components/sections/event-calendar-section';
import type { EventType } from '@/lib/types';

async function getEvents(): Promise<EventType[]> {
  const binId = '6847dd9e8a456b7966aba67c';
  // IMPORTANT: For production, move X-Access-Key to an environment variable!
  const accessKey = '$2a$10$9F4n3c6g8L1b0K2e5R7T9O.XYZABCDEFGabcdefgHIJKLMNOPQ'; // Replace with your actual key from the prompt if different, but this is a placeholder format. The user provided '6847de318960c979a5a76655' which is also a placeholder.
  
  // Using the user-provided placeholder key directly for this prototype.
  // In a real app, this should be process.env.JSONBIN_ACCESS_KEY
  const actualUserAccessKey = '6847de318960c979a5a76655';


  // SECURITY WARNING: The access key is hardcoded here for prototype demonstration ONLY.
  // In a real application, this key MUST be stored in environment variables (e.g., .env.local)
  // and accessed via process.env.JSONBIN_ACCESS_KEY.
  // Never commit sensitive keys directly into your codebase.

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      method: 'GET',
      headers: {
        'X-Access-Key': actualUserAccessKey,
      },
      // Add cache revalidation strategy for Next.js 13+ App Router
      next: { revalidate: 3600 } // Revalidate every hour, or choose what's appropriate
    });

    if (!response.ok) {
      // Log more detailed error information
      const errorBody = await response.text();
      console.error(`Failed to fetch events. Status: ${response.status}, Body: ${errorBody}`);
      // Fallback to empty array on error instead of throwing, so page can still render
      return [];
    }
    const data = await response.json();
    // JSONBin stores the actual array in data.record
    return Array.isArray(data.record) ? data.record : [];
  } catch (error) {
    console.error('Error fetching events from JSONBin.io:', error);
    return []; // Fallback to empty array on error
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
