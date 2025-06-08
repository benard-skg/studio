
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
import { AlertCircle, Square, CheckSquare, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';

interface Submission {
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  seen?: boolean;
  lastSeen?: string;
}

const MASTER_KEY = "$2a$10$7xhu0Fd2a/Cpg75U5hPseOEk1jdgrzJOktPZRjkZZ9k4ps8RBj2/S";
const BIN_ID = "68407aa98561e97a501fa67b";
const JSONBIN_API_BASE = "https://api.jsonbin.io/v3/b";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedTime, setLastLoadedTime] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${JSONBIN_API_BASE}/${BIN_ID}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': MASTER_KEY,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Failed to fetch submissions:", response.status, errorData);
        throw new Error(`Failed to fetch submissions. Status: ${response.status}`);
      }

      const responseData = await response.json();
      
      let submissionsArray: Submission[] = [];
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
      const initializedSubmissions = submissionsArray.map(sub => ({
        ...sub,
        seen: sub.seen || false,
        lastSeen: sub.lastSeen,
      }));
      setSubmissions(initializedSubmissions);
      setLastLoadedTime(format(new Date(), "PPP p"));

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred fetching submissions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const persistSubmissions = async (updatedSubmissions: Submission[]) => {
    setIsSaving(true);
    try {
      const putResponse = await fetch(`${JSONBIN_API_BASE}/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY,
          'X-Bin-Versioning': 'false', 
        },
        body: JSON.stringify(updatedSubmissions),
      });

      if (putResponse.ok) {
        toast({
          title: "Update Successful",
          description: "Submission status saved to JSONBin.io.",
        });
        // Optionally re-fetch or just trust the local state if PUT is source of truth now
        // For simplicity, we'll trust local state is in sync after successful PUT
        setSubmissions(updatedSubmissions); // Ensure local state matches persisted state
        setLastLoadedTime(format(new Date(), "PPP p")); // Update last loaded time as data changed
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
      // Optionally, revert local state to before the failed save attempt by re-fetching
      // fetchSubmissions(); // This would revert optimistic update
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSeen = async (index: number) => {
    // Create the new state based on the previous state
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
    
    // Optimistically update UI
    setSubmissions(newSubmissions);
    
    // Then persist this new state
    await persistSubmissions(newSubmissions);
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

        {lastLoadedTime && !isLoading && (
          <div className="mb-6 text-center">
            <p className="font-headline font-bold text-xl md:text-2xl text-foreground">
              Data last updated: {lastLoadedTime}
            </p>
          </div>
        )}
        {isLoading && !lastLoadedTime && (
           <div className="mb-6 text-center">
            <Skeleton className="h-8 w-1/2 mx-auto" />
          </div>
        )}

        {isLoading && (
          <div className="shadow-xl rounded-lg overflow-hidden border border-border bg-card">
            <Table>
              <TableCaption className="py-4 font-body text-sm text-muted-foreground bg-card border-t border-border">
                <Skeleton className="h-4 w-1/3 mx-auto" />
              </TableCaption>
              <TableHeader className="bg-card/50">
                <TableRow>
                  <TableHead className="font-headline text-card-foreground w-[5%]"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="font-headline text-card-foreground w-[15%]"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="font-headline text-card-foreground w-[20%]"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="font-headline text-card-foreground w-[30%]"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="font-headline text-card-foreground w-[15%]"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="font-headline text-card-foreground text-right w-[15%]"><Skeleton className="h-5 w-full" /></TableHead>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-10 bg-destructive/10 border border-destructive text-destructive p-6 rounded-lg shadow-md">
            <AlertCircle className="h-10 w-10 mb-3" />
            <p className="font-headline text-2xl mb-2">Error Fetching Data</p>
            <p className="font-body text-center">{error}</p>
            <Button onClick={fetchSubmissions} variant="destructive" className="mt-4">
              Retry Fetch
            </Button>
          </div>
        )}

        {!isLoading && !error && submissions.length === 0 && (
          <div className="text-center py-12">
            <p className="font-body text-xl text-muted-foreground">No submissions found.</p>
          </div>
        )}

        {!isLoading && !error && submissions.length > 0 && (
          <div className="shadow-xl rounded-lg overflow-hidden border border-border bg-card">
            <Table>
              <TableCaption className="py-4 font-body text-sm text-muted-foreground bg-card border-t border-border">
                A list of contact form submissions ({submissions.length} entries).
              </TableCaption>
              <TableHeader className="bg-card/50">
                <TableRow>
                  <TableHead className="font-headline text-card-foreground w-[5%] text-center">Seen</TableHead>
                  <TableHead className="font-headline text-card-foreground w-[15%]">Name</TableHead>
                  <TableHead className="font-headline text-card-foreground w-[20%]">Email</TableHead>
                  <TableHead className="font-headline text-card-foreground w-[30%]">Message</TableHead>
                  <TableHead className="font-headline text-card-foreground w-[15%]">Last Seen</TableHead>
                  <TableHead className="font-headline text-card-foreground text-right w-[15%]">Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission, index) => (
                  <TableRow key={index} className="hover:bg-muted/20 border-b border-border last:border-b-0">
                    <TableCell className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleSeen(index)}
                        aria-label={submission.seen ? "Mark as unseen" : "Mark as seen"}
                        className="p-1 rounded-md hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSaving}
                      >
                        {submission.seen ? (
                          <CheckSquare className="h-5 w-5 text-accent" />
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
