
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { useToast } from '@/hooks/use-toast';
import { Save, Settings, UserCircle } from 'lucide-react';

const LICHESS_USERNAME_KEY = 'lichessTvUsername';

export default function AdminSettingsPage() {
  const [lichessUsername, setLichessUsername] = useState('');
  const [currentSavedUsername, setCurrentSavedUsername] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedUsername = localStorage.getItem(LICHESS_USERNAME_KEY);
    if (storedUsername) {
      setCurrentSavedUsername(storedUsername);
      setLichessUsername(storedUsername); // Pre-fill input if username exists
    }
  }, []);

  const handleSaveUsername = () => {
    if (!lichessUsername.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Lichess username cannot be empty.",
      });
      return;
    }
    localStorage.setItem(LICHESS_USERNAME_KEY, lichessUsername.trim());
    setCurrentSavedUsername(lichessUsername.trim());
    toast({
      title: "Settings Saved",
      description: `Lichess username "${lichessUsername.trim()}" saved for ChessTV.`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 text-center">
          <Settings className="mx-auto h-12 w-12 text-accent mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
            Admin Settings
          </h1>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Configure application settings.
          </p>
        </header>

        <Card className="max-w-lg mx-auto shadow-lg border-border">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <UserCircle className="h-6 w-6 mr-2 text-accent"/>
              ChessTV Lichess Username
            </CardTitle>
            <CardDescription className="font-body">
              Enter the Lichess username to display live games on the homepage ChessTV section.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="lichessUsername" className="font-body">Lichess Username</Label>
              <Input
                id="lichessUsername"
                type="text"
                value={lichessUsername}
                onChange={(e) => setLichessUsername(e.target.value)}
                placeholder="e.g., DrNykterstein"
                className="font-body"
              />
            </div>
            <Button onClick={handleSaveUsername} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Save className="mr-2 h-4 w-4" />
              Save Username
            </Button>
            {currentSavedUsername && (
              <p className="font-body text-sm text-muted-foreground text-center pt-2">
                Currently displaying games for: <strong className="text-accent">{currentSavedUsername}</strong>
              </p>
            )}
            {!currentSavedUsername && (
                <p className="font-body text-sm text-muted-foreground text-center pt-2">
                    No Lichess username is currently set for ChessTV.
                </p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
