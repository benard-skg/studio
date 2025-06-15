
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  customTopic: z.string().optional(), // Made optional
  gameExampleLinks: z.string().url("Must be a valid URL (e.g., Lichess, Chess.com analysis link)").optional().or(z.literal('')),
  keyConcepts: z.string().min(1, "Key concepts are required").default(''),
  strengths: z.string().min(1, "Strengths observed are required").default(''),
  areasToImprove: z.string().min(1, "Areas to improve are required").default(''),
  mistakesMade: z.string().min(1, "Common mistakes made are required").default(''),
  assignedPuzzles: z.string().optional(), // Made optional
  practiceGames: z.string().optional(), // Made optional
  readingVideos: z.string().url("Must be a valid URL for reading/video material").optional().or(z.literal('')),
  additionalNotes: z.string().optional(), // Made optional
});

const LOCAL_STORAGE_KEY = "lessonReportDraft";

interface LessonReportFormProps {
  reportToEdit?: StoredLessonReport | null;
}

export default function LessonReportForm({ reportToEdit }: LessonReportFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedTopic, setSelectedTopic] = React.useState<string>(reportToEdit?.topicCovered || "");

  const form = useForm<z.infer<typeof lessonReportSchema>>({
    resolver: zodResolver(lessonReportSchema),
    defaultValues: {
      studentName: "",
      lessonDateTime: new Date().toISOString().substring(0, 16),
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
      const { id, submittedAt, pgnFileUrl, pgnFilename, ...formDataToReset } = reportToEdit;
      const lessonDT = formDataToReset.lessonDateTime 
        ? new Date(formDataToReset.lessonDateTime).toISOString().substring(0, 16) 
        : new Date().toISOString().substring(0, 16);

      form.reset({
        ...formDataToReset,
        lessonDateTime: lessonDT,
        ratingBefore: formDataToReset.ratingBefore ?? undefined,
        ratingAfter: formDataToReset.ratingAfter ?? undefined,
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
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
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
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    }
  }, [reportToEdit, form]);

  React.useEffect(() => {
    if (!reportToEdit) {
      const subscription = form.watch((values) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values));
      });
      return () => subscription.unsubscribe();
    }
  }, [form, reportToEdit]);

  async function onSubmit(values: z.infer<typeof lessonReportSchema>) {
    setIsSubmitting(true);

    const dataForFirestore: { [key: string]: any } = {};
    Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) { // Only include defined values
            dataForFirestore[key] = value;
        }
    });
    // Ensure empty optional strings are converted to empty strings not undefined if they reach here as undefined.
    // Zod's .default('') for strings should handle this, but being explicit for optional ones.
    ['customTopic', 'gameExampleLinks', 'assignedPuzzles', 'practiceGames', 'readingVideos', 'additionalNotes'].forEach(key => {
      if (dataForFirestore[key] === undefined) {
        dataForFirestore[key] = ""; // Store empty string if field was optional and not provided
      }
    });


    try {
      if (reportToEdit && reportToEdit.id) {
        dataForFirestore.updatedAt = serverTimestamp();
        const reportDocRef = doc(db, "lessonReports", reportToEdit.id);
        await updateDoc(reportDocRef, dataForFirestore);
        toast({
          title: "Report Updated!",
          description: "The lesson report has been successfully updated.",
        });
        const coachSlug = slugify(reportToEdit.coachName);
        router.push(`/admin/coaches/${coachSlug}`);

      } else {
        dataForFirestore.submittedAt = serverTimestamp();
        await addDoc(collection(db, "lessonReports"), dataForFirestore);
        toast({
          title: "Report Saved!",
          description: "The lesson report has been successfully saved.",
        });
        form.reset();
        setSelectedTopic("");
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error saving lesson report:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        variant: "destructive",
        title: reportToEdit ? "Update Failed" : "Save Failed",
        description: `Could not ${reportToEdit ? 'update' : 'save'} the lesson report. ${errorMessage}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleClearDraft = () => {
    form.reset();
    setSelectedTopic("");
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast({ title: "Draft Cleared", description: "The lesson report draft has been cleared." });
  };

  const onTopicChange = (value: string) => {
    setSelectedTopic(value);
    form.setValue("topicCovered", value, { shouldValidate: true });
    if (value !== "Custom") {
      form.setValue("customTopic", "", { shouldValidate: true });
    }
  };

  const pageTitle = reportToEdit ? "Edit Lesson Report" : "Create Lesson Report";
  const pageDescription = reportToEdit 
    ? "Modify the details of this lesson report."
    : "Document lesson details, student progress, and homework.";

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl md:text-3xl font-black tracking-tighter flex items-center">
          {reportToEdit ? <Edit3 className="mr-3 h-7 w-7 text-accent" /> : <PlusCircle className="mr-3 h-7 w-7 text-accent" />}
          {pageTitle}
        </CardTitle>
        <CardDescription className="font-body">{pageDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>

            <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-xl font-black tracking-tighter flex items-center"><Users className="mr-2 h-5 w-5 text-accent" />Basic Information</h3>
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
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
                    <FormItem>
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
                    <FormItem>
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
                    <FormItem>
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
                    <FormItem>
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
              <h3 className="font-headline text-xl font-black tracking-tighter flex items-center"><BookOpen className="mr-2 h-5 w-5 text-accent" />Lesson Content</h3>
              <FormField
                control={form.control}
                name="topicCovered"
                render={({ field }) => (
                  <FormItem>
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
                    <FormItem>
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
                  <FormItem>
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
                  <FormItem>
                    <FormLabel>Analysis Link (Lichess/Chess.com - Optional)</FormLabel>
                    <FormControl><Input type="url" placeholder="https://lichess.org/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

            <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-xl font-black tracking-tighter flex items-center"><Target className="mr-2 h-5 w-5 text-accent" />Student Performance</h3>
              <FormField
                control={form.control}
                name="strengths"
                render={({ field }) => (
                  <FormItem>
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
                  <FormItem>
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
                  <FormItem>
                    <FormLabel>Common Mistakes Made</FormLabel>
                    <FormControl><Textarea placeholder="List any recurring mistakes or patterns." {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

             <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-xl font-black tracking-tighter flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-accent" />Homework / Next Steps</h3>
              <FormField
                control={form.control}
                name="assignedPuzzles"
                render={({ field }) => (
                  <FormItem>
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
                  <FormItem>
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
                  <FormItem>
                    <FormLabel>Reading/Videos (Optional Link)</FormLabel>
                    <FormControl><Input type="url" placeholder="https://youtube.com/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

            <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-xl font-black tracking-tighter flex items-center"><PlusCircle className="mr-2 h-5 w-5 text-accent" />Additional Notes</h3>
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
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

