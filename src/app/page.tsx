
// No 'use client' at the top of the file for the main Page component

import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import ClassShowcaseSection from '@/components/sections/class-showcase-section';
import BlogSection from '@/components/sections/blog-section'; // This is an async Server Component
import Footer from '@/components/layout/footer';
import EventCalendarSection from '@/components/sections/event-calendar-section';
import LichessTVEmbedSection from '@/components/sections/lichess-tv-embed-section';
import type { EventType } from '@/lib/types';
import { useState, useEffect } from 'react'; // Will be used in HomePageContent

// This function fetches data for the calendar on the server.
// JSONBin.io fetching for events is removed.
async function getEventsForCalendar(): Promise<EventType[]> {
  console.log("[PageServerComponent] getEventsForCalendar: Event fetching is currently disabled. Returning empty array.");
  return Promise.resolve([]);
}

// This is the Client Component part of the page
function HomePageContent({
  fetchedEvents,
  blogSectionContent,
}: {
  fetchedEvents: EventType[];
  blogSectionContent: React.ReactNode;
}) {
  "use client"; // This component contains client-side logic

  // Note: The original useState/useEffect for fetchedEvents in the 'Home' component
  // is no longer needed here as `fetchedEvents` are passed as a prop from the Server Component.

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
          {blogSectionContent} {/* Render the BlogSection passed as a prop */}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// This is the new default export for the page - a Server Component
export default async function Page() {
  // Fetch data required by client components on the server
  const calendarEvents = await getEventsForCalendar();

  return (
    <HomePageContent
      fetchedEvents={calendarEvents}
      blogSectionContent={<BlogSection />} // Render BlogSection here (server) and pass its output
    />
  );
}
