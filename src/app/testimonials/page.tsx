
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import TestimonialsSection from '@/components/sections/testimonials-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Testimonials - kgchess',
  description: 'Read what students are saying about their experience and improvement with kgchess coaching.',
};

export default function TestimonialsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20">
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
