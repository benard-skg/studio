
'use server';
/**
 * @fileOverview Handles contact form submissions.
 *
 * - submitContactForm - A function to process contact form submissions.
 * - ContactFormInput - The input type for the submitContactForm function.
 * - ContactFormOutput - The return type for the submitContactForm function.
 */

import { ai } from '@/ai/genkit';
import { 
  ContactFormInputSchema, 
  type ContactFormInput, 
  ContactFormOutputSchema, 
  type ContactFormOutput 
} from '@/lib/schemas/contact-form-schemas';

// Re-export types to adhere to Genkit flow conventions
export type { ContactFormInput, ContactFormOutput };

// Wrapper function to be called by the client
export async function submitContactForm(input: ContactFormInput): Promise<ContactFormOutput> {
  return contactFormFlow(input);
}

const processingPrompt = ai.definePrompt({
  name: 'contactFormProcessorPrompt',
  input: { schema: ContactFormInputSchema },
  output: { schema: z.object({ processedMessage: z.string().describe("A confirmation that the message was received.") }) },
  prompt: `A user has submitted the following contact form:
Name: {{{name}}}
Email: {{{email}}}
Message: {{{message}}}

Acknowledge receipt of this message briefly.`,
});


const contactFormFlow = ai.defineFlow(
  {
    name: 'contactFormFlow',
    inputSchema: ContactFormInputSchema,
    outputSchema: ContactFormOutputSchema,
  },
  async (input: ContactFormInput): Promise<ContactFormOutput> => {
    console.log('Contact form submission received in flow:', input);

    try {
      const { output } = await processingPrompt(input);
      console.log('LLM Acknowledgement:', output?.processedMessage);

      // In a real application, you would add email sending logic here.
      // For example, using a service like Nodemailer or an Email API.
      // For this example, we assume success if the flow reaches this point.
      return {
        success: true,
        message: output?.processedMessage || 'Thank you for your message! We will get back to you soon.',
      };
    } catch (error) {
      console.error('Error processing contact form with AI:', error);
      // Fallback message if AI processing fails but we still want to acknowledge receipt
      return {
        success: true, // Still consider it a success for the user if we can log it
        message: 'Thank you for your message. We have received it.',
      };
    }
  }
);
