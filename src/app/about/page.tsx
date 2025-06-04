
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import CoachProfileSection from '@/components/sections/coach-profile-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Coach K.G. - kgchess',
  description: 'Learn more about Certified Chess Coach & Strategist K.G. and their approach to chess coaching.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20">
        <CoachProfileSection />
      </main>
      <Footer />
    </div>
  );
}
