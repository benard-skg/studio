
"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Trash2, BookOpen, Users, Target, CheckCircle, PlusCircle, Edit3 } from "lucide-react";
import type { LessonTopic, StoredLessonReport } from "@/lib/types";
import { commonLessonTopics } from "@/lib/types";
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { allCoachesData } from '@/components/sections/coach-profile-section';
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

const lessonReportSchema = z.object({
  studentName: z.string().min(1, "Student name is required").default(''),
  lessonDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date/time format."),
  coachName: z.string().min(1, "Coach name is required").default(''),
  ratingBefore: z.coerce.number().optional(),
  ratingAfter: z.coerce.number().optional(),
  topicCovered: z.string().min(1, "Topic covered is required").default(''),
  customTopic: z.string().optional(),
  gameExampleLinks: z.string().url("Must be a valid URL (e.g., Lichess, Chess.com analysis link)").optional().or(z.literal('')),
  keyConcepts: z.string().min(1, "Key concepts are required").default(''),
  strengths: z.string().min(1, "Strengths observed are required").default(''),
  areasToImprove: z.string().min(1, "Areas to improve are required").default(''),
  mistakesMade: z.string().min(1, "Common mistakes made are required").default(''),
  assignedPuzzles: z.string().optional(),
  practiceGames: z.string().optional(),
  readingVideos: z.string().url("Must be a valid URL for reading/video material").optional().or(z.literal('')),
  additionalNotes: z.string().optional(),
});

type LessonReportFormValues = z.infer<typeof lessonReportSchema>;

const LOCAL_STORAGE_KEY = "lessonReportDraft";

interface LessonReportFormProps {
  reportToEdit?: StoredLessonReport | null;
}

export default function LessonReportForm({ reportToEdit }: LessonReportFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedTopic, setSelectedTopic] = React.useState<string>(reportToEdit?.topicCovered || "");

  const form = useForm<LessonReportFormValues>({
    resolver: zodResolver(lessonReportSchema),
    defaultValues: {
      studentName: "",
      lessonDateTime: new Date().toISOString().substring(0, 16), // For datetime-local
      coachName: "",
      ratingBefore: undefined,
      ratingAfter: undefined,
      topicCovered: "",
      customTopic: "",
      keyConcepts: "",
      gameExampleLinks: "",
      strengths: "",
      areasToImprove: "",
      mistakesMade: "",
      assignedPuzzles: "",
      practiceGames: "",
      readingVideos: "",
      additionalNotes: "",
    },
  });

  React.useEffect(() => {
    if (reportToEdit) {
      // Destructure to separate Firestore-specific fields or fields not directly in form
      const { id, submittedAt, pgnFileUrl, pgnFilename, ...formDataToReset } = reportToEdit;
      
      // Format lessonDateTime for datetime-local input
      const lessonDT = formDataToReset.lessonDateTime 
        ? new Date(formDataToReset.lessonDateTime).toISOString().substring(0, 16) 
        : new Date().toISOString().substring(0, 16);

      form.reset({
        ...formDataToReset,
        lessonDateTime: lessonDT,
        // Ensure optional number fields are reset to undefined if null/undefined in source, not NaN
        ratingBefore: formDataToReset.ratingBefore ?? undefined,
        ratingAfter: formDataToReset.ratingAfter ?? undefined,
        // Ensure optional string fields are reset correctly
        gameExampleLinks: formDataToReset.gameExampleLinks ?? "",
        readingVideos: formDataToReset.readingVideos ?? "",
        additionalNotes: formDataToReset.additionalNotes ?? "",
        customTopic: formDataToReset.customTopic ?? "",
        assignedPuzzles: formDataToReset.assignedPuzzles ?? "",
        practiceGames: formDataToReset.practiceGames ?? "",

      });
      if (formDataToReset.topicCovered) {
        setSelectedTopic(formDataToReset.topicCovered);
      }
      // Clear draft from local storage when editing an existing report
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      // Load draft from local storage if creating a new report
      const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          form.reset(parsedDraft);
          if (parsedDraft.topicCovered) {
            setSelectedTopic(parsedDraft.topicCovered);
          }
        } catch (error) {
          console.error("Failed to parse lesson report draft from localStorage", error);
          localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted draft
        }
      }
    }
  }, [reportToEdit, form]);

  // Save draft to local storage when creating a new report
  React.useEffect(() => {
    if (!reportToEdit) { // Only save draft if it's a new report
      const subscription = form.watch((values) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values));
      });
      return () => subscription.unsubscribe();
    }
  }, [form, reportToEdit]);


  async function onSubmit(values: LessonReportFormValues) {
    setIsSubmitting(true);
    
    const dataForFirestore: { [key: string]: any } = {};
    (Object.keys(values) as Array<keyof LessonReportFormValues>).forEach(key => {
      if (values[key] !== undefined && values[key] !== null && (typeof values[key] !== 'number' || !isNaN(values[key])) ) {
        dataForFirestore[key] = values[key];
      } else if (key === 'ratingBefore' || key === 'ratingAfter') {
        // Explicitly do not add undefined/NaN numeric fields
      } else if (typeof values[key] === 'string') { 
        // If it's an optional string field that became undefined/null, store as empty string
        dataForFirestore[key] = "";
      }
    });
  
    // Ensure specific optional string fields that might be empty are set to ""
    ['customTopic', 'gameExampleLinks', 'assignedPuzzles', 'practiceGames', 'readingVideos', 'additionalNotes'].forEach(key => {
      if (dataForFirestore[key] === undefined) {
        dataForFirestore[key] = "";
      }
    });


    try {
      if (reportToEdit && reportToEdit.id) {
        dataForFirestore.updatedAt = serverTimestamp(); 
        const reportDocRef = doc(db, "lessonReports", reportToEdit.id);
        await updateDoc(reportDocRef, dataForFirestore);
        
        const updatedCoachSlug = slugify(values.coachName);
        toast({
          title: "Report Updated!",
          description: (
            <>
              The lesson report for {values.studentName} has been successfully updated.{" "}
              <Link href={`/admin/coaches/${updatedCoachSlug}`} className="text-sky-500 hover:text-sky-600 underline">
                View
              </Link>
            </>
          ),
        });
        router.push(`/admin/coaches/${updatedCoachSlug}`);
      } else {
        dataForFirestore.submittedAt = serverTimestamp();
        await addDoc(collection(db, "lessonReports"), dataForFirestore);
        toast({
          title: "Report Saved!",
          description: `The lesson report for ${values.studentName} has been successfully saved.`,
        });
        form.reset();
        setSelectedTopic("");
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error saving lesson report:", error);
      const errorMessage = error instanceof Error ? error.message : `An unexpected error occurred: ${String(error)}`;
      toast({
        variant: "destructive",
        title: reportToEdit ? "Update Failed" : "Save Failed",
        description: `Could not ${reportToEdit ? 'update' : 'save'} the lesson report. ${errorMessage}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const onFormError = (errors: FieldErrors<LessonReportFormValues>) => {
    const errorKeys = Object.keys(errors) as Array<keyof LessonReportFormValues>;
    if (errorKeys.length > 0) {
        const firstErrorKey = errorKeys[0];
        const fieldErrorObject = errors[firstErrorKey];

        let scrolled = false;
        const formItemContainer = document.querySelector(`[data-formfield-name="${firstErrorKey}"]`) as HTMLElement;
        
        if (formItemContainer && typeof formItemContainer.scrollIntoView === 'function') {
            formItemContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            scrolled = true;
        }

        if (fieldErrorObject && fieldErrorObject.ref) {
            const inputElement = fieldErrorObject.ref as any;
            
            if (!scrolled && inputElement instanceof HTMLElement && typeof inputElement.scrollIntoView === 'function') {
                inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            if (typeof inputElement.focus === 'function') {
                setTimeout(() => {
                    inputElement.focus({ preventScroll: scrolled }); 
                }, 150); 
            }
        }
    }
  };

  const handleClearDraft = () => {
    form.reset();
    setSelectedTopic(""); // Also reset local state for selectedTopic
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast({ title: "Draft Cleared", description: "The lesson report draft has been cleared." });
  };

  const onTopicChange = (value: string) => {
    setSelectedTopic(value);
    form.setValue("topicCovered", value, { shouldValidate: true });
    if (value !== "Custom") {
      form.setValue("customTopic", "", { shouldValidate: true }); // Clear custom topic if a predefined one is chosen
    }
  };

  const pageTitle = reportToEdit ? "Edit Lesson Report" : "Create Lesson Report";
  const pageDescription = reportToEdit 
    ? "Modify the details of this lesson report."
    : "Document lesson details, student progress, and homework.";

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-xl md:text-2xl font-bold tracking-tighter flex items-center">
          {reportToEdit ? <Edit3 className="mr-3 h-7 w-7 text-accent" /> : <PlusCircle className="mr-3 h-7 w-7 text-accent" />}
          {pageTitle}
        </CardTitle>
        <CardDescription className="font-body">{pageDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-8" noValidate>

            <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-lg font-bold tracking-tighter flex items-center"><Users className="mr-2 h-5 w-5 text-accent" />Basic Information</h3>
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem data-formfield-name="studentName">
                    <FormLabel>Student Name</FormLabel>
                    <FormControl><Input placeholder="Enter student's full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lessonDateTime"
                  render={({ field }) => (
                    <FormItem data-formfield-name="lessonDateTime">
                      <FormLabel>Date & Time of Lesson</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coachName"
                  render={({ field }) => (
                    <FormItem data-formfield-name="coachName">
                      <FormLabel>Coach Name</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a coach" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allCoachesData.map(coach => (
                            <SelectItem key={coach.fideId || coach.name} value={coach.name}>
                              {coach.name} {coach.nickname && `(${coach.nickname})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ratingBefore"
                  render={({ field }) => (
                    <FormItem data-formfield-name="ratingBefore">
                      <FormLabel>Rating Before (Optional)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 1200" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ratingAfter"
                  render={({ field }) => (
                    <FormItem data-formfield-name="ratingAfter">
                      <FormLabel>Rating After (Optional)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 1250" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Separator />

            <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-lg font-bold tracking-tighter flex items-center"><BookOpen className="mr-2 h-5 w-5 text-accent" />Lesson Content</h3>
              <FormField
                control={form.control}
                name="topicCovered"
                render={({ field }) => (
                  <FormItem data-formfield-name="topicCovered">
                    <FormLabel>Topic Covered</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); onTopicChange(value);}} value={field.value} >
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commonLessonTopics.map(topic => (
                          <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedTopic === "Custom" && (
                <FormField
                  control={form.control}
                  name="customTopic"
                  render={({ field }) => (
                    <FormItem data-formfield-name="customTopic">
                      <FormLabel>Custom Topic Description</FormLabel>
                      <FormControl><Input placeholder="Describe the custom topic" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="keyConcepts"
                render={({ field }) => (
                  <FormItem data-formfield-name="keyConcepts">
                    <FormLabel>Key Concepts (Bullet points recommended)</FormLabel>
                    <FormControl><Textarea placeholder="E.g., - Importance of center control..." {...field} rows={4} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gameExampleLinks"
                render={({ field }) => (
                  <FormItem data-formfield-name="gameExampleLinks">
                    <FormLabel>Analysis Link (Lichess/Chess.com - Optional)</FormLabel>
                    <FormControl><Input type="url" placeholder="https://lichess.org/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

            <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-lg font-bold tracking-tighter flex items-center"><Target className="mr-2 h-5 w-5 text-accent" />Student Performance</h3>
              <FormField
                control={form.control}
                name="strengths"
                render={({ field }) => (
                  <FormItem data-formfield-name="strengths">
                    <FormLabel>Strengths Observed</FormLabel>
                    <FormControl><Textarea placeholder="What did the student do well?" {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="areasToImprove"
                render={({ field }) => (
                  <FormItem data-formfield-name="areasToImprove">
                    <FormLabel>Areas to Improve</FormLabel>
                    <FormControl><Textarea placeholder="What areas need focus?" {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mistakesMade"
                render={({ field }) => (
                  <FormItem data-formfield-name="mistakesMade">
                    <FormLabel>Common Mistakes Made</FormLabel>
                    <FormControl><Textarea placeholder="List any recurring mistakes or patterns." {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

             <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-lg font-bold tracking-tighter flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-accent" />Homework / Next Steps</h3>
              <FormField
                control={form.control}
                name="assignedPuzzles"
                render={({ field }) => (
                  <FormItem data-formfield-name="assignedPuzzles">
                    <FormLabel>Assigned Puzzles (Links or Description)</FormLabel>
                    <FormControl><Textarea placeholder="E.g., Chessable course chapter, Lichess puzzle set link, or describe puzzle types." {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="practiceGames"
                render={({ field }) => (
                  <FormItem data-formfield-name="practiceGames">
                    <FormLabel>Practice Games</FormLabel>
                    <FormControl><Textarea placeholder="E.g., Play 3 games focusing on the Queen's Gambit." {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="readingVideos"
                render={({ field }) => (
                  <FormItem data-formfield-name="readingVideos">
                    <FormLabel>Reading/Videos (Optional Link)</FormLabel>
                    <FormControl><Input type="url" placeholder="https://youtube.com/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

            <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-lg font-bold tracking-tighter flex items-center"><PlusCircle className="mr-2 h-5 w-5 text-accent" />Additional Notes</h3>
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem data-formfield-name="additionalNotes">
                    <FormLabel>General Comments (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Any other comments or observations." {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              {!reportToEdit && (
                <Button type="button" variant="outline" onClick={handleClearDraft} disabled={isSubmitting}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear Draft
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSubmitting ? (reportToEdit ? 'Updating...' : 'Saving...') : (reportToEdit ? 'Update Report' : 'Save Report')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
