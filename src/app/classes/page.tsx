
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import ClassShowcaseSection from '@/components/sections/class-showcase-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coaching Classes - kgchess',
  description: 'Explore the chess coaching classes offered by kgchess, tailored for different skill levels.',
};

export default function ClassesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20">
        <ClassShowcaseSection />
      </main>
      <Footer />
    </div>
  );
}
