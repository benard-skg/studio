
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createRoot } from 'react-dom/client';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, BookOpen, CalendarDays, FileText, Trash2, FilePlus2, Loader2, Download, Edit3 } from 'lucide-react';
import { allCoachesData } from '@/components/sections/coach-profile-section';
import type { Coach as CoachDataType, StoredLessonReport } from '@/lib/types';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { slugify, cn } from '@/lib/utils';
import LessonReportPrintableView from '@/components/reports/lesson-report-printable-view';
import html2pdf from 'html2pdf.js';


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
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLessonReports = useCallback(async (currentCoachName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const reportsCol = collection(db, "lessonReports");
      const q = query(reportsCol, where("coachName", "==", currentCoachName), orderBy("submittedAt", "desc"));
      const reportsSnapshot = await getDocs(q);
      const reportsList = reportsSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          submittedAt: data.submittedAt as Timestamp, 
        } as StoredLessonReport;
      });
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
        slugify(c.name) === coachSlug
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

  const handleDeleteReport = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
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
  
  const handleDownloadReportCard = async (e: React.MouseEvent, report: StoredLessonReport) => {
    e.stopPropagation();
    if (!report) {
      toast({ variant: "destructive", title: "Error", description: "Report data not available." });
      return;
    }
    setDownloadingReportId(report.id);
    setIsDownloadingPdf(true);
    toast({ title: "Generating PDF...", description: `For report: ${report.studentName}. Please wait.` });

    const printElementContainer = document.createElement('div');
    printElementContainer.style.position = 'absolute';
    printElementContainer.style.left = '-9999px';
    printElementContainer.style.top = '-9999px';
    document.body.appendChild(printElementContainer);
    
    const root = createRoot(printElementContainer);

    try {
      await new Promise<void>(resolve => {
        root.render(<LessonReportPrintableView report={report} />);
        setTimeout(resolve, 500); 
      });

      const lessonDate = report.lessonDateTime ? parseISO(report.lessonDateTime) : new Date();
      const formattedDate = isValid(lessonDate) ? format(lessonDate, 'yyyy-MM-dd') : 'date-unknown';
      const filename = `Lesson-Report_${slugify(report.studentName || 'student')}_${formattedDate}.pdf`;
      
      const opt = {
        margin:       0.5,
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, logging: false, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().from(printElementContainer.firstChild).set(opt).save();
      toast({
        title: "PDF Downloaded",
        description: `Report for ${report.studentName} saved as ${filename}`,
      });
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError);
      toast({
        variant: "destructive",
        title: "PDF Generation Failed",
        description: "Could not generate the PDF. Please try again.",
      });
    } finally {
      root.unmount();
      document.body.removeChild(printElementContainer);
      setIsDownloadingPdf(false);
      setDownloadingReportId(null);
    }
  };


  const handleCardClick = (reportId: string) => {
    router.push(`/admin/lesson-reports/view/${reportId}`);
  };

  const handleEditClick = (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation();
    router.push(`/admin/lesson-reports/edit/${reportId}`);
  };

  const openDeleteDialog = (e: React.MouseEvent, report: StoredLessonReport) => {
    e.stopPropagation();
    setReportToDelete(report);
    setIsDeleteDialogOpen(true);
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/80">
                    <Link href="/admin/lesson-reports/create">
                      <FilePlus2 className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create New Report</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {isLoading && <div className="flex justify-center py-4"><Loader2 className="h-8 w-8 animate-spin text-accent"/></div>}
          {!isLoading && error && <p className="text-destructive font-body mb-4">{error}</p>}
          {!isLoading && !error && lessonReports.length === 0 && (
            <p className="font-body text-muted-foreground">No lesson reports found for {coach.name}.</p>
          )}
          {!isLoading && !error && lessonReports.length > 0 && (
            <div className="space-y-4">
              {lessonReports.map(report => (
                <Card 
                  key={report.id} 
                  className="shadow-sm border-border bg-card hover:shadow-md hover:bg-accent/5 active:bg-accent/10 active:scale-95 transition-all duration-150 ease-in-out cursor-pointer"
                  onClick={() => handleCardClick(report.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-headline text-xl font-black tracking-tighter">
                          Report for: <span className="text-accent">{report.studentName}</span>
                        </CardTitle>
                        <CardDescription className="font-body text-xs">
                          Lesson: {formatLessonDate(report.lessonDateTime)} | Submitted: {formatDate(report.submittedAt)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => handleDownloadReportCard(e, report)} disabled={isDownloadingPdf && downloadingReportId === report.id} title="Download Report">
                                {isDownloadingPdf && downloadingReportId === report.id ? <Loader2 className="h-4 w-4 animate-spin text-green-500" /> : <Download className="h-4 w-4 text-green-500" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Download Report as PDF</p></TooltipContent>
                          </Tooltip>
                           <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => handleEditClick(e, report.id)} title="Edit Report">
                                    <Edit3 className="h-4 w-4 text-blue-500" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Edit Report</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => openDeleteDialog(e, report)} title="Delete Report">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Delete Report</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                       </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p className="font-body"><strong>Topic:</strong> {report.topicCovered === 'Custom' ? report.customTopic : report.topicCovered}</p>
                    <p className="font-body"><strong>Key Concepts:</strong> <span className="text-muted-foreground line-clamp-2">{report.keyConcepts}</span></p>
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
              <AlertDialogCancel onClick={(e) => { e.stopPropagation(); setIsDeleteDialogOpen(false); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteReport}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80"
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
