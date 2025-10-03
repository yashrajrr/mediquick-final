'use server';

/**
 * @fileOverview This file defines a Genkit flow for checking potential drug interactions.
 *
 * It takes a list of medications as input and returns a list of potential drug interactions
 * with severity levels and suggested alternatives using AI.
 *
 * - checkForDrugInteractions - A function that handles the drug interaction checking process.
 * - CheckForDrugInteractionsInput - The input type for the checkForDrugInteractions function.
 * - CheckForDrugInteractionsOutput - The return type for the checkForDrugInteractions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckForDrugInteractionsInputSchema = z.object({
  medications: z
    .array(z.string())
    .describe('A list of medications to check for interactions.'),
});
export type CheckForDrugInteractionsInput = z.infer<
  typeof CheckForDrugInteractionsInputSchema
>;

const DrugInteractionSchema = z.object({
  medication1: z.string().describe('The first medication involved in the interaction.'),
  medication2: z.string().describe('The second medication involved in the interaction.'),
  severity: z
    .enum(['minor', 'moderate', 'severe'])
    .describe('The severity of the drug interaction.'),
  description: z.string().describe('A description of the interaction.'),
  alternatives: z
    .array(z.string())
    .describe('Suggested alternative medications, if any.'),
});

const CheckForDrugInteractionsOutputSchema = z.object({
  interactions: z
    .array(DrugInteractionSchema)
    .describe('A list of potential drug interactions.'),
});
export type CheckForDrugInteractionsOutput = z.infer<
  typeof CheckForDrugInteractionsOutputSchema
>;

export async function checkForDrugInteractions(
  input: CheckForDrugInteractionsInput
): Promise<CheckForDrugInteractionsOutput> {
  return checkForDrugInteractionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkForDrugInteractionsPrompt',
  input: {schema: CheckForDrugInteractionsInputSchema},
  output: {schema: CheckForDrugInteractionsOutputSchema},
  prompt: `You are a pharmacist tasked with identifying potential drug interactions.

  Given the following list of medications:
  {{#each medications}}- {{{this}}}\n{{/each}}

  Identify any potential drug interactions between these medications.
  For each interaction, provide the names of the two medications involved,
  a severity level (minor, moderate, or severe), a description of the interaction,
  and suggested alternative medications, if any.

  Return the information in JSON format.
  Make sure that the JSON is parseable.
  `,
});

const checkForDrugInteractionsFlow = ai.defineFlow(
  {
    name: 'checkForDrugInteractionsFlow',
    inputSchema: CheckForDrugInteractionsInputSchema,
    outputSchema: CheckForDrugInteractionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
