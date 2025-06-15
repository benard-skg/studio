
"use client";

import { useEffect, useState, useCallback } from 'react';
import { AlertCircle, Trash2, Eye, Loader2, CalendarPlus, Edit3, Save } from 'lucide-react'; 
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
import type { EventType as AppEventType } from '@/lib/types';
import { slugify } from '@/lib/utils';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, serverTimestamp } from 'firebase/firestore';

interface EventType extends AppEventType {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [currentEvent, setCurrentEvent] = useState<EventType | null>(null);
  const [eventToEdit, setEventToEdit] = useState<EventType | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventType | null>(null);

  const { toast } = useToast();

  const [formValues, setFormValues] = useState<Partial<EventType>>({
    title: '', date: '', startTime: '', endTime: '', type: 'class', description: '', detailsPageSlug: '',
  });

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const eventsCol = collection(db, "events");
      const q = query(eventsCol, orderBy("date", "desc"), orderBy("startTime", "asc"));
      const eventsSnapshot = await getDocs(q);
      const eventsList = eventsSnapshot.docs.map(docSnap => ({ 
        id: docSnap.id,
        ...docSnap.data()
      } as EventType));
      setEvents(eventsList);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to fetch events. Please try again later.");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
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
    setEventToEdit(null);
    setFormValues({
      title: '', date: '', startTime: '', endTime: '', type: 'class', description: '', detailsPageSlug: ''
    });
    setIsAddEditDialogOpen(true);
  };

  const openEditDialog = (event: EventType) => {
    setEventToEdit(event);
    setFormValues({
        ...event,
        date: event.date ? format(parseISO(event.date), 'yyyy-MM-dd') : ''
    });
    setIsAddEditDialogOpen(true);
  };

  const openViewDialog = (event: EventType) => {
    setCurrentEvent(event);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (event: EventType) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    setIsSubmitting(true);
    setError(null);

    if (!formValues.title || !formValues.date || !formValues.startTime || !formValues.type) {
        toast({ variant: "destructive", title: "Validation Error", description: "Title, Date, Start Time, and Type are required." });
        setIsSubmitting(false);
        return;
    }
    
    const eventData: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'> & { updatedAt: any, createdAt?: any } = {
        title: formValues.title!,
        date: formValues.date!,
        startTime: formValues.startTime!,
        endTime: formValues.endTime || '',
        type: formValues.type as EventType['type'],
        description: formValues.description || '',
        detailsPageSlug: formValues.detailsPageSlug || slugify(formValues.title!),
        updatedAt: serverTimestamp(),
    };

    try {
        if (eventToEdit) {
            const eventDocRef = doc(db, "events", eventToEdit.id);
            await updateDoc(eventDocRef, eventData);
            toast({ title: "Event Updated", description: `Event "${eventData.title}" has been updated.` });
        } else {
            (eventData as any).createdAt = serverTimestamp();
            await addDoc(collection(db, "events"), eventData);
            toast({ title: "Event Added", description: `Event "${eventData.title}" has been added.` });
        }
        setIsAddEditDialogOpen(false);
        setEventToEdit(null);
        fetchEvents();
    } catch (err) {
        console.error("Error saving event:", err);
        setError("Failed to save event. Please try again.");
        toast({ variant: "destructive", title: "Save Error", description: "Could not save the event." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteDoc(doc(db, "events", eventToDelete.id));
      toast({ title: "Event Deleted", description: `Event "${eventToDelete.title}" has been deleted.` });
      fetchEvents();
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event. Please try again.");
      toast({ variant: "destructive", title: "Delete Error", description: "Could not delete the event." });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDateForDisplay = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, "MMM dd, yyyy") : 'Invalid Date';
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
          <Button onClick={openAddDialog} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <CalendarPlus className="mr-2 h-5 w-5" /> Add New Event
          </Button>
        </header>

        {isLoading && (
            <div className="flex justify-center py-10"><Loader2 className="h-10 w-10 animate-spin text-accent"/></div>
        )}
        {!isLoading && error && (
            <div className="my-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center justify-center">
                <AlertCircle className="h-5 w-5 mr-3" /> {error}
            </div>
        )}
        {!isLoading && !error && events.length === 0 && (
             <div className="mt-8 flex flex-col items-center justify-center py-10 bg-card border border-border text-foreground p-6 rounded-lg shadow-md">
                <CalendarPlus className="h-10 w-10 mb-3 text-muted-foreground" />
                <p className="font-headline text-2xl font-extrabold tracking-tighter mb-2">No Events Found</p>
                <p className="font-body text-center text-muted-foreground">
                Click "Add New Event" to get started.
                </p>
            </div>
        )}

        {!isLoading && !error && events.length > 0 && (
            <div className="bg-card shadow-md rounded-lg overflow-hidden border border-border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="font-body w-[120px]">Date</TableHead>
                    <TableHead className="font-body w-[100px]">Time</TableHead>
                    <TableHead className="font-body">Title</TableHead>
                    <TableHead className="font-body hidden md:table-cell w-[100px]">Type</TableHead>
                    <TableHead className="font-body text-right w-[120px]">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {events.map((event) => (
                    <TableRow key={event.id}>
                    <TableCell className="font-body text-xs sm:text-sm">{formatDateForDisplay(event.date)}</TableCell>
                    <TableCell className="font-body text-xs sm:text-sm">{event.startTime}{event.endTime ? ` - ${event.endTime}`: ''}</TableCell>
                    <TableCell className="font-body font-medium">{event.title}</TableCell>
                    <TableCell className="font-body hidden md:table-cell capitalize">{event.type}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex space-x-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openViewDialog(event)} title="View Event">
                            <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)} title="Edit Event">
                            <Edit3 className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(event)} title="Delete Event">
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

      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline font-extrabold tracking-tighter">{eventToEdit ? "Edit Event" : "Add New Event"}</DialogTitle>
            <DialogDescription>
              {eventToEdit ? "Modify the details of the existing event." : "Fill in the details to create a new event."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right font-body">Title</Label>
              <Input id="title" name="title" value={formValues.title || ''} onChange={handleInputChange} className="col-span-3 font-body" disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right font-body">Date</Label>
              <Input id="date" name="date" type="date" value={formValues.date || ''} onChange={handleInputChange} className="col-span-3 font-body" disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right font-body">Start Time</Label>
                <Input id="startTime" name="startTime" type="time" value={formValues.startTime || ''} onChange={handleInputChange} className="col-span-3 font-body" disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right font-body">End Time</Label>
                <Input id="endTime" name="endTime" type="time" value={formValues.endTime || ''} onChange={handleInputChange} className="col-span-3 font-body" disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right font-body">Type</Label>
                <Select name="type" onValueChange={handleSelectChange} value={formValues.type || 'class'} disabled={isSubmitting}>
                  <SelectTrigger className="col-span-3 font-body">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="stream">Stream</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="special">Special Event</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right font-body">Description</Label>
                <Textarea id="description" name="description" value={formValues.description || ''} onChange={handleInputChange} className="col-span-3 font-body" disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="detailsPageSlug" className="text-right font-body">Slug</Label>
                <Input id="detailsPageSlug" name="detailsPageSlug" value={formValues.detailsPageSlug || ''} readOnly className="col-span-3 font-body bg-muted" disabled={isSubmitting} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveEvent} disabled={isSubmitting} className="bg-accent hover:bg-accent/90">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Saving...' : (eventToEdit ? 'Save Changes' : 'Add Event')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentEvent && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline font-extrabold tracking-tighter">{currentEvent.title}</DialogTitle>
              <DialogDescription className="font-body text-xs">
                Event ID: {currentEvent.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 font-body text-sm max-h-[60vh] overflow-y-auto">
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
              {currentEvent.createdAt && <p className="text-xs text-muted-foreground">Created: {format(currentEvent.createdAt.toDate(), "MMM dd, yyyy, HH:mm")}</p>}
              {currentEvent.updatedAt && <p className="text-xs text-muted-foreground">Last Updated: {format(currentEvent.updatedAt.toDate(), "MMM dd, yyyy, HH:mm")}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {eventToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline font-extrabold tracking-tighter">Delete Event?</AlertDialogTitle>
              <AlertDialogDescription className="font-body">
                Are you sure you want to delete the event "<strong>{eventToDelete.title}</strong>"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEvent}
                disabled={isSubmitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                 {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                 {isSubmitting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
