'use server';

/**
 * @fileOverview A Genkit flow to moderate chat messages for inappropriate content.
 *
 * - moderateMessage - A function that checks a message and returns whether it's improper.
 * - ModerateMessageOutput - The return type for the moderateMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateMessageOutputSchema = z.object({
  isImproper: z.boolean().describe('Whether the message is considered improper or violates community guidelines.'),
  reason: z.string().optional().describe('A brief reason why the message was flagged, if it is improper.'),
});
export type ModerateMessageOutput = z.infer<typeof ModerateMessageOutputSchema>;

export async function moderateMessage(
  input: string
): Promise<ModerateMessageOutput> {
  return moderateMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateMessagePrompt',
  input: {schema: z.string()},
  output: {schema: ModerateMessageOutputSchema},
  prompt: `You are a content moderator for a health-focused online community.
  Your task is to determine if a user's message is inappropriate.

  Inappropriate content includes, but is not limited to:
  - Hate speech, discrimination, or personal attacks.
  - Harassment or bullying.
  - Spam or unrelated advertising.
  - Spreading misinformation about health topics.
  - Sexually explicit content.
  - Violent or graphic descriptions.

  Analyze the following message:
  "{{{input}}}"

  Based on the content, determine if it is improper. If it is, provide a brief, one-sentence reason for the classification.
  Return your response in the specified JSON format.
  `,
});

const moderateMessageFlow = ai.defineFlow(
  {
    name: 'moderateMessageFlow',
    inputSchema: z.string(),
    outputSchema: ModerateMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
