
"use client";

import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Intentionally minimal: no Navbar or Footer from other components to avoid hook issues during fallback */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-transparent" />
      <main className="flex-grow flex items-center justify-center pt-20">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </main>
      <footer className="py-8 bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="font-body text-sm text-muted-foreground">Loading...</p>
        </div>
      </footer>
    </div>
  );
}
