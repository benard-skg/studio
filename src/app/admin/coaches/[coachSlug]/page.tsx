
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
import type { Coach as CoachDataType, LessonReportData } from '@/lib/types';
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


interface StoredLessonReport extends Omit<LessonReportData, 'pgnFile'> {
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

const JSONBIN_API_BASE = "https://api.jsonbin.io/v3/b";
const LESSON_REPORTS_BIN_ID = "684952e58a456b7966ac3653";
const JSONBIN_ACCESS_KEY = "$2a$10$3Fh5hpLyq/Ou/V/O78u8xurtpTG6XomBJ7CqijLm3YgGX4LC3SFZy";


export default function CoachAdminProfilePage() {
  const params = useParams();
  const router = useRouter();
  const coachSlug = typeof params.coachSlug === 'string' ? params.coachSlug : undefined;

  const [coach, setCoach] = useState<CoachDataType | null>(null);
  const [lessonReports, setLessonReports] = useState<StoredLessonReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<StoredLessonReport | null>(null);
  const { toast } = useToast();


  const fetchLessonReports = useCallback(async (currentCoach: CoachDataType) => {
    console.log(`[CoachAdminProfilePage] fetchLessonReports called for coach: "${currentCoach.name}" (Nickname: "${currentCoach.nickname || 'N/A'}")`);
    if (!JSONBIN_ACCESS_KEY || !LESSON_REPORTS_BIN_ID) {
      setError("JSONBin.io Access Key or Reports Bin ID is not configured.");
      console.error("[CoachAdminProfilePage] JSONBin.io Access Key or Reports Bin ID is not configured.");
      return [];
    }
    try {
      const response = await fetch(`${JSONBIN_API_BASE}/${LESSON_REPORTS_BIN_ID}/latest`, {
        method: 'GET',
        headers: { 'X-Access-Key': JSONBIN_ACCESS_KEY },
      });
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`[CoachAdminProfilePage] Failed to fetch lesson reports. Status: ${response.status}. Response: ${errorData}`);
        throw new Error(`Failed to fetch lesson reports. Status: ${response.status}.`);
      }
      const data = await response.json();
      
      const allReports: StoredLessonReport[] = (Array.isArray(data.record) ? data.record : [])
        .filter((report: any): report is StoredLessonReport =>
            report &&
            typeof report.id === 'string' &&
            typeof report.coachName === 'string' && 
            typeof report.studentName === 'string' &&
            typeof report.lessonDateTime === 'string' &&
            typeof report.submittedAt === 'string' 
        );
      
      console.log(`[CoachAdminProfilePage] Fetched ${allReports.length} total reports. Sample coachName from first report (if any): "${allReports[0]?.coachName}"`);

      const coachFullNameLower = currentCoach.name.toLowerCase();
      const coachNicknameLower = currentCoach.nickname?.toLowerCase();

      const coachReports = allReports.filter(report => {
        const reportCoachNameLower = report.coachName.toLowerCase();
        
        if (reportCoachNameLower === coachFullNameLower) return true;
        if (coachNicknameLower && coachNicknameLower.length > 0 && reportCoachNameLower === coachNicknameLower) return true;
        if (reportCoachNameLower.includes(coachFullNameLower)) return true;
        if (coachNicknameLower && coachNicknameLower.length > 0 && reportCoachNameLower.includes(coachNicknameLower)) return true;
        
        return false;
      }).sort((a, b) => {
            const dateA = parseISO(a.submittedAt);
            const dateB = parseISO(b.submittedAt);
            if (!isValid(dateA) && isValid(dateB)) return 1; 
            if (isValid(dateA) && !isValid(dateB)) return -1;
            if (!isValid(dateA) && !isValid(dateB)) return 0;
            return dateB.getTime() - dateA.getTime();
        });
      
      console.log(`[CoachAdminProfilePage] Filtered down to ${coachReports.length} reports for coach: "${currentCoach.name}" using flexible matching.`);
      return coachReports;
    } catch (e: any) {
      console.error("[CoachAdminProfilePage] Error in fetchLessonReports:", e);
      setError(e.message || "An unknown error occurred while fetching reports.");
      return [];
    }
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
        setIsLoading(true);
        setError(null);
        fetchLessonReports(currentCoach) 
          .then(reports => {
            setLessonReports(reports);
          })
          .catch((e) => {
            console.error("[CoachAdminProfilePage] Error fetching reports in useEffect:", e);
            if (!error) setError("Failed to load reports due to an unexpected error.");
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        console.warn(`[CoachAdminProfilePage] Coach profile not found for slug: "${coachSlug}".`);
        setIsLoading(false);
        setError(`Coach profile not found for slug: "${coachSlug}".`);
        setCoach(null);
        setLessonReports([]);
      }
    } else {
      setIsLoading(false);
      setError("Coach slug is missing from URL.");
      setCoach(null);
      setLessonReports([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachSlug, fetchLessonReports]);

  const handleDeleteReport = async () => {
    if (!reportToDelete || !coach) return;
    setIsDeleting(true);
    try {
      const getResponse = await fetch(`${JSONBIN_API_BASE}/${LESSON_REPORTS_BIN_ID}/latest`, {
        method: 'GET',
        headers: { 'X-Access-Key': JSONBIN_ACCESS_KEY },
      });

      let allReports: StoredLessonReport[] = [];
      if (getResponse.ok) {
        const data = await getResponse.json();
        allReports = Array.isArray(data.record) ? data.record : [];
      } else {
        const errorText = await getResponse.text();
        throw new Error(`Failed to fetch current reports before deleting. Status: ${getResponse.status}. ${errorText}`);
      }

      const updatedReports = allReports.filter(report => report.id !== reportToDelete.id);

      const putResponse = await fetch(`${JSONBIN_API_BASE}/${LESSON_REPORTS_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': JSONBIN_ACCESS_KEY,
          'X-Bin-Versioning': 'false',
        },
        body: JSON.stringify(updatedReports),
      });

      if (!putResponse.ok) {
        const errorText = await putResponse.text();
        throw new Error(`Failed to delete report. Status: ${putResponse.status}. ${errorText}`);
      }

      toast({ title: "Report Deleted!", description: `Report for ${reportToDelete.studentName} has been removed.` });
      // Refresh reports for the current coach
      fetchLessonReports(coach).then(reports => setLessonReports(reports));
    } catch (e: any) {
      console.error("[CoachAdminProfilePage] Error deleting report:", e);
      toast({ variant: "destructive", title: "Delete Error", description: e.message });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };


  if (isLoading && !coach) {
    return null; 
  }

  if (!coach && !isLoading) {
     return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h1 className="font-headline text-3xl mb-2">Error</h1>
                <p className="font-body text-muted-foreground">{error || "Coach profile could not be loaded."}</p>
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
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/admin/lesson-reports/create">
                <FilePlus2 className="mr-2 h-5 w-5" /> Create New Report
              </Link>
            </Button>
          </div>

          {isLoading && <p className="font-body text-muted-foreground">Loading reports...</p>}
          {!isLoading && error && <p className="text-destructive font-body mb-4">Error loading reports: {error}</p>}
          {!isLoading && !error && lessonReports.length > 0 && (
            <div className="space-y-4">
              {lessonReports.map(report => (
                <Card key={report.id} className="shadow-md hover:shadow-lg transition-shadow border-border">
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                      <CardTitle className="font-headline text-xl">
                        Report for: {report.studentName || "N/A"}
                      </CardTitle>
                      <CardDescription className="font-body text-sm">
                        Lesson on: {report.lessonDateTime && isValid(parseISO(report.lessonDateTime)) ? format(parseISO(report.lessonDateTime), 'MMMM dd, yyyy @ HH:mm') : "Date N/A"}
                        <br />
                        Topic: {report.topicCovered || "N/A"}
                        {report.customTopic ? ` (${report.customTopic})` : ''}
                      </CardDescription>
                    </div>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => { setReportToDelete(report); setIsDeleteDialogOpen(true);}}
                        disabled={isDeleting}
                        aria-label="Delete report"
                      >
                        {isDeleting && reportToDelete?.id === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
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
          )}
          {!isLoading && !error && lessonReports.length === 0 && (
            <p className="font-body text-muted-foreground">No lesson reports found for this coach.</p>
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

      {reportToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the lesson report for <strong className="font-medium">{reportToDelete.studentName}</strong> submitted on {reportToDelete.submittedAt && isValid(parseISO(reportToDelete.submittedAt)) ? format(parseISO(reportToDelete.submittedAt), 'MMM dd, yyyy') : 'N/A'}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setIsDeleteDialogOpen(false); setReportToDelete(null); }} disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteReport}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Report
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
    

      