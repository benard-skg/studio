
"use client";

import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { useEffect, useState, useCallback } from 'react';
import { AlertCircle, Trash2, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Submission {
  name: string;
  email: string;
  message: string;
  submittedAt: string;
}

const JSONBIN_API_BASE = "https://api.jsonbin.io/v3/b";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const ACCESS_KEY = process.env.NEXT_PUBLIC_JSONBIN_ACCESS_KEY;
  const BIN_ID = process.env.NEXT_PUBLIC_JSONBIN_BIN_ID;

  const fetchSubmissions = useCallback(async () => {
    if (!ACCESS_KEY || ACCESS_KEY === 'YOUR_JSONBIN_ACCESS_KEY' || !BIN_ID || BIN_ID === 'YOUR_JSONBIN_BIN_ID') {
      setError("JSONBin.io Access Key or Bin ID is not configured. Please set them in .env.local and restart the server.");
      setIsConfigured(false);
      setIsLoading(false);
      console.warn("Admin page: JSONBin.io Access Key or Bin ID is not configured or is using placeholder values.");
      return;
    }
    setIsConfigured(true);
    setIsLoading(true);
    setError(null);

    try {
      console.log(`fetchSubmissions: Attempting to fetch with Access Key: ${ACCESS_KEY ? ACCESS_KEY.substring(0,5) + '...' : 'UNDEFINED'} and Bin ID: ${BIN_ID || 'UNDEFINED'}`);
      const response = await fetch(`${JSONBIN_API_BASE}/${BIN_ID}/latest`, {
        method: 'GET',
        headers: {
          'X-Access-Key': ACCESS_KEY!,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Failed to fetch submissions:", response.status, errorData);
        throw new Error(`Failed to fetch submissions. Status: ${response.status}`);
      }
      const data = await response.json();
      // Ensure data.record is an array, default to empty array if not or if it's an empty object
      const fetchedSubmissions = Array.isArray(data.record) ? data.record : (typeof data.record === 'object' && Object.keys(data.record).length === 0 ? [] : []);
      setSubmissions(fetchedSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
    } catch (e: any) {
      console.error("Error in fetchSubmissions:", e);
      setError(e.message || "An unknown error occurred while fetching submissions.");
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [ACCESS_KEY, BIN_ID]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);
  
  // Note: Deletion functionality is not re-implemented in this setup pass to keep it simple.
  // If you need deletion, we can add it in a subsequent step.

  if (!isConfigured) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-6 text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
              Admin - Contact Submissions
            </h1>
          </header>
          <div className="flex flex-col items-center justify-center py-10 bg-card border border-destructive text-destructive p-6 rounded-lg shadow-md">
            <AlertCircle className="h-10 w-10 mb-3" />
            <p className="font-headline text-2xl mb-2">Configuration Error</p>
            <p className="font-body text-center">
              {error || "JSONBin.io Access Key or Bin ID is not configured. Please set them in .env.local and restart the server."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }


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
            <p className="ml-3 font-body">Loading submissions...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-10 bg-card border border-destructive text-destructive p-6 rounded-lg shadow-md">
            <AlertCircle className="h-10 w-10 mb-3" />
            <p className="font-headline text-2xl mb-2">Error Loading Submissions</p>
            <p className="font-body text-center">
              {error}
            </p>
            <Button onClick={fetchSubmissions} className="mt-4">Try Again</Button>
          </div>
        )}

        {!isLoading && !error && submissions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 bg-card border border-border text-foreground p-6 rounded-lg shadow-md">
            <Mail className="h-10 w-10 mb-3 text-muted-foreground" />
            <p className="font-headline text-2xl mb-2">No Submissions Yet</p>
            <p className="font-body text-center text-muted-foreground">
              When users submit messages through the contact form, they will appear here.
            </p>
          </div>
        )}

        {!isLoading && !error && submissions.length > 0 && (
          <div className="bg-card shadow-md rounded-lg overflow-hidden border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-headline">Date</TableHead>
                  <TableHead className="font-headline">Name</TableHead>
                  <TableHead className="font-headline">Email</TableHead>
                  <TableHead className="font-headline hidden md:table-cell">Message (Preview)</TableHead>
                  <TableHead className="font-headline text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-body text-sm">
                      {format(new Date(submission.submittedAt), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-body font-medium">{submission.name}</TableCell>
                    <TableCell className="font-body">{submission.email}</TableCell>
                    <TableCell className="font-body hidden md:table-cell">{submission.message.substring(0, 50)}...</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedSubmission(submission); setIsViewDialogOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* Delete button placeholder - functionality not re-implemented yet */}
                      {/* 
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this submission.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteSubmission(index)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                      */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      <Footer />

      {selectedSubmission && (
        <AlertDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>View Submission</AlertDialogTitle>
              <AlertDialogDescription>
                Details of the message from {selectedSubmission.name}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3 py-4 font-body text-sm">
              <p><strong>Date:</strong> {format(new Date(selectedSubmission.submittedAt), "MMMM dd, yyyy 'at' HH:mm")}</p>
              <p><strong>Name:</strong> {selectedSubmission.name}</p>
              <p><strong>Email:</strong> {selectedSubmission.email}</p>
              <div>
                <strong>Message:</strong>
                <div className="mt-1 p-3 bg-muted rounded-md max-h-60 overflow-y-auto">
                  {selectedSubmission.message.split('\n').map((line, i) => (
                    <span key={i}>{line}<br/></span>
                  ))}
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsViewDialogOpen(false)}>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
