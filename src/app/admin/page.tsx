
"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Square, CheckSquare, Loader2, Save, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Submission {
  id: string; 
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  seen?: boolean;
  lastSeen?: string;
}

const MASTER_KEY = process.env.NEXT_PUBLIC_JSONBIN_MASTER_KEY;
const BIN_ID = process.env.NEXT_PUBLIC_JSONBIN_BIN_ID;
const JSONBIN_API_BASE = "https://api.jsonbin.io/v3/b";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();
  const [deleteCandidateIndex, setDeleteCandidateIndex] = useState<number | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    // Log the keys as seen by the client-side code
    console.log("AdminPage: NEXT_PUBLIC_JSONBIN_MASTER_KEY:", MASTER_KEY);
    console.log("AdminPage: NEXT_PUBLIC_JSONBIN_BIN_ID:", BIN_ID);

    if (!MASTER_KEY || !BIN_ID) {
      console.error("JSONBin API keys are not configured. Please set NEXT_PUBLIC_JSONBIN_MASTER_KEY and NEXT_PUBLIC_JSONBIN_BIN_ID in your .env.local file.");
      toast({
        title: "Configuration Error",
        description: "Admin features for submissions are disabled. API keys for JSONBin.io are missing.",
        variant: "destructive",
        duration: Infinity,
      });
      setIsConfigured(false);
      setIsLoading(false);
      setError("Application is not configured to fetch submissions.");
    } else {
      fetchSubmissions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); // Removed MASTER_KEY and BIN_ID from deps as they are constants at module level

  const fetchSubmissions = async () => {
    if (!isConfigured) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${JSONBIN_API_BASE}/${BIN_ID}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': MASTER_KEY!,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Failed to fetch submissions:", response.status, errorData);
        throw new Error(`Failed to fetch submissions. Status: ${response.status}`);
      }

      const responseData = await response.json();
      
      let submissionsArray: Omit<Submission, 'id'>[] = []; 
      if (responseData && Array.isArray(responseData.record)) {
        submissionsArray = responseData.record;
      } else if (Array.isArray(responseData)) {
        submissionsArray = responseData;
      } else {
        console.warn("Fetched data is not an array or in expected format:", responseData);
        setError("Data format from bin is unexpected. Expected an array of submissions.");
        setSubmissions([]);
        setIsLoading(false);
        return;
      }
      const initializedSubmissions = submissionsArray.map((sub, index) => ({
        ...sub,
        id: (sub as Submission).id || `${new Date(sub.submittedAt).getTime()}-${index}`, 
        seen: sub.seen || false,
        lastSeen: sub.lastSeen,
      }));
      setSubmissions(initializedSubmissions);
      setLastUpdatedTime(format(new Date(), "PPP p"));
      setHasUnsavedChanges(false); 

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred fetching submissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const persistSubmissions = async (updatedSubmissions: Submission[]) => {
    if (!isConfigured) {
       toast({
        title: "Configuration Error",
        description: "Cannot save changes. API keys for JSONBin.io are missing.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      const putResponse = await fetch(`${JSONBIN_API_BASE}/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY!,
          'X-Bin-Versioning': 'false', 
        },
        body: JSON.stringify(updatedSubmissions),
      });

      if (putResponse.ok) {
        toast({
          title: "Changes Saved",
          description: "Submission statuses saved successfully to JSONBin.io.",
        });
        setSubmissions(updatedSubmissions); 
        setLastUpdatedTime(format(new Date(), "PPP p")); 
        setHasUnsavedChanges(false); 
      } else {
        const errorData = await putResponse.text();
        console.error("Failed to persist submissions to JSONBin.io:", putResponse.status, errorData);
        throw new Error(`Failed to save changes: ${putResponse.status}`);
      }
    } catch (error) {
      console.error("Error persisting submissions:", error);
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "Could not save changes to JSONBin.io. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSeen = (index: number) => {
    const newSubmissions = submissions.map((sub, i) => {
      if (i === index) {
        const updatedSub = { ...sub };
        updatedSub.seen = !updatedSub.seen;
        if (updatedSub.seen) {
          updatedSub.lastSeen = new Date().toISOString();
        } else {
          updatedSub.lastSeen = undefined; 
        }
        return updatedSub;
      }
      return sub;
    });
    
    setSubmissions(newSubmissions);
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    await persistSubmissions(submissions);
  };

  const handleInitiateDelete = (index: number) => {
    setDeleteCandidateIndex(index);
  };

  const handleConfirmDelete = () => {
    if (deleteCandidateIndex === null) return;

    const newSubmissions = submissions.filter((_, i) => i !== deleteCandidateIndex);
    setSubmissions(newSubmissions);
    setHasUnsavedChanges(true);
    setDeleteCandidateIndex(null); 
    toast({
      title: "Submission Marked for Deletion",
      description: "Click 'Save Changes' to permanently delete.",
    });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6 text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
            Admin - Contact Submissions
          </h1>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Viewing and managing data from JSONBin.io.
          </p>
        </header>

        {isSaving && (
          <div className="fixed top-24 right-6 z-50 bg-primary text-primary-foreground p-3 rounded-md shadow-lg flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Saving changes...</span>
          </div>
        )}

        {lastUpdatedTime && !isLoading && isConfigured && (
          <div className="mb-6 text-center">
            <p className="font-headline font-bold text-xl md:text-2xl text-foreground">
              Data last updated: {lastUpdatedTime}
            </p>
          </div>
        )}
        {isLoading && !lastUpdatedTime && isConfigured && (
           <div className="mb-6 text-center">
            <Skeleton className="h-8 w-1/2 mx-auto" />
          </div>
        )}

        {isLoading && isConfigured && (
          <div className="shadow-xl rounded-lg overflow-hidden border border-border bg-card">
            <Table>
              <TableCaption className="py-4 font-body text-sm text-muted-foreground bg-card border-t border-border">
                <Skeleton className="h-4 w-1/3 mx-auto" />
              </TableCaption>
              <TableHeader className="bg-card/50">
                <TableRow>
                  <TableHead className="font-headline text-card-foreground w-[5%]"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="font-headline text-card-foreground w-[15%]"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="font-headline text-card-foreground w-[15%]"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="font-headline text-card-foreground w-[25%]"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="font-headline text-card-foreground w-[15%]"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="font-headline text-card-foreground text-right w-[15%]"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="font-headline text-card-foreground text-center w-[10%]"><Skeleton className="h-5 w-full" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index} className="border-b border-border last:border-b-0">
                    <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-10 bg-destructive/10 border border-destructive text-destructive p-6 rounded-lg shadow-md">
            <AlertCircle className="h-10 w-10 mb-3" />
            <p className="font-headline text-2xl mb-2">Error Accessing Data</p>
            <p className="font-body text-center">{error}</p>
            {isConfigured && (
              <Button onClick={fetchSubmissions} variant="destructive" className="mt-4">
                Retry Fetch
              </Button>
            )}
          </div>
        )}

        {!isLoading && !error && submissions.length === 0 && isConfigured && (
          <div className="text-center py-12">
            <p className="font-body text-xl text-muted-foreground">No submissions found.</p>
          </div>
        )}

        {!isLoading && !error && submissions.length > 0 && isConfigured && (
          <>
            <div className="shadow-xl rounded-lg overflow-hidden border border-border bg-card">
              <Table>
                <TableCaption className="py-4 font-body text-sm text-muted-foreground bg-card border-t border-border">
                  A list of contact form submissions ({submissions.length} entries).
                </TableCaption>
                <TableHeader className="bg-card/50">
                  <TableRow>
                    <TableHead className="font-headline text-card-foreground w-[5%] text-center">Seen</TableHead>
                    <TableHead className="font-headline text-card-foreground w-[15%]">Name</TableHead>
                    <TableHead className="font-headline text-card-foreground w-[15%]">Email</TableHead>
                    <TableHead className="font-headline text-card-foreground w-[25%]">Message</TableHead>
                    <TableHead className="font-headline text-card-foreground w-[15%]">Last Seen</TableHead>
                    <TableHead className="font-headline text-card-foreground text-right w-[15%]">Submitted At</TableHead>
                    <TableHead className="font-headline text-card-foreground text-center w-[10%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission, index) => (
                    <TableRow key={submission.id} className="hover:bg-muted/20 border-b border-border last:border-b-0">
                      <TableCell className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleSeen(index)}
                          aria-label={submission.seen ? "Mark as unseen" : "Mark as seen"}
                          className="p-1 rounded-md hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isSaving}
                        >
                          {submission.seen ? (
                            <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-500" />
                          ) : (
                            <Square className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="font-body font-medium py-3 px-4">{submission.name}</TableCell>
                      <TableCell className="font-body py-3 px-4">{submission.email}</TableCell>
                      <TableCell className="font-body py-3 px-4 max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg truncate hover:whitespace-normal hover:overflow-visible" title={submission.message}>
                          {submission.message}
                      </TableCell>
                      <TableCell className="font-body py-3 px-4">
                        {submission.lastSeen ? format(new Date(submission.lastSeen), 'PP p') : 'N/A'}
                      </TableCell>
                      <TableCell className="font-body text-right py-3 px-4">
                        {submission.submittedAt ? format(new Date(submission.submittedAt), 'PP p') : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInitiateDelete(index)}
                          disabled={isSaving}
                          aria-label="Delete submission"
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-8 text-center">
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving || !hasUnsavedChanges}
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-md"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {deleteCandidateIndex !== null && (
          <AlertDialog open={deleteCandidateIndex !== null} onOpenChange={(open) => !open && setDeleteCandidateIndex(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will mark the submission for deletion. The deletion will be permanent once you click 'Save Changes'.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteCandidateIndex(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

      </main>
      <Footer />
    </div>
  );
}
    
