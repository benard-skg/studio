
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
import { Loader2, AlertCircle } from 'lucide-react';

interface Submission {
  name: string;
  email: string;
  message: string;
  submittedAt: string; 
}

const MASTER_KEY = "$2a$10$7xhu0Fd2a/Cpg75U5hPseOEk1jdgrzJOktPZRjkZZ9k4ps8RBj2/S";
const BIN_ID = "68407aa98561e97a501fa67b";
const JSONBIN_API_BASE = "https://api.jsonbin.io/v3/b";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${JSONBIN_API_BASE}/${BIN_ID}/latest`, {
          method: 'GET',
          headers: {
            'X-Master-Key': MASTER_KEY,
            // 'X-Bin-Meta': 'false', // Add this if you only want the raw data without metadata wrapper
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Failed to fetch submissions:", response.status, errorData);
          throw new Error(`Failed to fetch submissions. Status: ${response.status}`);
        }

        const responseData = await response.json();
        
        // Determine where the array of submissions is located in the response
        // If contact form PUTs an array, /latest often returns the array directly.
        // If JSONBin wraps it in a 'record' property (e.g. for older bins or certain operations):
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
        setSubmissions(submissionsArray);

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An unknown error occurred fetching submissions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-10 text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
            Admin - Contact Submissions
          </h1>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Viewing data directly from JSONBin.io.
          </p>
        </header>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="ml-4 font-body text-xl">Loading submissions...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-10 bg-destructive/10 border border-destructive text-destructive p-6 rounded-lg shadow-md">
            <AlertCircle className="h-10 w-10 mb-3" />
            <p className="font-headline text-2xl mb-2">Error Fetching Data</p>
            <p className="font-body text-center">{error}</p>
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
                  <TableHead className="font-headline text-card-foreground w-[15%]">Name</TableHead>
                  <TableHead className="font-headline text-card-foreground w-[20%]">Email</TableHead>
                  <TableHead className="font-headline text-card-foreground w-[45%]">Message</TableHead>
                  <TableHead className="font-headline text-card-foreground text-right w-[20%]">Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission, index) => (
                  <TableRow key={index} className="hover:bg-muted/20 border-b border-border last:border-b-0">
                    <TableCell className="font-body font-medium py-3 px-4">{submission.name}</TableCell>
                    <TableCell className="font-body py-3 px-4">{submission.email}</TableCell>
                    <TableCell className="font-body py-3 px-4 max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl truncate hover:whitespace-normal hover:overflow-visible" title={submission.message}>
                        {submission.message}
                    </TableCell>
                    <TableCell className="font-body text-right py-3 px-4">
                      {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
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
