
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
import { Mail, Send, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(500, { message: "Message must not exceed 500 characters." }),
});
type ContactFormData = z.infer<typeof ContactFormSchema>;

interface Submission extends ContactFormData {
  submittedAt: string;
}

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.33 3.43 16.79L2 22L7.32 20.64C8.75 21.42 10.36 21.88 12.04 21.88C17.5 21.88 21.95 17.43 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM12.04 20.13C10.56 20.13 9.12 19.72 7.89 19L7.5 18.78L4.44 19.56L5.25 16.58L4.99 16.17C4.08 14.84 3.58 13.31 3.58 11.91C3.58 7.29 7.39 3.48 12.04 3.48C16.69 3.48 20.5 7.29 20.5 11.91C20.5 16.53 16.69 20.13 12.04 20.13ZM17.07 14.24C16.83 14.12 15.82 13.62 15.6 13.53C15.39 13.45 15.24 13.4 15.09 13.64C14.95 13.88 14.5 14.42 14.37 14.57C14.24 14.72 14.11 14.74 13.88 14.62C13.64 14.5 12.93 14.24 12.08 13.48C11.41 12.89 10.93 12.18 10.79 11.94C10.66 11.7 10.75 11.58 10.87 11.47C10.98 11.36 11.12 11.18 11.25 11.03C11.38 10.88 11.43 10.77 11.53 10.59C11.63 10.41 11.58 10.26 11.51 10.14C11.43 10.02 10.97 8.83 10.77 8.35C10.58 7.87 10.39 7.94 10.25 7.93C10.12 7.92 9.97 7.92 9.82 7.92C9.67 7.92 9.43 7.99 9.21 8.23C9 8.47 8.45 8.96 8.45 10.05C8.45 11.14 9.24 12.16 9.36 12.31C9.49 12.46 10.96 14.82 13.27 15.78C13.88 16.04 14.32 16.19 14.66 16.29C15.23 16.46 15.68 16.42 16.02 16.18C16.4 15.9 16.95 15.26 17.14 14.97C17.34 14.68 17.34 14.42 17.27 14.32C17.2 14.23 17.07 14.24 17.07 14.24Z" />
  </svg>
);

const JSONBIN_API_BASE = "https://api.jsonbin.io/v3/b";

export default function ContactSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const whatsappNumber = "+27834544862"; 

  const NEXT_PUBLIC_JSONBIN_ACCESS_KEY = process.env.NEXT_PUBLIC_JSONBIN_ACCESS_KEY;
  const NEXT_PUBLIC_JSONBIN_BIN_ID = process.env.NEXT_PUBLIC_JSONBIN_CONTACT_SUBMISSIONS_BIN_ID; // Use the specific bin ID

  useEffect(() => {
    console.log("ContactSection: NEXT_PUBLIC_JSONBIN_ACCESS_KEY:", NEXT_PUBLIC_JSONBIN_ACCESS_KEY ? NEXT_PUBLIC_JSONBIN_ACCESS_KEY.substring(0,5) + '...' : 'UNDEFINED');
    console.log("ContactSection: NEXT_PUBLIC_JSONBIN_CONTACT_SUBMISSIONS_BIN_ID:", NEXT_PUBLIC_JSONBIN_BIN_ID || 'UNDEFINED');
    if (!NEXT_PUBLIC_JSONBIN_ACCESS_KEY || NEXT_PUBLIC_JSONBIN_ACCESS_KEY === 'YOUR_JSONBIN_ACCESS_KEY' || 
        !NEXT_PUBLIC_JSONBIN_BIN_ID || NEXT_PUBLIC_JSONBIN_BIN_ID === 'YOUR_JSONBIN_CONTACT_SUBMISSIONS_BIN_ID_HERE' || NEXT_PUBLIC_JSONBIN_BIN_ID === 'YOUR_JSONBIN_BIN_ID') { // Check against new placeholder
      setIsConfigured(false);
      console.warn("Contact form: JSONBin.io Access Key or Contact Submissions Bin ID is not configured or is using placeholder values.");
    } else {
      setIsConfigured(true);
    }
  }, [NEXT_PUBLIC_JSONBIN_ACCESS_KEY, NEXT_PUBLIC_JSONBIN_BIN_ID]);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactFormData) {
    if (!isConfigured) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "The contact form is not properly configured to save submissions. Please check API keys.",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      console.log(`ContactSection onSubmit: Attempting to fetch with Access Key: ${NEXT_PUBLIC_JSONBIN_ACCESS_KEY ? NEXT_PUBLIC_JSONBIN_ACCESS_KEY.substring(0,5) + '...' : 'UNDEFINED'} and Bin ID: ${NEXT_PUBLIC_JSONBIN_BIN_ID || 'UNDEFINED'}`);
      const getResponse = await fetch(`${JSONBIN_API_BASE}/${NEXT_PUBLIC_JSONBIN_BIN_ID}/latest`, {
        method: 'GET',
        headers: {
          'X-Access-Key': NEXT_PUBLIC_JSONBIN_ACCESS_KEY!,
        },
      });

      let submissions: Submission[] = [];
      if (getResponse.ok) {
        const data = await getResponse.json();
        submissions = Array.isArray(data.record) ? data.record : (typeof data.record === 'object' && Object.keys(data.record).length === 0 ? [] : []);
      } else if (getResponse.status === 404) {
        console.warn("JSONBin: Bin not found or empty, will create/overwrite with new data.");
      } else {
        const errorText = await getResponse.text();
        console.error("Failed to fetch existing submissions:", getResponse.status, errorText);
        throw new Error(`Failed to fetch existing submissions. Status: ${getResponse.status}`);
      }

      const newSubmission: Submission = {
        ...values,
        submittedAt: new Date().toISOString(),
      };
      const updatedSubmissions = [...submissions, newSubmission];

      console.log(`ContactSection onSubmit: Attempting to PUT with Access Key: ${NEXT_PUBLIC_JSONBIN_ACCESS_KEY ? NEXT_PUBLIC_JSONBIN_ACCESS_KEY.substring(0,5) + '...' : 'UNDEFINED'} and Bin ID: ${NEXT_PUBLIC_JSONBIN_BIN_ID || 'UNDEFINED'}`);
      const putResponse = await fetch(`${JSONBIN_API_BASE}/${NEXT_PUBLIC_JSONBIN_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': NEXT_PUBLIC_JSONBIN_ACCESS_KEY!,
          'X-Bin-Versioning': 'false', 
        },
        body: JSON.stringify(updatedSubmissions),
      });

      if (!putResponse.ok) {
        const errorText = await putResponse.text();
        console.error("Failed to save submission:", putResponse.status, errorText);
        throw new Error(`Failed to save submission. Status: ${putResponse.status}`);
      }

      toast({
        title: "Message Sent!",
        description: "Thank you for your message. We'll get back to you soon.",
      });
      form.reset();
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Could not send your message. Please try again later or contact us via WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Mail className="mx-auto h-12 w-12 text-accent mb-4" />
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
            Get in Touch
          </h2>
          <p className="font-body text-lg text-muted-foreground mt-2">
            Have questions or ready to start your coaching? Send a message or reach out on WhatsApp.
          </p>
        </div>

        <div className="flex flex-col items-center my-6">
          <a
            href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-col items-center text-accent hover:text-accent/80 transition-colors"
          >
            <WhatsAppIcon className="h-10 w-10 text-green-500" />
            <span className="font-body text-sm text-muted-foreground mt-2">
              Chat on WhatsApp
            </span>
          </a>
        </div>

        {!isConfigured && (
          <div className="max-w-2xl mx-auto my-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-3" />
            <p className="font-body text-sm">
              The contact form submission is currently not configured. Please contact the administrator or ensure API keys are set in .env and the server is restarted.
            </p>
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-8 border rounded-xl shadow-lg bg-card mt-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} className="font-body" disabled={isSubmitting || !isConfigured} />
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
                      <Input type="email" placeholder="your.email@example.com" {...field} className="font-body" disabled={isSubmitting || !isConfigured} />
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
                        disabled={isSubmitting || !isConfigured}
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
                disabled={isSubmitting || !isConfigured}
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
