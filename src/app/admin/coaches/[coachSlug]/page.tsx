
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, BookOpen, CalendarDays, FileText, UserCircle2 } from 'lucide-react';
import { allCoachesData } from '@/components/sections/coach-profile-section'; // Import coach data
import type { LessonReportData } from '@/lib/types'; // Use existing definition
import { format, parseISO, isValid } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Define StoredLessonReport based on actual fields being saved (from lesson-report-form.tsx)
interface StoredLessonReport extends Omit<LessonReportData, 'pgnFile'> {
  id: string;
  submittedAt: string;
  pgnFilename?: string;
  // Add all fields from LessonReportData that are expected to be strings or numbers
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

const JSONBIN_API_BASE = "https://api.jsonbin.io/v3/b";
const LESSON_REPORTS_BIN_ID = "684952e58a456b7966ac3653"; 
const JSONBIN_ACCESS_KEY = "$2a$10$3Fh5hpLyq/Ou/V/O78u8xurtpTG6XomBJ7CqijLm3YgGX4LC3SFZy";


export default function CoachAdminProfilePage() {
  const params = useParams();
  const coachSlug = typeof params.coachSlug === 'string' ? params.coachSlug : undefined;

  const [coach, setCoach] = useState<(typeof allCoachesData)[0] | null>(null);
  const [lessonReports, setLessonReports] = useState<StoredLessonReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessonReports = useCallback(async (currentCoachName: string) => {
    if (!JSONBIN_ACCESS_KEY || !LESSON_REPORTS_BIN_ID) {
      setError("JSONBin.io Access Key or Reports Bin ID is not configured.");
      return [];
    }
    try {
      const response = await fetch(`${JSONBIN_API_BASE}/${LESSON_REPORTS_BIN_ID}/latest`, {
        method: 'GET',
        headers: { 'X-Access-Key': JSONBIN_ACCESS_KEY },
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch lesson reports. Status: ${response.status}. ${errorData}`);
      }
      const data = await response.json();
      const allReports: StoredLessonReport[] = (Array.isArray(data.record) ? data.record : [])
        .filter((report: any): report is StoredLessonReport => 
            report && 
            typeof report.id === 'string' &&
            typeof report.coachName === 'string' &&
            typeof report.studentName === 'string' &&
            typeof report.lessonDateTime === 'string'
        );
      
      const coachReports = allReports.filter(report => report.coachName === currentCoachName)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      return coachReports;
    } catch (e: any) {
      setError(e.message || "An unknown error occurred while fetching reports.");
      return [];
    }
  }, []);

  useEffect(() => {
    if (coachSlug) {
      const currentCoach = allCoachesData.find(c => 
        c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') === coachSlug
      );

      if (currentCoach) {
        setCoach(currentCoach);
        fetchLessonReports(currentCoach.name).then(reports => {
          setLessonReports(reports);
          setIsLoading(false);
        }).catch(() => setIsLoading(false)); 
      } else {
        setIsLoading(false);
        setError(`Coach profile not found for slug: "${coachSlug}".`);
      }
    } else {
      setIsLoading(false);
      setError("Coach slug is missing from URL.");
    }
  }, [coachSlug, fetchLessonReports]);

  if (isLoading) {
    // Loading state is handled by loading.tsx
    return null; 
  }

  if (error && !coach) { 
     return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h1 className="font-headline text-3xl mb-2">Error</h1>
                <p className="font-body text-muted-foreground">{error}</p>
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
          <h2 className="font-headline text-3xl font-bold mb-6 flex items-center">
            <FileText className="mr-3 h-7 w-7 text-accent" />
            Lesson Reports
          </h2>
          {error && !lessonReports.length && <p className="text-destructive font-body mb-4">Error loading reports: {error}</p>}
          {lessonReports.length > 0 ? (
            <div className="space-y-4">
              {lessonReports.map(report => (
                <Card key={report.id} className="shadow-md hover:shadow-lg transition-shadow border-border">
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">
                      Report for: {report.studentName || "N/A"}
                    </CardTitle>
                    <CardDescription className="font-body text-sm">
                      Lesson on: {report.lessonDateTime && isValid(parseISO(report.lessonDateTime)) ? format(parseISO(report.lessonDateTime), 'MMMM dd, yyyy @ HH:mm') : "Date N/A"}
                      <br />
                      Topic: {report.topicCovered || "N/A"}
                      {report.customTopic ? ` (${report.customTopic})` : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="font-body text-sm space-y-2">
                    <p><strong>Key Concepts:</strong> {report.keyConcepts || "N/A"}</p>
                    <p><strong>Strengths:</strong> {report.strengths || "N/A"}</p>
                    <p><strong>Areas to Improve:</strong> {report.areasToImprove || "N/A"}</p>
                    <p><strong>Homework - Puzzles:</strong> {report.assignedPuzzles || "N/A"}</p>
                    <p><strong>Homework - Practice:</strong> {report.practiceGames || "N/A"}</p>
                    {report.pgnFilename && <p><strong>PGN File:</strong> {report.pgnFilename}</p>}
                    {report.submittedAt && isValid(parseISO(report.submittedAt)) && <p className="text-xs text-muted-foreground pt-2">Submitted: {format(parseISO(report.submittedAt), 'MMM dd, yyyy HH:mm')}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="font-body text-muted-foreground">{isLoading ? "Loading reports..." : "No lesson reports found for this coach."}</p>
          )}
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
    </div>
  );
}

    