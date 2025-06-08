
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import type { Metadata } from 'next';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - kgchess',
  description: 'Get in touch with kgchess.',
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 flex flex-col items-center justify-center text-center px-4">
        <div className="py-16 md:py-24">
          <Mail className="mx-auto h-16 w-16 text-accent mb-6" />
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight mb-4">
            Contact Us
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto">
            This contact page is currently under construction. Please check back later for ways to get in touch.
          </p>
          {/* You can add direct contact information here if you wish, e.g., email address or phone number */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
