
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import LessonReportForm from '@/components/forms/lesson-report-form';
import type { StoredLessonReport } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import withAuth from '@/components/auth/withAuth'; // Import withAuth HOC

function EditLessonReportPageContent() {
  const params = useParams();
  const router = useRouter();
  const reportId = typeof params.reportId === 'string' ? params.reportId : undefined;

  const [reportData, setReportData] = useState<StoredLessonReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          // Ensure lessonDateTime is handled correctly (it should be an ISO string from Firestore if stored from datetime-local)
          // And submittedAt is correctly typed as a Timestamp for the StoredLessonReport type
          setReportData({ 
            id: reportSnap.id, 
            ...data,
            // If lessonDateTime is a Firestore Timestamp, convert it to ISO string for the form
            lessonDateTime: data.lessonDateTime instanceof Timestamp 
              ? data.lessonDateTime.toDate().toISOString() 
              : data.lessonDateTime,
            submittedAt: data.submittedAt, // Keep as Timestamp
          } as StoredLessonReport);
        } else {
          setError("Lesson report not found.");
          notFound(); // Or handle with a specific "not found" UI
        }
      } catch (err) {
        console.error("Error fetching lesson report:", err);
        setError("Failed to fetch lesson report. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId, router]);

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
            <h1 className="font-headline text-3xl font-bold tracking-tight mb-2">Error Loading Report</h1>
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
  
  if (!reportData && !isLoading && !error) {
    // This case implies reportId was invalid or not found, handled by error state or notFound()
     return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow pt-24 pb-12 container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h1 className="font-headline text-3xl font-bold tracking-tight mb-2">Report Not Found</h1>
            <p className="font-body text-muted-foreground">The requested lesson report could not be found.</p>
             <Button asChild className="mt-6">
              <Link href="/admin">Back to Admin</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 container mx-auto px-4 sm:px-6 lg:px-8">
        {reportData && <LessonReportForm reportToEdit={reportData} />}
      </main>
      <Footer />
    </div>
  );
}

export default withAuth(EditLessonReportPageContent); // Wrap component
