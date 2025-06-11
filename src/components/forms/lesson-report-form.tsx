
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
  studentName: z.string().default(''),
  lessonDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date/time format."),
  coachName: z.string().default(''),
  ratingBefore: z.coerce.number().optional(),
  ratingAfter: z.coerce.number().optional(),
  topicCovered: z.string().default(''), 
  customTopic: z.string().default(''),
  keyConcepts: z.string().default(''),
  pgnFile: z.custom<FileList>().optional(),
  gameExampleLinks: z.string().url("Must be a valid URL (e.g., Lichess, Chess.com analysis link)").optional().or(z.literal('')),
  strengths: z.string().default(''),
  areasToImprove: z.string().default(''),
  mistakesMade: z.string().default(''),
  assignedPuzzles: z.string().default(''),
  practiceGames: z.string().default(''),
  readingVideos: z.string().url("Must be a valid URL for reading/video material").optional().or(z.literal('')),
  additionalNotes: z.string().default(''),
});

type StoredLessonReport = Omit<z.infer<typeof lessonReportSchema>, 'pgnFile'> & {
  id: string;
  submittedAt: string;
  pgnFilename?: string;
};


const LOCAL_STORAGE_KEY = "lessonReportDraft";
const JSONBIN_API_BASE = "https://api.jsonbin.io/v3/b";
const LESSON_REPORTS_BIN_ID = "YOUR_JSONBIN_LESSON_REPORTS_BIN_ID"; // Placeholder
const JSONBIN_ACCESS_KEY = "$2a$10$ruiuDJ8CZrmUGcZ/0T4oxupL/lYNqs2tnITLQ2KNt0NkhEDq.6CQG"; // Replaced placeholder


export default function LessonReportForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedTopic, setSelectedTopic] = React.useState<string>("");
  const [isConfigured, setIsConfigured] = React.useState(true);

  React.useEffect(() => {
    if (!LESSON_REPORTS_BIN_ID || LESSON_REPORTS_BIN_ID === 'YOUR_JSONBIN_LESSON_REPORTS_BIN_ID' ||
        !JSONBIN_ACCESS_KEY || JSONBIN_ACCESS_KEY === '$2a$10$ruiuDJ8CZrmUGcZ/0T4oxupL/lYNqs2tnITLQ2KNt0NkhEDq.6CQG') { // Check against actual key if needed for "not configured" logic
      setIsConfigured(false);
      console.warn("Lesson Report Form: JSONBin.io Access Key or Lesson Reports Bin ID is not configured or is using placeholder values.");
    } else {
      setIsConfigured(true);
    }
  }, []);

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
      pgnFile: undefined,
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
      } catch (error) {
        console.error("Failed to parse lesson report draft from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY); 
      }
    }
  }, [form]);

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values: z.infer<typeof lessonReportSchema>) {
    if (!isConfigured) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Cannot save report. JSONBin.io is not properly configured. Please check placeholders."
      });
      return;
    }
    setIsSubmitting(true);

    const processedValues = { ...values };
    (Object.keys(processedValues) as Array<keyof typeof processedValues>).forEach(key => {
        if (processedValues[key] === undefined && typeof lessonReportSchema.shape[key]?.parse('') === 'string') {
            (processedValues as any)[key] = '';
        }
    });

    const newReportData: StoredLessonReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      studentName: processedValues.studentName,
      lessonDateTime: processedValues.lessonDateTime,
      coachName: processedValues.coachName,
      ratingBefore: processedValues.ratingBefore,
      ratingAfter: processedValues.ratingAfter,
      topicCovered: processedValues.topicCovered,
      customTopic: processedValues.customTopic,
      keyConcepts: processedValues.keyConcepts,
      gameExampleLinks: processedValues.gameExampleLinks,
      strengths: processedValues.strengths,
      areasToImprove: processedValues.areasToImprove,
      mistakesMade: processedValues.mistakesMade,
      assignedPuzzles: processedValues.assignedPuzzles,
      practiceGames: processedValues.practiceGames,
      readingVideos: processedValues.readingVideos,
      additionalNotes: processedValues.additionalNotes,
      pgnFilename: processedValues.pgnFile && processedValues.pgnFile.length > 0 ? processedValues.pgnFile[0].name : undefined,
      submittedAt: new Date().toISOString(),
    };

    try {
      const getResponse = await fetch(`${JSONBIN_API_BASE}/${LESSON_REPORTS_BIN_ID}/latest`, {
        method: 'GET',
        headers: { 'X-Access-Key': JSONBIN_ACCESS_KEY },
      });

      let currentReports: StoredLessonReport[] = [];
      if (getResponse.ok) {
        const data = await getResponse.json();
        currentReports = Array.isArray(data.record) ? data.record : [];
      } else if (getResponse.status === 404) {
        console.log("Lesson reports bin not found or empty. Will create/overwrite.");
      } else {
        const errorText = await getResponse.text();
        throw new Error(`Failed to fetch existing reports. Status: ${getResponse.status}. ${errorText}`);
      }

      const updatedReports = [...currentReports, newReportData];

      const putResponse = await fetch(`${JSONBIN_API_BASE}/${LESSON_REPORTS_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': JSONBIN_ACCESS_KEY,
          'X-Bin-Versioning': 'false', 
        },
        body: JSON.stringify(updatedReports),
      });

      if (!putResponse.ok) {
        const errorText = await putResponse.text();
        throw new Error(`Failed to save lesson report. Status: ${putResponse.status}. ${errorText}`);
      }

      toast({
        title: "Report Saved!",
        description: "Lesson report has been successfully saved to JSONBin.io.",
      });
      form.reset({ 
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
      localStorage.removeItem(LOCAL_STORAGE_KEY); 
      setSelectedTopic(""); 

    } catch (error: any) {
      console.error("Error saving lesson report:", error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: error.message || "Could not save the report. Check console for details.",
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


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl md:text-3xl">Create Lesson Report</CardTitle>
        <CardDescription className="font-body">Document lesson details, student progress, and homework.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>

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
              <h3 className="font-headline text-xl flex items-center"><BookOpen className="mr-2 h-5 w-5 text-accent" />Lesson Content</h3>
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
              <div className="grid md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="pgnFile"
                    render={({ field: { onChange, value, ...restField } }) => ( 
                      <FormItem>
                        <FormLabel>Game PGN Upload (Optional)</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept=".pgn" 
                                onChange={(e) => onChange(e.target.files)} 
                                {...restField} 
                            />
                        </FormControl>
                        <FormDescription>Upload a PGN file (max 1MB).</FormDescription>
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
              </div>
            </section>

            <Separator />

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
              <Button type="submit" disabled={isSubmitting || !isConfigured} className="bg-accent hover:bg-accent/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Report
              </Button>
            </div>
             {!isConfigured && (
                <p className="text-xs text-destructive text-center pt-2">
                    JSONBin.io configuration (Access Key or Bin ID for reports) is missing or using placeholders. Saving is disabled.
                </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
