
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Trash2, Eye, PlusCircle, Loader2, CalendarPlus, Edit3, Save } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';
import type { EventType } from '@/lib/types';
import { slugify } from '@/lib/utils';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Skeleton } from '@/components/ui/skeleton';

// JSONBin.io configuration removed

const PageContentSkeleton = () => (
  <>
    <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
      <Skeleton className="h-10 w-2/5 sm:w-1/3 mb-4 sm:mb-0" />
      <Skeleton className="h-10 w-48 rounded-md" />
    </header>
    <div className="bg-card shadow-md rounded-lg overflow-hidden border border-border">
      <div className="p-4 sm:p-6">
        <div className="hidden sm:flex justify-between items-center pb-3 border-b border-border mb-3">
          <Skeleton className="h-5 w-1/6" /> <Skeleton className="h-5 w-1/6" /> <Skeleton className="h-5 w-2/6" /> <Skeleton className="h-5 w-1/6" /> <Skeleton className="h-5 w-1/12" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-border last:border-b-0">
            <div className="w-full sm:w-1/6 mb-2 sm:mb-0"><Skeleton className="h-4 w-3/4 sm:w-full" /></div>
            <div className="w-full sm:w-1/6 mb-2 sm:mb-0"><Skeleton className="h-4 w-1/2 sm:w-full" /></div>
            <div className="w-full sm:w-2/6 mb-2 sm:mb-0"><Skeleton className="h-4 w-full" /></div>
            <div className="w-full sm:w-1/6 mb-2 sm:mb-0"><Skeleton className="h-4 w-2/3 sm:w-full hidden md:block" /></div>
            <div className="flex space-x-1 w-full sm:w-auto justify-end sm:justify-start">
              <Skeleton className="h-8 w-8 rounded-md" /> <Skeleton className="h-8 w-8 rounded-md" /> <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="mt-8 flex flex-col items-center justify-center py-10 bg-card border border-border text-foreground p-6 rounded-lg shadow-md">
        <Skeleton className="h-10 w-10 rounded-full mb-3" />
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/2" />
    </div>
  </>
);


export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Default to false as no initial fetch
  const [error, setError] = useState<string | null>("Event management is currently disabled. JSONBin.io integration removed.");

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [currentEvent, setCurrentEvent] = useState<EventType | null>(null);
  // const [eventToEdit, setEventToEdit] = useState<Partial<EventType> | null>(null); // Logic removed
  // const [eventToDelete, setEventToDelete] = useState<EventType | null>(null); // Logic removed

  const { toast } = useToast();
  const router = useRouter();

  const [formValues, setFormValues] = useState<Partial<EventType>>({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'class',
    description: '',
    detailsPageSlug: '',
  });

  // fetchEvents removed as JSONBin.io integration is removed
  const fetchEvents = useCallback(async () => {
    setIsLoading(false);
    setEvents([]); // No events to fetch
    // setError("Event fetching is disabled."); // Already set initially
  }, []);

  useEffect(() => {
    fetchEvents(); // Call it to set initial state, though it does nothing now
  }, [fetchEvents]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    if (name === 'title') {
      setFormValues(prev => ({ ...prev, detailsPageSlug: slugify(value) }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormValues(prev => ({ ...prev, type: value as EventType['type'] }));
  };
  
  const openAddDialog = () => {
    // setEventToEdit(null); // Editing logic removed
    setFormValues({
      title: '', date: '', startTime: '', endTime: '', type: 'class', description: '', detailsPageSlug: ''
    });
    setIsAddEditDialogOpen(true);
  };

  const openEditDialog = (event: EventType) => {
    // Editing logic tied to JSONBin, so this will effectively just show details
    toast({ variant: "default", title: "Info", description: "Event editing is currently disabled." });
    setCurrentEvent(event); // Can still view
    setIsViewDialogOpen(true); 
    // setEventToEdit(event);
    // setFormValues({ /* ... */ });
    // setIsAddEditDialogOpen(true);
  };


  const handleSaveEvent = async () => {
    toast({ variant: "destructive", title: "Disabled", description: "Saving events is currently disabled." });
    setIsLoading(false);
    setIsAddEditDialogOpen(false);
  };

  const handleDeleteEvent = async () => {
    toast({ variant: "destructive", title: "Disabled", description: "Deleting events is currently disabled." });
    setIsLoading(false);
    setIsDeleteDialogOpen(false);
    // setEventToDelete(null);
  };
  
  const formatDateForDisplay = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid Date';
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight text-center sm:text-left mb-4 sm:mb-0">
            Manage Events
          </h1>
          <Button onClick={openAddDialog} className="bg-accent text-accent-foreground hover:bg-accent/90" disabled>
            <CalendarPlus className="mr-2 h-5 w-5" /> Add New Event (Disabled)
          </Button>
        </header>

        <div className="flex flex-col items-center justify-center py-10 bg-card border border-border text-foreground p-6 rounded-lg shadow-md">
            <AlertCircle className="h-10 w-10 mb-3 text-muted-foreground" />
            <p className="font-headline text-2xl mb-2">Event Management Disabled</p>
            <p className="font-body text-center text-muted-foreground">
              {error || "This feature is currently not available."}
            </p>
        </div>

        {/* Table display logic removed as there will be no events from JSONBin */}
        
      </main>
      <Footer />

      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Add/Edit Event (Disabled)</DialogTitle>
            <DialogDescription>
              Event creation and editing are currently disabled.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Form fields can remain for UI structure but submit is disabled */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right font-body">Title</Label>
              <Input id="title" name="title" value={formValues.title || ''} onChange={handleInputChange} className="col-span-3 font-body" disabled />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right font-body">Date</Label>
              <Input id="date" name="date" type="date" value={formValues.date || ''} onChange={handleInputChange} className="col-span-3 font-body" disabled />
            </div>
             {/* ... other form fields, also disabled ... */}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveEvent} disabled className="bg-accent hover:bg-accent/90">
              <Save className="mr-2 h-4 w-4" /> Save (Disabled)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentEvent && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline">{currentEvent.title}</DialogTitle>
              <DialogDescription>Details of the selected event (Viewing only).</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 font-body text-sm">
              <p><strong>Date:</strong> {formatDateForDisplay(currentEvent.date)}</p>
              <p><strong>Time:</strong> {currentEvent.startTime}{currentEvent.endTime ? ` - ${currentEvent.endTime}` : ''}</p>
              <p><strong>Type:</strong> <span className="capitalize">{currentEvent.type}</span></p>
              <p><strong>Slug:</strong> {currentEvent.detailsPageSlug}</p>
              {currentEvent.description && (
                <div>
                  <strong>Description:</strong>
                  <div className="mt-1 p-2 bg-muted rounded-md max-h-40 overflow-y-auto">
                    {currentEvent.description.split('\n').map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))}
                  </div>
                </div>
              )}
               <p><strong>ID:</strong> {currentEvent.id}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* AlertDialog for delete removed as delete functionality is disabled */}
    </div>
  );
}
