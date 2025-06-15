
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import type { StoredLessonReport } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { Loader2, AlertCircle, FileText, CalendarDays, BookOpen, Edit3, Download, Trash2, ListChecks, Target, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format, parseISO, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { slugify } from '@/lib/utils';

export default function ViewLessonReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = typeof params.reportId === 'string' ? params.reportId : undefined;
  const { toast } = useToast();

  const [report, setReport] = useState<StoredLessonReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


  useEffect(() => {
    if (!reportId) {
      setError("Report ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const reportDocRef = doc(db, "lessonReports", reportId);
        const reportSnap = await getDoc(reportDocRef);

        if (reportSnap.exists()) {
          const data = reportSnap.data();
          setReport({ 
            id: reportSnap.id, 
            ...data,
            lessonDateTime: data.lessonDateTime, // Should be ISO string
            submittedAt: data.submittedAt as Timestamp,
          } as StoredLessonReport);
        } else {
          setError("Lesson report not found.");
        }
      } catch (err) {
        console.error("Error fetching lesson report:", err);
        setError("Failed to fetch lesson report. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const formatDisplayDate = (dateInput: string | Timestamp | undefined | null): string => {
    if (!dateInput) return 'N/A';
    let dateObj: Date;
    if (typeof dateInput === 'string') {
      dateObj = parseISO(dateInput);
    } else if (dateInput instanceof Timestamp) {
      dateObj = dateInput.toDate();
    } else {
      return 'Invalid Date';
    }
    return isValid(dateObj) ? format(dateObj, "MMMM dd, yyyy 'at' hh:mm a") : 'Invalid Date';
  };
  
  const formatSimpleDate = (dateInput: string | undefined): string => {
     if (!dateInput) return 'N/A';
     const dateObj = parseISO(dateInput);
     return isValid(dateObj) ? format(dateObj, "MMMM dd, yyyy") : 'Invalid Date';
  };

  const handlePlaceholderDownload = () => {
    toast({
        title: "Download Placeholder",
        description: `Download action for "${report?.studentName}'s report" is not yet implemented.`,
    });
  };

  const handleDeleteReport = async () => {
    if (!report) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "lessonReports", report.id));
      toast({
        title: "Report Deleted",
        description: `Lesson report for ${report.studentName} has been deleted.`,
      });
      router.push(`/admin/coaches/${slugify(report.coachName)}`); // Redirect to coach page
    } catch (err) {
      console.error("Error deleting lesson report:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the lesson report. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow pt-24 pb-12 container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow pt-24 pb-12 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h1 className="font-headline text-3xl font-black tracking-tighter mb-2">Error Loading Report</h1>
            <p className="font-body text-muted-foreground">{error}</p>
            <Button asChild className="mt-6">
              <Link href="/admin">Back to Admin</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!report) {
     notFound();
  }

  const DetailItem = ({ label, value, icon: Icon, isRichText = false }: { label: string; value?: string | number | null; icon?: React.ElementType; isRichText?: boolean }) => (
    value || value === 0 ? (
      <div className="mb-3">
        <dt className="font-body text-sm font-medium text-muted-foreground flex items-center">
          {Icon && <Icon className="h-4 w-4 mr-2 text-accent" />}
          {label}
        </dt>
        {isRichText && typeof value === 'string' ? (
          <dd className="font-body text-base mt-1 ml-6 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, '<br />') }} />
        ) : (
          <dd className="font-body text-base mt-1 ml-6">{value}</dd>
        )}
      </div>
    ) : null
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-3xl mx-auto shadow-xl border-border">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <CardTitle className="font-headline text-2xl md:text-3xl font-black tracking-tighter flex items-center">
                    <FileText className="mr-3 h-7 w-7 text-accent" />
                    Lesson Report Details
                    </CardTitle>
                    <CardDescription className="font-body mt-1">
                    Student: {report.studentName} | Coach: {report.coachName}
                    </CardDescription>
                </div>
                 <div className="flex space-x-1 mt-3 sm:mt-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/lesson-reports/edit/${report.id}`}>
                                    <Edit3 className="h-5 w-5 text-blue-500"/>
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Edit Report</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handlePlaceholderDownload}>
                                <Download className="h-5 w-5 text-green-500"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Download Report</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="h-5 w-5 text-destructive"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Delete Report</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            <section>
              <h3 className="font-headline text-xl font-black tracking-tighter mb-3 flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-accent" />Lesson Overview</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <DetailItem label="Lesson Date & Time" value={formatDisplayDate(report.lessonDateTime)} />
                <DetailItem label="Submitted On" value={formatDisplayDate(report.submittedAt)} />
                <DetailItem label="Topic Covered" value={report.topicCovered === 'Custom' && report.customTopic ? report.customTopic : report.topicCovered} />
                {report.ratingBefore !== undefined && <DetailItem label="Rating Before" value={report.ratingBefore} />}
                {report.ratingAfter !== undefined && <DetailItem label="Rating After" value={report.ratingAfter} />}
              </dl>
            </section>

            <Separator />

            <section>
              <h3 className="font-headline text-xl font-black tracking-tighter mb-3 flex items-center"><BookOpen className="mr-2 h-5 w-5 text-accent" />Content & Analysis</h3>
              <dl>
                <DetailItem label="Key Concepts Discussed" value={report.keyConcepts} isRichText />
                <DetailItem label="Game Example Links" value={report.gameExampleLinks} />
              </dl>
            </section>
            
            <Separator />

            <section>
              <h3 className="font-headline text-xl font-black tracking-tighter mb-3 flex items-center"><Target className="mr-2 h-5 w-5 text-accent" />Student Performance</h3>
              <dl>
                <DetailItem label="Strengths Observed" value={report.strengths} isRichText />
                <DetailItem label="Areas to Improve" value={report.areasToImprove} isRichText />
                <DetailItem label="Common Mistakes Made" value={report.mistakesMade} isRichText />
              </dl>
            </section>

            <Separator />

            <section>
              <h3 className="font-headline text-xl font-black tracking-tighter mb-3 flex items-center"><ListChecks className="mr-2 h-5 w-5 text-accent" />Homework & Next Steps</h3>
              <dl>
                <DetailItem label="Assigned Puzzles" value={report.assignedPuzzles} isRichText />
                <DetailItem label="Practice Games" value={report.practiceGames} isRichText />
                <DetailItem label="Recommended Reading/Videos" value={report.readingVideos} />
              </dl>
            </section>

            {report.additionalNotes && (
              <>
                <Separator />
                <section>
                  <h3 className="font-headline text-xl font-black tracking-tighter mb-3 flex items-center"><CheckSquare className="mr-2 h-5 w-5 text-accent" />Additional Notes</h3>
                  <dl>
                    <DetailItem label="" value={report.additionalNotes} isRichText />
                  </dl>
                </section>
              </>
            )}
             <p className="text-xs text-muted-foreground text-center pt-4">Report ID: {report.id}</p>
          </CardContent>
        </Card>
      </main>
      <Footer />

      {report && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline text-xl font-black tracking-tighter">Delete Lesson Report?</AlertDialogTitle>
              <AlertDialogDescription className="font-body">
                Are you sure you want to delete the lesson report for <strong>{report.studentName}</strong> (Lesson: {formatSimpleDate(report.lessonDateTime)})? This action cannot be undone.
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

    
