'use server';

/**
 * @fileOverview This file defines a Genkit flow for recommending medicines based on symptoms.
 *
 * - findMedicinesForSymptom - A function that takes a symptom and a product list and returns recommended medicines.
 * - FindMedicinesForSymptomInput - The input type for the findMedicinesForSymptom function.
 * - FindMedicinesForSymptomOutput - The return type for the findMedicinesForSymptom function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductInfoSchema = z.object({
  name: z.string(),
  category: z.string(),
});

const FindMedicinesForSymptomInputSchema = z.object({
  symptom: z.string().describe('The symptom the user is experiencing.'),
  productList: z.array(ProductInfoSchema).describe('The list of available products in the store with their categories.'),
});
export type FindMedicinesForSymptomInput = z.infer<
  typeof FindMedicinesForSymptomInputSchema
>;

const FindMedicinesForSymptomOutputSchema = z.object({
  recommendedMedicines: z.array(z.string()).describe('A list of product names recommended for the symptom.'),
});
export type FindMedicinesForSymptomOutput = z.infer<
  typeof FindMedicinesForSymptomOutputSchema
>;

export async function findMedicinesForSymptom(
  input: FindMedicinesForSymptomInput
): Promise<FindMedicinesForSymptomOutput> {
  return findMedicinesForSymptomFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findMedicinesForSymptomPrompt',
  input: {schema: FindMedicinesForSymptomInputSchema},
  output: {schema: FindMedicinesForSymptomOutputSchema},
  prompt: `You are an AI assistant for an online pharmacy. Your task is to recommend relevant over-the-counter products based on a user's described symptom.

  User's symptom: "{{symptom}}"

  Here is the list of available products with their categories:
  {{#each productList}}- Name: {{{this.name}}}, Category: {{{this.category}}}\n{{/each}}

  From the list above, identify which products are suitable for treating the described symptom.

  IMPORTANT:
  - Your recommendations MUST come ONLY from the provided product list.
  - Do NOT recommend any products that require a doctor's prescription. Focus only on over-the-counter solutions for minor ailments (e.g., headache, common cold, allergies, fever).
  - If no products in the list are suitable for the symptom, return an empty array for "recommendedMedicines".

  Return a valid JSON object that conforms to the output schema.
  `,
});

const findMedicinesForSymptomFlow = ai.defineFlow(
  {
    name: 'findMedicinesForSymptomFlow',
    inputSchema: FindMedicinesForSymptomInputSchema,
    outputSchema: FindMedicinesForSymptomOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
