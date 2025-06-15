
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import type { Metadata } from 'next';
import { Mail, Phone, MessageSquareText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us - LCA',
  description: 'Get in touch with LCA for coaching, inquiries, or to book a class.',
};

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.33 3.43 16.79L2 22L7.32 20.64C8.75 21.42 10.36 21.88 12.04 21.88C17.5 21.88 21.95 17.43 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM12.04 20.13C10.56 20.13 9.12 19.72 7.89 19L7.5 18.78L4.44 19.56L5.25 16.58L4.99 16.17C4.08 14.84 3.58 13.31 3.58 11.91C3.58 7.29 7.39 3.48 12.04 3.48C16.69 3.48 20.5 7.29 20.5 11.91C20.5 16.53 16.69 20.13 12.04 20.13ZM17.07 14.24C16.83 14.12 15.82 13.62 15.6 13.53C15.39 13.45 15.24 13.4 15.09 13.64C14.95 13.88 14.5 14.42 14.37 14.57C14.24 14.72 14.11 14.74 13.88 14.62C13.64 14.5 12.93 14.24 12.08 13.48C11.41 12.89 10.93 12.18 10.79 11.94C10.66 11.7 10.75 11.58 10.87 11.47C10.98 11.36 11.12 11.18 11.25 11.03C11.38 10.88 11.43 10.77 11.53 10.59C11.63 10.41 11.58 10.26 11.51 10.14C11.43 10.02 10.97 8.83 10.77 8.35C10.58 7.87 10.39 7.94 10.25 7.93C10.12 7.92 9.97 7.92 9.82 7.92C9.67 7.92 9.43 7.99 9.21 8.23C9 8.47 8.45 8.96 8.45 10.05C8.45 11.14 9.24 12.16 9.36 12.31C9.49 12.46 10.96 14.82 13.27 15.78C13.88 16.04 14.32 16.19 14.66 16.29C15.23 16.46 15.68 16.42 16.02 16.18C16.4 15.9 16.95 15.26 17.14 14.97C17.34 14.68 17.34 14.42 17.27 14.32C17.2 14.23 17.07 14.24 17.07 14.24Z" />
  </svg>
);

const whatsappNumberPrimary = "+27834544862";
const cellNumberPrimary = "+27834544862";
const cellNumberCoaches = "+27728281063";
const emailAddress = "bensekgwari@gmail.com";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 flex flex-col items-center justify-center text-center px-4">
        <div className="py-12 md:py-16 max-w-2xl w-full">
          <MessageSquareText className="mx-auto h-16 w-16 text-accent mb-6" />
          <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-4">
            Get In Touch
          </h1>
          <p className="font-body text-lg text-muted-foreground mb-8">
            We're here to help you elevate your chess game. Reach out to us through any of the channels below.
          </p>

          <div className="mb-8">
            <h2 className="font-headline text-2xl font-black tracking-tighter mb-3 text-accent">Chat on WhatsApp</h2>
            <a
              href={`https://wa.me/${whatsappNumberPrimary.replace(/\D/g, '')}?text=Hi%20LCA,%20I'd%20like%20to%20inquire%20about...`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
            >
              <WhatsAppIcon className="h-6 w-6 mr-2" />
              Message Our Coaches
            </a>
          </div>

          <Separator className="my-8 bg-border/70" />

          <div className="mb-8 space-y-4">
            <h2 className="font-headline text-2xl font-black tracking-tighter mb-3 text-accent">Direct Contact</h2>
            <div className="flex flex-col sm:flex-row sm:justify-center items-center space-y-3 sm:space-y-0 sm:space-x-6">
              <a href={`tel:${cellNumberPrimary}`} className="font-body text-lg hover:text-accent transition-colors flex items-center">
                <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                Primary Line: {cellNumberPrimary}
              </a>
              <a href={`tel:${cellNumberCoaches}`} className="font-body text-lg hover:text-accent transition-colors flex items-center">
                <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                Instructors: {cellNumberCoaches}
              </a>
            </div>
             <div className="mt-4">
                <a href={`mailto:${emailAddress}`} className="font-body text-lg hover:text-accent transition-colors flex items-center justify-center">
                    <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                    Email: {emailAddress}
                </a>
            </div>
          </div>

          <Separator className="my-8 bg-border/70" />

          <div>
            <h2 className="font-headline text-2xl font-black tracking-tighter mb-3 text-accent">Join a Class</h2>
            <p className="font-body text-lg text-muted-foreground">
              Or join us for a class on Tuesdays, Wednesdays, and Thursdays between 14:00 and 17:30.
            </p>
            <p className="font-body text-lg mt-2">
              Contact the Coaches <Link href={`tel:${cellNumberPrimary}`} className="text-accent hover:underline">{'\u{1F446}\u{1F3FF}'}</Link> to arrange.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
