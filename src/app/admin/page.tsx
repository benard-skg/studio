
"use client";

import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { AlertCircle } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6 text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
            Admin - Contact Submissions
          </h1>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Contact submission management area.
          </p>
        </header>

        <div className="flex flex-col items-center justify-center py-10 bg-card border border-border text-foreground p-6 rounded-lg shadow-md">
          <AlertCircle className="h-10 w-10 mb-3 text-muted-foreground" />
          <p className="font-headline text-2xl mb-2">Submissions Not Configured</p>
          <p className="font-body text-center text-muted-foreground">
            The system to view and manage contact form submissions is currently not configured.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
