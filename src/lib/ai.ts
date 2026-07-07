import { GoogleGenAI } from "@google/genai";
import {
  JourneySchema,
  DocumentValidationSchema,
  OpportunitySchema,
  IntentSchema,
  ClarifyingQuestionSchema,
  type JourneyPlan,
  type DocumentValidation,
  type OpportunityResult,
  type ClassifiedIntent,
  type ClarifyingQuestions,
} from "./schemas";
import {
  SYSTEM_PROMPT,
  getIntentPrompt,
  getClarificationPrompt,
  getJourneyPrompt,
  getDocumentPrompt,
  getOpportunityPrompt,
} from "./prompts";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

const MODEL = "gemini-2.0-flash";

async function generateJSON<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const response = await genAI.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction || SYSTEM_PROMPT,
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from AI");
  }

  const cleaned = text
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(cleaned);
}

export async function classifyIntent(
  message: string
): Promise<ClassifiedIntent> {
  const prompt = getIntentPrompt(message);
  return generateJSON<ClassifiedIntent>(prompt);
}

export async function getClarifyingQuestions(
  goal: string,
  profile: Record<string, unknown>
): Promise<ClarifyingQuestions> {
  const prompt = getClarificationPrompt(goal, profile);
  return generateJSON<ClarifyingQuestions>(prompt);
}

export async function generateJourney(
  goal: string,
  profile: Record<string, unknown>
): Promise<JourneyPlan> {
  const prompt = getJourneyPrompt(goal, profile);
  const result = await generateJSON<JourneyPlan>(prompt);
  return JourneySchema.parse(result);
}

export async function validateDocument(
  extractedText: string,
  profile: Record<string, unknown>
): Promise<DocumentValidation> {
  const prompt = getDocumentPrompt(extractedText, profile);
  const result = await generateJSON<DocumentValidation>(prompt);
  return DocumentValidationSchema.parse(result);
}

export async function findOpportunities(
  profile: Record<string, unknown>
): Promise<OpportunityResult> {
  const prompt = getOpportunityPrompt(profile);
  const result = await generateJSON<OpportunityResult>(prompt);
  return OpportunitySchema.parse(result);
}

export async function generateChatResponse(
  userMessage: string,
  context: string
): Promise<string> {
  const response = await genAI.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Context:\n${context}\n\nUser message: ${userMessage}\n\nRespond helpfully and conversationally. Keep response under 100 words.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
    },
  });

  return response.text || "I could not process that. Please try again.";
}
