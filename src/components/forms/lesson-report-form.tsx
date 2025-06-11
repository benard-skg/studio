
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Loader2, Save, Trash2, BookOpen, Users, Target, AlertTriangle, CheckCircle, PlusCircle } from "lucide-react";
import type { LessonReportData, LessonTopic } from "@/lib/types";
import { commonLessonTopics } from "@/lib/types";

const lessonReportSchema = z.object({
  studentName: z.string().min(2, "Student name must be at least 2 characters."),
  lessonDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date/time format."),
  coachName: z.string().min(2, "Coach name must be at least 2 characters."),
  ratingBefore: z.coerce.number().optional(),
  ratingAfter: z.coerce.number().optional(),
  topicCovered: z.string().min(1, "Please select or enter a topic."),
  customTopic: z.string().optional(),
  keyConcepts: z.string().min(10, "Key concepts must be at least 10 characters."),
  pgnFile: z.custom<FileList>().optional(),
  gameExampleLinks: z.string().url("Must be a valid URL (e.g., Lichess, Chess.com analysis link)").optional().or(z.literal('')),
  strengths: z.string().min(10, "Strengths must be at least 10 characters."),
  areasToImprove: z.string().min(10, "Areas to improve must be at least 10 characters."),
  mistakesMade: z.string().min(10, "Mistakes made must be at least 10 characters."),
  assignedPuzzles: z.string().min(5, "Describe assigned puzzles or link to them."),
  practiceGames: z.string().min(5, "Describe practice game requirements."),
  readingVideos: z.string().url("Must be a valid URL for reading/video material").optional().or(z.literal('')),
  additionalNotes: z.string().optional(),
}).refine(data => data.topicCovered !== "Custom" || (data.topicCovered === "Custom" && data.customTopic && data.customTopic.trim() !== ""), {
  message: "Custom topic description cannot be empty if 'Custom' is selected.",
  path: ["customTopic"],
});


const LOCAL_STORAGE_KEY = "lessonReportDraft";

export default function LessonReportForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedTopic, setSelectedTopic] = React.useState<string>("");

  const form = useForm<z.infer<typeof lessonReportSchema>>({
    resolver: zodResolver(lessonReportSchema),
    defaultValues: {
      studentName: "",
      lessonDateTime: new Date().toISOString().substring(0, 16), // Defaults to current date and time in 'YYYY-MM-DDTHH:mm'
      coachName: "", // Prefill later if auth is available
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
    const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        form.reset(parsedDraft);
        if (parsedDraft.topicCovered) {
          setSelectedTopic(parsedDraft.topicCovered);
        }
        toast({ title: "Draft Loaded", description: "Your previous lesson report draft has been loaded." });
      } catch (error) {
        console.error("Failed to parse lesson report draft from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted draft
      }
    }
  }, [form, toast]);

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  function onSubmit(values: z.infer<typeof lessonReportSchema>) {
    setIsSubmitting(true);
    console.log("Lesson Report Submitted:", values);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Report Saved (Logged)",
        description: "Lesson report data has been logged to the console.",
      });
      // Potentially clear form or redirect after successful "save"
      // form.reset(); // Uncomment to clear form after submission
      // localStorage.removeItem(LOCAL_STORAGE_KEY); // Uncomment to clear draft after submission
      setIsSubmitting(false);
    }, 1000);
  }

  const handleClearDraft = () => {
    form.reset({ // Reset to initial default values
      studentName: "",
      lessonDateTime: new Date().toISOString().substring(0, 16),
      coachName: "",
      ratingBefore: undefined,
      ratingAfter: undefined,
      topicCovered: "",
      customTopic: "",
      keyConcepts: "",
      pgnFile: undefined,
      gameExampleLinks: "",
      strengths: "",
      areasToImprove: "",
      mistakesMade: "",
      assignedPuzzles: "",
      practiceGames: "",
      readingVideos: "",
      additionalNotes: "",
    });
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


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl md:text-3xl">Create Lesson Report</CardTitle>
        <CardDescription className="font-body">Document lesson details, student progress, and homework.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            {/* Section 1: Basic Info */}
            <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-xl flex items-center"><Users className="mr-2 h-5 w-5 text-accent" />Basic Information</h3>
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
                      <FormControl><Input placeholder="Enter coach's name" {...field} /></FormControl>
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
                      <FormControl><Input type="number" placeholder="e.g., 1200" {...field} value={field.value ?? ''} /></FormControl>
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
                      <FormControl><Input type="number" placeholder="e.g., 1250" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>
            
            <Separator />

            {/* Section 2: Lesson Content */}
            <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-xl flex items-center"><BookOpen className="mr-2 h-5 w-5 text-accent" />Lesson Content</h3>
              <FormField
                control={form.control}
                name="topicCovered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic Covered</FormLabel>
                    <Select onValueChange={onTopicChange} defaultValue={field.value}>
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
              <div className="grid md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="pgnFile"
                    render={({ field: { onChange, value, ...restField } }) => (
                      <FormItem>
                        <FormLabel>Game Examples (PGN Upload - Optional)</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept=".pgn" 
                                onChange={(e) => onChange(e.target.files)} 
                                {...restField} 
                            />
                        </FormControl>
                        <FormDescription>Upload a PGN file for game analysis.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                  control={form.control}
                  name="gameExampleLinks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game Examples (Lichess/Chess.com Link - Optional)</FormLabel>
                      <FormControl><Input type="url" placeholder="https://lichess.org/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Separator />

            {/* Section 3: Student Performance */}
            <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-xl flex items-center"><Target className="mr-2 h-5 w-5 text-accent" />Student Performance</h3>
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

            {/* Section 4: Homework/Next Steps */}
             <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-xl flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-accent" />Homework / Next Steps</h3>
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

            {/* Section 5: Additional Notes */}
            <section className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
              <h3 className="font-headline text-xl flex items-center"><PlusCircle className="mr-2 h-5 w-5 text-accent" />Additional Notes</h3>
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
              <Button type="button" variant="outline" onClick={handleClearDraft} disabled={isSubmitting}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear Draft
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Report (Log to Console)
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

