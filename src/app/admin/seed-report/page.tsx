
"use client";

import { useState } from 'react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { Loader2, Save } from 'lucide-react';

const reportDataToSeed = {
  // id: "report-1749857706869-aipjd", // ID is used in doc() ref
  studentName: "Aidan Veldtman",
  lessonDateTime: "2025-06-13T14:00",
  coachName: "Mahomole T.R", // Assuming Tebogo is Mahomole T.R.
  topicCovered: "Positional Play",
  customTopic: "",
  keyConcepts: "Assessment of a Position: \n6. Evaluation of Weaknesses:\n6.1. Short-Term and Long-Term Weaknesses \n6.2. Potential and Actual Weaknesses",
  gameExampleLinks: "",
  strengths: "Displayed good instincts when asked to \"guess\" the moves that were made by the players (GM's in most games) from games we were analyzing. Showed improvement when it comes to identifying the \"fundamentals / elements\" applicable in a given position ",
  areasToImprove: "Build on the knowledge and understanding of the basic elements of assessing a position . This will improve ability to balance competing ideas / concepts when deciding between equal looking courses of action   ",
  mistakesMade: "At times moves are rushed,  and when this happens simple tactical shots are overlooked. Since  the underlying reasons behind this habit is known and acknowledged as a weakness in his overall game, he needs to keep working on improving concentration and focus during the game. Overcoming this particular obstacle will significantly improve his play ",
  assignedPuzzles: "Daily Puzzle Rush (5-10 runs or 15-20 min);\n",
  practiceGames: "Analyze one game from the chapter we are currently studying (Weaknesses: Potential and Actual Weaknesses) from page 56. Spend 30min - 1 hour. Before going through the game, first revise  your notes on the ELEMENTS (all six) to get into the right thinking space. During analysis keep playing the \"guessing game\" at turning points in the position.",
  readingVideos: "",
  additionalNotes: "Should you have any questions during or after, feel free to reach out and help out if I'm available ",
  // ratingBefore and ratingAfter are omitted if not provided, Firestore handles optional fields.
  // submittedAt will be converted to a Timestamp
};

const reportId = "report-1749857706869-aipjd";
const submittedAtISO = "2025-06-13T23:35:06.869Z";

export default function SeedReportPage() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedReport = async () => {
    setIsSeeding(true);
    try {
      const dataWithTimestamp = {
        ...reportDataToSeed,
        submittedAt: Timestamp.fromDate(new Date(submittedAtISO)),
      };

      await setDoc(doc(db, "lessonReports", reportId), dataWithTimestamp);

      toast({
        title: "Report Seeded Successfully!",
        description: `Report ID: ${reportId} for ${reportDataToSeed.studentName} has been added.`,
      });
    } catch (error) {
      console.error("Error seeding report:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: `Could not seed the report. ${errorMessage}`,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="text-center max-w-md p-8 bg-card rounded-lg shadow-xl border border-border">
          <h1 className="font-headline text-3xl font-black tracking-tighter mb-6">
            Temporary Report Seeding
          </h1>
          <p className="font-body text-muted-foreground mb-8">
            Click the button below to add the specific lesson report for Aidan Veldtman (Coach: Tebogo - Mahomole T.R.) to Firestore.
            This is a one-time action.
          </p>
          <Button
            onClick={handleSeedReport}
            disabled={isSeeding}
            size="lg"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isSeeding ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {isSeeding ? "Seeding Report..." : "Seed Coach Tebogo's Report for Aidan Veldtman"}
          </Button>
          <p className="font-body text-xs text-muted-foreground mt-6">
            After successful seeding, please request the removal of this page.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
