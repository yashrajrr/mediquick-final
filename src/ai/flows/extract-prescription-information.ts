'use server';

/**
 * @fileOverview Extracts prescription information from an image using AI.
 *
 * - extractPrescriptionInformation - A function that handles the prescription information extraction process.
 * - ExtractPrescriptionInformationInput - The input type for the extractPrescriptionInformation function.
 * - ExtractPrescriptionInformationOutput - The return type for the extractPrescriptionInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPrescriptionInformationInputSchema = z.object({
  prescriptionDataUri: z
    .string()
    .describe(
      "A photo of a prescription, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ExtractPrescriptionInformationInput = z.infer<typeof ExtractPrescriptionInformationInputSchema>;


const MedicationInfoSchema = z.object({
  medicationName: z.string().describe('The name of the medication prescribed.'),
  dosage: z.string().describe('The dosage of the medication.'),
  frequency: z.string().describe('The frequency of the medication.'),
  confidenceScore: z
    .number()
    .describe(
      'The confidence score of the extracted information for this specific medication, ranging from 0 to 1.'
    ),
});

const ExtractPrescriptionInformationOutputSchema = z.object({
  medications: z.array(MedicationInfoSchema).describe('An array of all medications found on the prescription.'),
});

export type ExtractPrescriptionInformationOutput = z.infer<typeof ExtractPrescriptionInformationOutputSchema>;
export type MedicationInfo = z.infer<typeof MedicationInfoSchema>;


export async function extractPrescriptionInformation(
  input: ExtractPrescriptionInformationInput
): Promise<ExtractPrescriptionInformationOutput> {
  return extractPrescriptionInformationFlow(input);
}

const extractPrescriptionInformationPrompt = ai.definePrompt({
  name: 'extractPrescriptionInformationPrompt',
  input: {schema: ExtractPrescriptionInformationInputSchema},
  output: {schema: ExtractPrescriptionInformationOutputSchema},
  prompt: `You are an AI assistant specializing in extracting information from prescription images.

  Analyze the provided prescription image and extract information for ALL medications listed. For each medication, extract the following:

  - Medication Name: The name of the prescribed medication.
  - Dosage: The prescribed dosage of the medication.
  - Frequency: How often the medication should be taken.

  Return the extracted information as a JSON object containing a "medications" array. For each medication, include a confidence score (0-1) indicating the accuracy of the extraction for that item.

  Prescription Image: {{media url=prescriptionDataUri}}
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const extractPrescriptionInformationFlow = ai.defineFlow(
  {
    name: 'extractPrescriptionInformationFlow',
    inputSchema: ExtractPrescriptionInformationInputSchema,
    outputSchema: ExtractPrescriptionInformationOutputSchema,
  },
  async input => {
    const {output} = await extractPrescriptionInformationPrompt(input);
    return output!;
  }
);
