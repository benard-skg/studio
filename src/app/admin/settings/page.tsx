
"use client";

import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Settings, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 text-center">
          <Settings className="mx-auto h-12 w-12 text-accent mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter leading-tight">
            Admin Settings
          </h1>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Configure application settings.
          </p>
        </header>

        <Card className="max-w-lg mx-auto shadow-lg border-border">
          <CardHeader>
            <CardTitle className="font-headline text-2xl font-black tracking-tighter flex items-center">
              <Info className="h-6 w-6 mr-2 text-accent"/>
              Application Configuration
            </CardTitle>
            <CardDescription className="font-body">
              Currently, there are no application-specific settings to configure here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="font-body text-sm text-muted-foreground text-center pt-2">
              This section is reserved for future global settings for the kgchess application.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
