
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, BookOpen, CalendarDays, FileText, Trash2, FilePlus2, Loader2, Download } from 'lucide-react';
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
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, Timestamp } from 'firebase/firestore';

interface StoredLessonReport {
  id: string;
  submittedAt: Timestamp;
  pgnFilename?: string;
  pgnFileUrl?: string;
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

  const fetchLessonReports = useCallback(async (currentCoachName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const reportsCol = collection(db, "lessonReports");
      const q = query(reportsCol, where("coachName", "==", currentCoachName), orderBy("submittedAt", "desc"));
      const reportsSnapshot = await getDocs(q);
      const reportsList = reportsSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as StoredLessonReport));
      setLessonReports(reportsList);
    } catch (err) {
      console.error(`Error fetching lesson reports for ${currentCoachName}:`, err);
      setError(`Failed to fetch lesson reports for ${currentCoachName}.`);
      setLessonReports([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (coachSlug) {
      const currentCoach = allCoachesData.find(c =>
        c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') === coachSlug
      );

      if (currentCoach) {
        setCoach(currentCoach);
        fetchLessonReports(currentCoach.name);
      } else {
        setError(`Coach profile not found for slug: "${coachSlug}".`);
        setCoach(null);
        setLessonReports([]);
        setIsLoading(false);
      }
    } else {
      setError("Coach slug is missing from URL.");
      setCoach(null);
      setLessonReports([]);
      setIsLoading(false);
    }
  }, [coachSlug, fetchLessonReports]);

  const handleDeleteReport = async () => {
    if (!reportToDelete || !coach) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "lessonReports", reportToDelete.id));
      toast({
        title: "Report Deleted",
        description: `Lesson report for ${reportToDelete.studentName} has been deleted.`,
      });
      setLessonReports(prev => prev.filter(r => r.id !== reportToDelete.id));
      setIsDeleteDialogOpen(false);
      setReportToDelete(null);
    } catch (err) {
      console.error("Error deleting lesson report:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the lesson report. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp: Timestamp | undefined | null) => {
    if (!timestamp) return 'N/A';
    try {
      return format(timestamp.toDate(), "MMM dd, yyyy 'at' hh:mm a");
    } catch (e) {
      console.warn("Could not format date: ", timestamp, e);
      return 'Invalid Date';
    }
  };

  const formatLessonDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const lessonDate = parseISO(dateString);
      return isValid(lessonDate) ? format(lessonDate, "MMM dd, yyyy, HH:mm") : 'Invalid Date';
    } catch(e) {
      return 'Invalid Date';
    }
  };

  if (isLoading && !coach && !error) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-accent" />
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !coach) {
     return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h1 className="font-headline text-3xl font-black tracking-tighter mb-2">Error Loading Profile</h1>
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
              <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                {coach.name} {coach.nickname && `(${coach.nickname})`}
              </h1>
              <p className="font-body text-xl text-muted-foreground">{coach.title}</p>
            </div>
          </div>
        </header>

        <Separator className="my-8" />

        <section id="lesson-reports" className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-3xl font-black tracking-tighter flex items-center">
              <FileText className="mr-3 h-7 w-7 text-accent" />
              Lesson Reports
            </h2>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/admin/lesson-reports/create">
                <FilePlus2 className="mr-2 h-5 w-5" /> Create New Report
              </Link>
            </Button>
          </div>

          {isLoading && <div className="flex justify-center py-4"><Loader2 className="h-8 w-8 animate-spin text-accent"/></div>}
          {!isLoading && error && <p className="text-destructive font-body mb-4">{error}</p>}
          {!isLoading && !error && lessonReports.length === 0 && (
            <p className="font-body text-muted-foreground">No lesson reports found for {coach.name}.</p>
          )}
          {!isLoading && !error && lessonReports.length > 0 && (
            <div className="space-y-4">
              {lessonReports.map(report => (
                <Card key={report.id} className="shadow-sm border-border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-headline text-xl font-black tracking-tighter">Report for: {report.studentName}</CardTitle>
                        <CardDescription className="font-body text-xs">
                          Lesson: {formatLessonDate(report.lessonDateTime)} | Submitted: {formatDate(report.submittedAt)}
                        </CardDescription>
                      </div>
                       <Button variant="ghost" size="icon" onClick={() => { setReportToDelete(report); setIsDeleteDialogOpen(true); }} title="Delete Report">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p className="font-body"><strong>Topic:</strong> {report.topicCovered === 'Custom' ? report.customTopic : report.topicCovered}</p>
                    <p className="font-body"><strong>Key Concepts:</strong> <span className="text-muted-foreground line-clamp-2">{report.keyConcepts}</span></p>
                    {report.pgnFilename && (
                        <div className="flex items-center space-x-2">
                            <p className="font-body"><strong>PGN:</strong> {report.pgnFilename}</p>
                            {report.pgnFileUrl && (
                                <a href={report.pgnFileUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                                    <Download className="h-4 w-4 inline-block"/>
                                </a>
                            )}
                        </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <Separator className="my-8" />

        <section id="coach-articles" className="mb-12">
          <h2 className="font-headline text-3xl font-black tracking-tighter mb-6 flex items-center">
            <BookOpen className="mr-3 h-7 w-7 text-accent" />
            Articles Authored
          </h2>
          <p className="font-body text-muted-foreground">Coming soon: Articles written by {coach.name}.</p>
        </section>

        <Separator className="my-8" />

        <section id="coach-calendar" className="mb-12">
          <h2 className="font-headline text-3xl font-black tracking-tighter mb-6 flex items-center">
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
              <AlertDialogTitle className="font-headline text-xl font-black tracking-tighter">Delete Lesson Report?</AlertDialogTitle>
              <AlertDialogDescription className="font-body">
                Are you sure you want to delete the lesson report for <strong>{reportToDelete.studentName}</strong> (Lesson: {formatLessonDate(reportToDelete.lessonDateTime)})? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteReport}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
