
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod"; // Re-added for local schema definition
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
import { Mail, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
// Removed useState for isSubmitting and Loader2 import

// Define schema locally as it was before backend integration
const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(500, { message: "Message must not exceed 500 characters." }),
});
type ContactFormData = z.infer<typeof ContactFormSchema>;

export default function ContactSection() {
  const { toast } = useToast();
  // Removed isSubmitting state

  const form = useForm<ContactFormData>({ 
    resolver: zodResolver(ContactFormSchema), 
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  // Reverted onSubmit to client-side only logic
  async function onSubmit(values: ContactFormData) { 
    console.log("Form submitted:", values); // Original behavior
    toast({
      title: "Message Sent!",
      description: "Thank you for your message. We will get back to you soon.", // Original simple message
      variant: "default",
    });
    form.reset();
    // Removed setIsSubmitting logic and backend call
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
              {/* Reverted button to original state */}
              <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-md">
                Send Message <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
