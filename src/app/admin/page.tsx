
"use client";

import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { useEffect, useState, useCallback } from 'react';
import { AlertCircle, Loader2, Mail, Eye, Trash2 } from 'lucide-react'; 
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns'; 
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, doc, deleteDoc, Timestamp } from 'firebase/firestore';

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: Timestamp;
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<Submission | null>(null);
  
  const { toast } = useToast();

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const submissionsCol = collection(db, "contactSubmissions");
      const q = query(submissionsCol, orderBy("submittedAt", "desc"));
      const submissionsSnapshot = await getDocs(q);
      const submissionsList = submissionsSnapshot.docs.map(docSnap => ({ 
        id: docSnap.id,
        ...docSnap.data()
      } as Submission));
      setSubmissions(submissionsList);
    } catch (err) {
      console.error("Error fetching contact submissions:", err);
      setError("Failed to fetch contact submissions. Please try again later.");
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions(); 
  }, [fetchSubmissions]);

  const openViewDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (submission: Submission) => {
    setSubmissionToDelete(submission);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "contactSubmissions", submissionToDelete.id));
      toast({
        title: "Submission Deleted",
        description: `Submission from ${submissionToDelete.name} has been deleted.`,
      });
      setSubmissions(prev => prev.filter(s => s.id !== submissionToDelete.id));
      setIsDeleteDialogOpen(false);
      setSubmissionToDelete(null);
    } catch (err) {
      console.error("Error deleting submission:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the submission. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (timestamp: Timestamp | undefined | null) => {
    if (!timestamp) return 'N/A';
    try {
      return format(timestamp.toDate(), "MMM dd, yyyy 'at' hh:mm a");
    } catch (e) {
      return 'Invalid Date';
    }
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
            <p className="font-headline text-2xl font-extrabold tracking-tighter mb-2">Error</p>
            <p className="font-body text-center">{error}</p>
          </div>
        )}

        {!isLoading && !error && submissions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 bg-card border border-border text-foreground p-6 rounded-lg shadow-md">
            <Mail className="h-10 w-10 mb-3 text-muted-foreground" />
            <p className="font-headline text-2xl font-extrabold tracking-tighter mb-2">No Submissions Yet</p>
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
                  <TableHead className="font-body">Date</TableHead>
                  <TableHead className="font-body">Name</TableHead>
                  <TableHead className="font-body hidden md:table-cell">Email</TableHead>
                  <TableHead className="font-body">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-body text-xs sm:text-sm">{formatDate(submission.submittedAt)}</TableCell>
                    <TableCell className="font-body font-medium">{submission.name}</TableCell>
                    <TableCell className="font-body hidden md:table-cell">{submission.email}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openViewDialog(submission)} title="View Submission">
                          <Eye className="h-4 w-4 text-accent" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(submission)} title="Delete Submission">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
              <AlertDialogTitle className="font-headline font-extrabold tracking-tighter">Submission from {selectedSubmission.name}</AlertDialogTitle>
              <AlertDialogDescription className="font-body text-xs">
                Received: {formatDate(selectedSubmission.submittedAt)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
              <p className="font-body"><strong>Name:</strong> {selectedSubmission.name}</p>
              <p className="font-body"><strong>Email:</strong> {selectedSubmission.email}</p>
              <div>
                <strong className="font-body">Message:</strong>
                <div className="mt-1 p-2 bg-muted rounded-md text-sm font-body">
                  {selectedSubmission.message.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
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

      {submissionToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline font-extrabold tracking-tighter">Delete Submission?</AlertDialogTitle>
              <AlertDialogDescription className="font-body">
                Are you sure you want to delete the submission from <strong>{submissionToDelete.name}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSubmission}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
