
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meet Our Coaches - LCA',
  description: 'Learn more about the Certified Chess Coaches & Strategists at LCA and their approach to chess coaching.',
};

export default function CoachesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20"> {/* pt-20 to ensure content is below fixed navbar */}
        {/* CoachProfileSection already has its own title and padding, so we can use it directly */}
        <CoachProfileSection /> 
      </main>
      <Footer />
    </div>
  );
}
