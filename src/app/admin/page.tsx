
"use client";

import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { useEffect, useState, useCallback } from 'react';
import { AlertCircle, Loader2, Mail } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
// Table components might not be needed if no data is displayed
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogCancel,
  // AlertDialogAction, // Not needed if delete is disabled
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger, // Not needed if delete is disabled
} from "@/components/ui/alert-dialog";
// import { useToast } from '@/hooks/use-toast'; // Not needed if no actions
// import { format } from 'date-fns'; // Not needed if no date display

// Interface Submission removed as it's no longer fetched or displayed

// JSONBin.io configuration removed

export default function AdminPage() {
  // const [submissions, setSubmissions] = useState<Submission[]>([]); // State removed
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>("Contact submissions viewing is currently disabled. JSONBin.io integration removed.");
  const [isConfigured, setIsConfigured] = useState(false); 
  // const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null); // State removed
  // const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // State removed
  // const { toast } = useToast(); // Not needed

  const fetchSubmissions = useCallback(async () => {
    setIsConfigured(false);
    setIsLoading(false);
    setError("Contact submissions viewing is disabled as JSONBin.io integration is removed.");
    console.warn("Admin page: Contact submission fetching disabled.");
  }, []);

  useEffect(() => {
    fetchSubmissions(); 
  }, [fetchSubmissions]);
  

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6 text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
            Admin - Contact Submissions
          </h1>
          <p className="font-body text-lg text-muted-foreground mt-2">
            View messages submitted through the contact form.
          </p>
        </header>

        {isLoading && ( 
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="ml-3 font-body">Loading...</p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-10 bg-card border border-border text-foreground p-6 rounded-lg shadow-md">
          <Mail className="h-10 w-10 mb-3 text-muted-foreground" />
          <p className="font-headline text-2xl mb-2">Submissions Unavailable</p>
          <p className="font-body text-center text-muted-foreground">
            {error || "Viewing contact submissions is currently disabled."}
          </p>
        </div>
        
      </main>
      <Footer />
    </div>
  );
}
