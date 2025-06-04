
import { z } from 'genkit';

export const ContactFormInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").describe('The sender\'s name.'),
  email: z.string().email({ message: "Please enter a valid email address." }).describe('The sender\'s email address.'),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(500, { message: "Message must not exceed 500 characters." }).describe('The message content.'),
});
export type ContactFormInput = z.infer<typeof ContactFormInputSchema>;

export const ContactFormOutputSchema = z.object({
  success: z.boolean().describe('Whether the form submission was processed successfully.'),
  message: z.string().describe('A message indicating the result of the submission.'),
});
export type ContactFormOutput = z.infer<typeof ContactFormOutputSchema>;
