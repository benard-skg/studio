
"use client";

import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { useEffect, useState, useCallback } from 'react';
import { AlertCircle, Trash2, Eye, Loader2, Mail } from 'lucide-react'; // Added Mail
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
  AlertDialogTrigger, // Keep if you intend to add delete back
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
const ACCESS_KEY = "$2a$10$ruiuDJ8CZrmUGcZ/0T4oxupL/lYNqs2tnITLQ2KNt0NkhEDq.6CQG"; // Replaced placeholder
const BIN_ID = "YOUR_JSONBIN_CONTACT_SUBMISSIONS_BIN_ID_HERE"; // Placeholder for specific bin

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchSubmissions = useCallback(async () => {
    if (!ACCESS_KEY || ACCESS_KEY === '$2a$10$ruiuDJ8CZrmUGcZ/0T4oxupL/lYNqs2tnITLQ2KNt0NkhEDq.6CQG' || // Check against actual key if needed for "not configured" logic
        !BIN_ID || BIN_ID === 'YOUR_JSONBIN_CONTACT_SUBMISSIONS_BIN_ID_HERE' ) {
      setError("JSONBin.io Access Key or Contact Submissions Bin ID is not configured. Please set them appropriately.");
      setIsConfigured(false);
      setIsLoading(false);
      console.warn("Admin page: JSONBin.io Access Key or Bin ID for contact submissions is not configured or is using placeholder values.");
      return;
    }
    setIsConfigured(true);
    setIsLoading(true);
    setError(null);

    try {
      console.log(`fetchSubmissions: Attempting to fetch with Bin ID: ${BIN_ID || 'UNDEFINED'}`);
      const response = await fetch(`${JSONBIN_API_BASE}/${BIN_ID}/latest`, {
        method: 'GET',
        headers: {
          'X-Access-Key': ACCESS_KEY,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Failed to fetch submissions:", response.status, errorData);
        throw new Error(`Failed to fetch submissions. Status: ${response.status}`);
      }
      const data = await response.json();
      const fetchedSubmissions = Array.isArray(data.record) ? data.record : (typeof data.record === 'object' && Object.keys(data.record).length === 0 ? [] : []);
      setSubmissions(fetchedSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
    } catch (e: any) {
      console.error("Error in fetchSubmissions:", e);
      setError(e.message || "An unknown error occurred while fetching submissions.");
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [BIN_ID]); // ACCESS_KEY is now a constant, so not needed in deps array

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);
  

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
              {error || "JSONBin.io Access Key or Bin ID is not configured. Please set them appropriately."}
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
