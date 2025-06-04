
"use client";

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
import { Mail, Send, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';

const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(500, { message: "Message must not exceed 500 characters." }),
});
type ContactFormData = z.infer<typeof ContactFormSchema>;

export default function ContactSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({ 
    resolver: zodResolver(ContactFormSchema), 
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactFormData) { 
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3001/contactSubmissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: "Your message has been submitted locally.",
          variant: "default",
        });
        form.reset();
      } else {
        toast({
          title: "Submission Error",
          description: `Failed to submit message: ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      let errorMessage = "An unknown error occurred during submission.";
      if (error instanceof Error) {
        errorMessage = `Network error: ${error.message}. Is json-server running?`;
      }
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Mail className="mx-auto h-12 w-12 text-accent mb-4" />
          <h2 className="font-headline text-4xl md:text-5xl font-bold">
            Get in Touch
          </h2>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Have questions or ready to start your coaching? Send a message.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-8 border rounded-xl shadow-lg bg-card">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} className="font-body" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} className="font-body" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body">Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your questions or booking inquiry..."
                        className="resize-none font-body min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
