import { z } from "zod";

export const TaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
  documentType: z.string().nullable(),
});

export const JourneySchema = z.object({
  title: z.string(),
  tasks: z.array(TaskSchema).min(1),
});

export type JourneyPlan = z.infer<typeof JourneySchema>;

export const ExtractedFieldSchema = z.object({
  name: z.string(),
  dob: z.string(),
  number: z.string(),
});

export const DocumentValidationSchema = z.object({
  documentType: z.string(),
  extractedFields: ExtractedFieldSchema,
  isValid: z.boolean(),
  issues: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type DocumentValidation = z.infer<typeof DocumentValidationSchema>;

export const SchemeSchema = z.object({
  name: z.string(),
  description: z.string(),
  estimatedBenefit: z.number(),
  eligibilityStatus: z.enum(["ELIGIBLE", "LIKELY", "NEEDS_INFO"]),
});

export const OpportunitySchema = z.object({
  schemes: z.array(SchemeSchema),
  totalEstimatedBenefit: z.number(),
});

export type OpportunityResult = z.infer<typeof OpportunitySchema>;

export const IntentSchema = z.object({
  intent: z.enum([
    "JOURNEY_GOAL",
    "DOCUMENT_QUERY",
    "COMPLAINT",
    "SCHEME_ELIGIBILITY",
    "GENERAL",
  ]),
});

export type ClassifiedIntent = z.infer<typeof IntentSchema>;

export const ClarifyingQuestionSchema = z.object({
  needsClarification: z.boolean(),
  questions: z.array(z.string()),
});

export type ClarifyingQuestions = z.infer<typeof ClarifyingQuestionSchema>;
