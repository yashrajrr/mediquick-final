'use server';

/**
 * @fileOverview A simple AI symptom checker.
 * - symptomCheck - A function that provides a basic medical assessment based on user symptoms.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const prompt = ai.definePrompt({
  name: 'symptomCheckPrompt',
  input: {schema: z.string()},
  output: {schema: z.string()},
  prompt: `You are a helpful AI medical assistant. A user is asking for advice about their symptoms.
  
  IMPORTANT: You must provide a disclaimer that you are not a real doctor and that this is not medical advice. The user should consult a real healthcare professional for any medical concerns.
  
  User message: {{{input}}}
  
  Provide a helpful, conversational response that gives some general information but strongly encourages them to see a doctor.
  `,
});

export async function symptomCheck(input: string): Promise<string> {
    const {output} = await prompt(input);
    return output!;
}
