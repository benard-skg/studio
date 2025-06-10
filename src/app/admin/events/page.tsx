
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

const JSONBIN_API_BASE = "https://api.jsonbin.io/v3/b";
const ACCESS_KEY = "$2a$10$3Fh5hpLyq/Ou/V/O78u8xurtpTG6XomBJ7CqijLm3YgGX4LC3SFZy";
const BIN_ID = "6847dd9e8a456b7966aba67c";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true); // Assume configured with hardcoded keys

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [currentEvent, setCurrentEvent] = useState<EventType | null>(null);
  const [eventToEdit, setEventToEdit] = useState<Partial<EventType> | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventType | null>(null);

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

  const fetchEvents = useCallback(async () => {
    // No need to check for ACCESS_KEY or BIN_ID as they are hardcoded
    // but keep the structure for potential future re-enablement of env vars
    if (!ACCESS_KEY || !BIN_ID) {
      setError("JSONBin.io Access Key or Events Bin ID is not configured (hardcoded).");
      setIsConfigured(false); // This state might not be strictly necessary with hardcoding
      setIsLoading(false);
      return;
    }
    setIsConfigured(true);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${JSONBIN_API_BASE}/${BIN_ID}/latest`, {
        method: 'GET',
        headers: { 'X-Access-Key': ACCESS_KEY! },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch events. Status: ${response.status}. ${errorData}`);
      }
      const data = await response.json();
      const fetchedEvents = (Array.isArray(data.record) ? data.record : [])
        .filter((event: any) => event && event.id && event.title && event.date && event.startTime && event.type && event.detailsPageSlug)
        .sort((a: EventType, b: EventType) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.startTime.localeCompare(b.startTime));
      setEvents(fetchedEvents);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred while fetching events.");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array as ACCESS_KEY and BIN_ID are constants now

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
    setFormValues(prev => ({ ...prev, type: value }));
  };
  
  const openAddDialog = () => {
    setEventToEdit(null); // Clear any previous edit state
    setFormValues({
      title: '', date: '', startTime: '', endTime: '', type: 'class', description: '', detailsPageSlug: ''
    });
    setIsAddEditDialogOpen(true);
  };

  const openEditDialog = (event: EventType) => {
    setEventToEdit(event);
    setFormValues({
      id: event.id,
      title: event.title,
      date: event.date, 
      startTime: event.startTime,
      endTime: event.endTime || '',
      type: event.type,
      description: event.description || '',
      detailsPageSlug: event.detailsPageSlug,
    });
    setIsAddEditDialogOpen(true);
  };


  const handleSaveEvent = async () => {
    if (!formValues.title || !formValues.date || !formValues.startTime || !formValues.type || !formValues.detailsPageSlug) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please fill in all required fields." });
      return;
    }
    if (!isValid(parseISO(formValues.date))) {
        toast({ variant: "destructive", title: "Invalid Date", description: "Please enter a valid date in YYYY-MM-DD format." });
        return;
    }

    setIsLoading(true);
    const newEventData: EventType = {
      id: eventToEdit?.id || `event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: formValues.title!,
      date: formValues.date!,
      startTime: formValues.startTime!,
      endTime: formValues.endTime || undefined,
      type: formValues.type!,
      description: formValues.description || undefined,
      detailsPageSlug: formValues.detailsPageSlug!,
    };

    try {
      const currentEventsResponse = await fetch(`${JSONBIN_API_BASE}/${BIN_ID}/latest`, {
        headers: { 'X-Access-Key': ACCESS_KEY! },
      });
      let currentEventsList: EventType[] = [];
      if (currentEventsResponse.ok) {
        const data = await currentEventsResponse.json();
        currentEventsList = (Array.isArray(data.record) ? data.record : [])
          .filter((event: any) => event && event.id && event.title && event.date);
      } else if (currentEventsResponse.status !== 404) {
        throw new Error('Failed to fetch current events before saving.');
      }
      
      let updatedEventsList: EventType[];
      if (eventToEdit) { 
        updatedEventsList = currentEventsList.map(ev => ev.id === newEventData.id ? newEventData : ev);
      } else { 
        updatedEventsList = [...currentEventsList, newEventData];
      }
      
      const response = await fetch(`${JSONBIN_API_BASE}/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': ACCESS_KEY!,
          'X-Bin-Versioning': 'false',
        },
        body: JSON.stringify(updatedEventsList),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to save event. Status: ${response.status}. ${errorData}`);
      }
      toast({ title: eventToEdit ? "Event Updated!" : "Event Added!", description: `Event "${newEventData.title}" has been saved.` });
      setIsAddEditDialogOpen(false);
      setEventToEdit(null);
      fetchEvents(); 
    } catch (e: any) {
      setError(e.message || "An error occurred while saving the event.");
      toast({ variant: "destructive", title: "Save Error", description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsLoading(true);
    try {
       const currentEventsResponse = await fetch(`${JSONBIN_API_BASE}/${BIN_ID}/latest`, {
        headers: { 'X-Access-Key': ACCESS_KEY! },
      });
      let currentEventsList: EventType[] = [];
      if (currentEventsResponse.ok) {
        const data = await currentEventsResponse.json();
        currentEventsList = (Array.isArray(data.record) ? data.record : [])
         .filter((event: any) => event && event.id && event.title && event.date);
      } else {
        throw new Error('Failed to fetch current events before deleting.');
      }

      const updatedEvents = currentEventsList.filter(event => event.id !== eventToDelete.id);
      const response = await fetch(`${JSONBIN_API_BASE}/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': ACCESS_KEY!,
          'X-Bin-Versioning': 'false',
        },
        body: JSON.stringify(updatedEvents),
      });
      if (!response.ok) throw new Error('Failed to delete event.');
      toast({ title: "Event Deleted!", description: `Event "${eventToDelete.title}" has been removed.` });
      fetchEvents();
    } catch (e: any) {
      setError(e.message || "An error occurred while deleting the event.");
      toast({ variant: "destructive", title: "Delete Error", description: e.message });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
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

  // Configuration error for hardcoded keys isn't relevant in the same way,
  // but we keep the structure for if user wants to re-enable env vars.
  if (!isConfigured && (!ACCESS_KEY || !BIN_ID) ) { // Only show if hardcoded values were somehow missing/empty
     return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow pt-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <header className="mb-6 text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold">Admin - Manage Events</h1>
          </header>
          <div className="flex flex-col items-center justify-center py-10 bg-card border border-destructive text-destructive p-6 rounded-lg shadow-md">
            <AlertCircle className="h-10 w-10 mb-3" />
            <p className="font-headline text-2xl mb-2">Configuration Error</p>
            <p className="font-body text-center">{error || "JSONBin.io keys are missing (hardcoded check)."}</p>
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
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight text-center sm:text-left mb-4 sm:mb-0">
            Manage Events
          </h1>
          <Button onClick={openAddDialog} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <CalendarPlus className="mr-2 h-5 w-5" /> Add New Event
          </Button>
        </header>

        {isLoading && !events.length && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="ml-3 font-body">Loading events...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-10 bg-card border border-destructive text-destructive p-6 rounded-lg shadow-md">
            <AlertCircle className="h-10 w-10 mb-3" />
            <p className="font-headline text-2xl mb-2">Error Loading Events</p>
            <p className="font-body text-center">{error}</p>
            <Button onClick={fetchEvents} className="mt-4">Try Again</Button>
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 bg-card border border-border text-foreground p-6 rounded-lg shadow-md">
            <CalendarPlus className="h-10 w-10 mb-3 text-muted-foreground" />
            <p className="font-headline text-2xl mb-2">No Events Found</p>
            <p className="font-body text-center text-muted-foreground">
              Click "Add New Event" to create your first calendar event.
            </p>
          </div>
        )}

        {!isLoading && !error && events.length > 0 && (
          <div className="bg-card shadow-md rounded-lg overflow-hidden border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-headline">Date</TableHead>
                  <TableHead className="font-headline">Time</TableHead>
                  <TableHead className="font-headline">Title</TableHead>
                  <TableHead className="font-headline hidden md:table-cell">Type</TableHead>
                  <TableHead className="font-headline text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-body text-sm">
                      {formatDateForDisplay(event.date)}
                    </TableCell>
                    <TableCell className="font-body text-sm">{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</TableCell>
                    <TableCell className="font-body font-medium">{event.title}</TableCell>
                    <TableCell className="font-body hidden md:table-cell capitalize">{event.type}</TableCell>
                    <TableCell className="text-right space-x-1">
                       <Button variant="ghost" size="icon" onClick={() => { setCurrentEvent(event); setIsViewDialogOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setEventToDelete(event); setIsDeleteDialogOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      <Footer />

      {/* Add/Edit Event Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{eventToEdit ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>
              {eventToEdit ? 'Update the details for this event.' : 'Fill in the details to create a new calendar event.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right font-body">Title</Label>
              <Input id="title" name="title" value={formValues.title || ''} onChange={handleInputChange} className="col-span-3 font-body" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right font-body">Date</Label>
              <Input id="date" name="date" type="date" value={formValues.date || ''} onChange={handleInputChange} className="col-span-3 font-body" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right font-body">Start Time</Label>
              <Input id="startTime" name="startTime" type="time" value={formValues.startTime || ''} onChange={handleInputChange} className="col-span-3 font-body" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right font-body">End Time (Opt)</Label>
              <Input id="endTime" name="endTime" type="time" value={formValues.endTime || ''} onChange={handleInputChange} className="col-span-3 font-body" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right font-body">Type</Label>
              <Select name="type" value={formValues.type || 'class'} onValueChange={handleSelectChange}>
                <SelectTrigger className="col-span-3 font-body">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="stream">Stream</SelectItem>
                  <SelectItem value="tournament">Tournament</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right font-body">Description (Opt)</Label>
              <Textarea id="description" name="description" value={formValues.description || ''} onChange={handleInputChange} className="col-span-3 font-body" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="detailsPageSlug" className="text-right font-body">Slug</Label>
              <Input id="detailsPageSlug" name="detailsPageSlug" value={formValues.detailsPageSlug || ''} onChange={handleInputChange} className="col-span-3 font-body" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveEvent} disabled={isLoading} className="bg-accent hover:bg-accent/90">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {eventToEdit ? 'Save Changes' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      {currentEvent && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline">{currentEvent.title}</DialogTitle>
              <DialogDescription>Details of the selected event.</DialogDescription>
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

      {/* Delete Confirmation Dialog */}
      {eventToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the event: <strong className="font-medium">{eventToDelete.title}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEvent}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Event
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
