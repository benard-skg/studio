
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import ContactSection from '@/components/sections/contact-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - kgchess',
  description: 'Get in touch with kgchess for questions or to book your chess coaching sessions.',
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
