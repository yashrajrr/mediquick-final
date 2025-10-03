'use server';
import { config } from 'dotenv';
config();

import './flows/check-for-drug-interactions.ts';
import './flows/extract-prescription-information.ts';
import './flows/symptom-checker.ts';
import './flows/find-medicines-for-symptom.ts';
import './flows/moderate-message.ts';
