
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, BookOpen, CalendarDays, FileText, UserCircle2, Trash2, FilePlus2, Loader2 } from 'lucide-react';
import { allCoachesData } from '@/components/sections/coach-profile-section';
import type { Coach as CoachDataType } from '@/lib/types'; 
import { format, parseISO, isValid } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


interface StoredLessonReport { 
  id: string;
  submittedAt: string; 
  pgnFilename?: string;
  studentName: string;
  lessonDateTime: string; 
  coachName: string; 
  ratingBefore?: number;
  ratingAfter?: number;
  topicCovered: string;
  customTopic?: string;
  keyConcepts: string;
  gameExampleLinks?: string;
  strengths: string;
  areasToImprove: string;
  mistakesMade: string;
  assignedPuzzles: string;
  practiceGames: string;
  readingVideos?: string;
  additionalNotes?: string;
}

// JSONBin.io configuration for lesson reports removed

export default function CoachAdminProfilePage() {
  const params = useParams();
  const router = useRouter();
  const coachSlug = typeof params.coachSlug === 'string' ? params.coachSlug : undefined;

  const [coach, setCoach] = useState<CoachDataType | null>(null);
  const [lessonReports, setLessonReports] = useState<StoredLessonReport[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Keep true initially until coach data is resolved
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>("Lesson report functionality is currently disabled. JSONBin.io integration removed.");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<StoredLessonReport | null>(null);
  const { toast } = useToast();
  const [isConfigured, setIsConfigured] = useState(false); // Default to false


  const fetchLessonReports = useCallback(async (currentCoach: CoachDataType) => {
    console.warn(`[CoachAdminProfilePage] fetchLessonReports: Lesson report fetching disabled for coach: "${currentCoach.name}"`);
    setIsConfigured(false); // Ensure this reflects disabled state
    // setError("Lesson report fetching is disabled."); // Already set
    return [];
  }, []);

  useEffect(() => {
    if (coachSlug) {
      console.log(`[CoachAdminProfilePage] useEffect triggered with coachSlug: "${coachSlug}"`);
      const currentCoach = allCoachesData.find(c =>
        c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') === coachSlug
      );

      if (currentCoach) {
        console.log(`[CoachAdminProfilePage] Found coach: "${currentCoach.name}" (Nickname: "${currentCoach.nickname || 'N/A'}")`);
        setCoach(currentCoach);
        setIsLoading(true); // Still loading coach info
        // setError(null); // Error is now for JSONBin feature
        fetchLessonReports(currentCoach) 
          .then(reports => {
            setLessonReports(reports); // Will be empty
          })
          .finally(() => {
            setIsLoading(false); // Finished "fetching" (which does nothing now)
          });
      } else {
        console.warn(`[CoachAdminProfilePage] Coach profile not found for slug: "${coachSlug}".`);
        setIsLoading(false);
        // Keep the generic error or set a specific one for coach not found
        setError(prevError => prevError || `Coach profile not found for slug: "${coachSlug}".`);
        setCoach(null);
        setLessonReports([]);
      }
    } else {
      setIsLoading(false);
      setError(prevError => prevError || "Coach slug is missing from URL.");
      setCoach(null);
      setLessonReports([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachSlug, fetchLessonReports]); 

  const handleDeleteReport = async () => {
    if (!reportToDelete || !coach) return;
    toast({ variant: "destructive", title: "Disabled", description: "Deleting lesson reports is currently disabled."});
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
    setReportToDelete(null);
  };


  if (isLoading && !coach && !error) { 
    return null; 
  }
  
  // Show main error if coach not found OR if JSONBin is "misconfigured" (i.e., disabled)
  if ((!coach && !isLoading) || (!isConfigured && error)) { 
     return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h1 className="font-headline text-3xl mb-2">Error</h1>
                <p className="font-body text-muted-foreground">
                  {error || "Coach profile could not be loaded or feature is disabled."}
                </p>
                 <Button asChild className="mt-6">
                    <Link href="/coaches">Back to Coaches</Link>
                </Button>
            </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!coach) { 
    notFound();
  }


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden shrink-0 shadow-lg border-2 border-accent">
              <Image
                src={coach.imageSrc || "https://placehold.co/160x160.png"}
                alt={`Avatar of ${coach.name}`}
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint={coach.imageAiHint || "profile avatar"}
              />
            </div>
            <div className="space-y-1 text-center md:text-left pt-2">
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
                {coach.name} {coach.nickname && `(${coach.nickname})`}
              </h1>
              <p className="font-body text-xl text-muted-foreground">{coach.title}</p>
            </div>
          </div>
        </header>

        <Separator className="my-8" />

        <section id="lesson-reports" className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-3xl font-bold flex items-center">
              <FileText className="mr-3 h-7 w-7 text-accent" />
              Lesson Reports
            </h2>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={!isConfigured}>
              <Link href="/admin/lesson-reports/create">
                <FilePlus2 className="mr-2 h-5 w-5" /> Create New Report
              </Link>
            </Button>
          </div>
          
          <p className="text-muted-foreground font-body mb-4">{error}</p>

          {/* Lesson reports display logic removed as data fetching is disabled */}
          <p className="font-body text-muted-foreground">No lesson reports to display as the feature is disabled.</p>
        </section>

        <Separator className="my-8" />
        
        <section id="coach-articles" className="mb-12">
          <h2 className="font-headline text-3xl font-bold mb-6 flex items-center">
            <BookOpen className="mr-3 h-7 w-7 text-accent" />
            Articles Authored
          </h2>
          <p className="font-body text-muted-foreground">Coming soon: Articles written by {coach.name}.</p>
        </section>

        <Separator className="my-8" />

        <section id="coach-calendar" className="mb-12">
          <h2 className="font-headline text-3xl font-bold mb-6 flex items-center">
            <CalendarDays className="mr-3 h-7 w-7 text-accent" />
            Scheduled Items
          </h2>
          <p className="font-body text-muted-foreground">Coming soon: Calendar events scheduled by {coach.name}.</p>
        </section>

      </main>
      <Footer />

      {/* AlertDialog for delete removed as delete functionality is disabled */}
    </div>
  );
}
