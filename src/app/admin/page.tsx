
"use client";

import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-10 text-center">
          <ShieldCheck className="mx-auto h-16 w-16 text-accent mb-4" />
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter leading-tight">
            Admin Dashboard
          </h1>
          <p className="font-body text-lg text-muted-foreground mt-3">
            Welcome to the LCA admin area.
          </p>
        </header>

        <div className="bg-card shadow-md p-6 border border-border text-center">
          <p className="font-body text-muted-foreground">
            Select an option from the navigation to manage site content.
          </p>
          {/* Future admin links or summaries can be added here */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
