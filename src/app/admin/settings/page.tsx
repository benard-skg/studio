
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { useToast } from '@/hooks/use-toast';
import { Save, Settings, UserCircle, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const SETTINGS_DOC_ID = 'appSettings'; 
const LICHESS_USERNAME_KEY = 'lichessTvUsername';

export default function AdminSettingsPage() {
  const [lichessUsername, setLichessUsername] = useState('');
  const [currentSavedUsername, setCurrentSavedUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data[LICHESS_USERNAME_KEY]) {
          const username = data[LICHESS_USERNAME_KEY] as string;
          setCurrentSavedUsername(username);
          setLichessUsername(username);
        } else {
           setCurrentSavedUsername(null);
           setLichessUsername('');
        }
      } else {
        setCurrentSavedUsername(null);
        setLichessUsername('');
      }
    } catch (error) {
      // Intentionally kept for debugging settings fetch
      console.error("Error fetching settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch current settings. Please try again.",
      });
       setCurrentSavedUsername(null);
       setLichessUsername('');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveUsername = async () => {
    if (!lichessUsername.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Lichess username cannot be empty.",
      });
      return;
    }
    setIsSaving(true);
    try {
      const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);
      await setDoc(settingsDocRef, { 
        [LICHESS_USERNAME_KEY]: lichessUsername.trim(),
        updatedAt: serverTimestamp() 
      }, { merge: true }); 

      setCurrentSavedUsername(lichessUsername.trim());
      toast({
        title: "Settings Saved",
        description: `Lichess username "${lichessUsername.trim()}" saved for ChessTV.`,
      });
    } catch (error) {
      // Intentionally kept for debugging settings save
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
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
            {isLoading ? (
                <div className="flex justify-center items-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-accent"/>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                    <Label htmlFor="lichessUsername" className="font-body">Lichess Username</Label>
                    <Input
                        id="lichessUsername"
                        type="text"
                        value={lichessUsername}
                        onChange={(e) => setLichessUsername(e.target.value)}
                        placeholder="e.g., DrNykterstein"
                        className="font-body"
                        disabled={isSaving}
                    />
                    </div>
                    <Button onClick={handleSaveUsername} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Username'}
                    </Button>
                    {currentSavedUsername && !isSaving && (
                    <p className="font-body text-sm text-muted-foreground text-center pt-2">
                        Currently displaying games for: <strong className="text-accent">{currentSavedUsername}</strong>
                    </p>
                    )}
                    {!currentSavedUsername && !isSaving && (
                        <p className="font-body text-sm text-muted-foreground text-center pt-2">
                            No Lichess username is currently set for ChessTV.
                        </p>
                    )}
                 </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
