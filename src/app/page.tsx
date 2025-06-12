
"use client"; // This page needs to be a client component for useState and useEffect

import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/sections/hero-section';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import ClassShowcaseSection from '@/components/sections/class-showcase-section';
import BlogSection from '@/components/sections/blog-section';
import Footer from '@/components/layout/footer';
import EventCalendarSection from '@/components/sections/event-calendar-section';
import LichessTVEmbedSection from '@/components/sections/lichess-tv-embed-section';
import type { EventType } from '@/lib/types';
import { useState, useEffect } from 'react';

// JSONBin.io fetching for events is removed.
async function getEvents(): Promise<EventType[]> {
  console.log("[HomePage] getEvents: Event fetching is currently disabled. Returning empty array.");
  return Promise.resolve([]); 
}


export default function Home() {
  const [fetchedEvents, setFetchedEvents] = useState<EventType[]>([]);

  useEffect(() => {
    async function loadEvents() {
      const eventsData = await getEvents();
      setFetchedEvents(eventsData);
      console.log('[HomePage] Events "fetched" (currently disabled, returning empty):', eventsData);
    }
    loadEvents();
  }, []);


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
          <BlogSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
