
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

// --- JSONBin.io Configuration for Homepage Events ---
const JSONBIN_EVENTS_BIN_ID = "6849cd828a456b7966ac6d55";
const JSONBIN_X_ACCESS_KEY = "$2a$10$3Fh5hpLyq/Ou/V/O78u8xurtpTG6XomBJ7CqijLm3YgGX4LC3SFZy";
// --- End JSONBin.io Configuration ---

async function getEvents(): Promise<EventType[]> {
  const eventsBinUrl = `https://api.jsonbin.io/v3/b/${JSONBIN_EVENTS_BIN_ID}/latest`;
  console.log(`[HomePage] getEvents: Attempting to fetch events from ${eventsBinUrl}. Key starts with: ${JSONBIN_X_ACCESS_KEY.substring(0,5)}`);

  try {
    const response = await fetch(eventsBinUrl, {
      method: 'GET',
      headers: {
        'X-Access-Key': JSONBIN_X_ACCESS_KEY,
      },
      // next: { revalidate: 300 } // Revalidate every 5 minutes - Temporarily disable for easier debugging
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[HomePage] Failed to fetch events. Status: ${response.status}. Body: ${errorBody}`);
      return []; 
    }

    const data = await response.json();
    
    if (data && data.record && Array.isArray(data.record)) {
      console.log(`[HomePage] getEvents: Successfully fetched ${data.record.length} events.`);
      return data.record as EventType[];
    } else if (Array.isArray(data)) { 
       console.log(`[HomePage] getEvents: Successfully fetched ${data.length} events (direct array).`);
       return data as EventType[];
    } else {
      console.warn("[HomePage] getEvents: Fetched data is not in the expected array format (inside 'record' or direct). Data:", JSON.stringify(data, null, 2));
      return [];
    }

  } catch (error) {
    console.error("[HomePage] getEvents: Error during fetch operation:", error);
    return []; 
  }
}


export default function Home() {
  const [fetchedEvents, setFetchedEvents] = useState<EventType[]>([]);
  const [uiLogPage, setUiLogPage] = useState<string>("Fetching events...");

  useEffect(() => {
    async function loadEvents() {
      setUiLogPage("Attempting to fetch events...");
      const eventsData = await getEvents();
      setFetchedEvents(eventsData);
      setUiLogPage(`[HomePage] Events fetched: ${eventsData.length} items. Data (first 2 shown, see full below):\n${JSON.stringify(eventsData.slice(0,2), null, 2)}`);
      console.log('[HomePage] Events fetched and passed to EventCalendarSection:', JSON.stringify(eventsData, null, 2));
    }
    loadEvents();
  }, []);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4 mx-4" role="alert">
            <strong className="font-bold">UI Debug Info (Home Page):</strong>
            <pre className="block sm:inline text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">{uiLogPage}</pre>
            <details className="text-xs mt-2">
                <summary>Full Fetched Events Data ({fetchedEvents.length} items)</summary>
                <pre className="whitespace-pre-wrap max-h-60 overflow-y-auto">{JSON.stringify(fetchedEvents, null, 2)}</pre>
            </details>
        </div>
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

