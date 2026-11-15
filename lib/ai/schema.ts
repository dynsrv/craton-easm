import { z } from 'zod';
import { CATEGORIES, SEVERITIES } from '../types';

const Bilingual = z.object({
  en: z.string().describe('English'),
  id: z.string().describe('Bahasa Indonesia, natural business register, same meaning as the English'),
});

export const AssetTriageSchema = z.object({
  hostname: z.string().describe('Exactly the hostname from the input, unchanged'),
  category: z.enum(CATEGORIES),
  severity: z.enum(SEVERITIES),
  exposureReasoning: Bilingual.describe('1-2 sentences: why an attacker cares about THIS asset, citing the observed evidence'),
  remediationStep: Bilingual.describe('One concrete action an IT engineer can do this week. Name the control, port, header or setting.'),
});

export const TriageBatchSchema = z.object({
  assets: z.array(AssetTriageSchema),
});

export const ExecutiveBriefSchema = z.object({
  summary: Bilingual.describe('2-3 sentences for a CTO or Head of IT. Plain language, no jargon.'),
  topFixes: z
    .array(
      z.object({
        title: Bilingual.describe('Imperative, under 12 words'),
        detail: Bilingual.describe('1-2 sentences: what to do and what risk it removes'),
        hostnames: z.array(z.string()).describe('Affected hostnames from the input'),
      }),
    )
    .describe('Exactly the 3 actions that remove the most risk, most urgent first'),
});

export type AssetTriage = z.infer<typeof AssetTriageSchema>;
