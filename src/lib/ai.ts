import { GoogleGenAI } from "@google/genai";
import {
  JourneySchema,
  DocumentValidationSchema,
  OpportunitySchema,
  IntentSchema,
  ClarifyingQuestionSchema,
  LanguageSchema,
  type JourneyPlan,
  type DocumentValidation,
  type OpportunityResult,
  type ClassifiedIntent,
  type ClarifyingQuestions,
  type DetectedLanguage,
} from "./schemas";
import {
  SYSTEM_PROMPT,
  getIntentPrompt,
  getClarificationPrompt,
  getJourneyPrompt,
  getDocumentPrompt,
  getOpportunityPrompt,
  getLanguageDetectionPrompt,
} from "./prompts";

function getClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "your-google-gemini-api-key") {
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
}

const MODEL = "gemini-2.0-flash";

class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NO_API_KEY" | "API_ERROR" | "PARSE_ERROR",
    public readonly detail?: string
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

async function generateJSON<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const client = getClient();
  if (!client) {
    throw new AIServiceError(
      "AI service is not configured. Please set the GEMINI_API_KEY environment variable.",
      "NO_API_KEY"
    );
  }

  try {
    const response = await client.models.generateContent({
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
      throw new AIServiceError("Empty response from AI", "API_ERROR");
    }

    const cleaned = text
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    const msg = error instanceof Error ? error.message : String(error);
    throw new AIServiceError(
      "Failed to get response from AI service",
      "API_ERROR",
      msg
    );
  }
}

export async function testConnection(): Promise<{
  ok: boolean;
  message: string;
}> {
  const client = getClient();
  if (!client) {
    return { ok: false, message: "GEMINI_API_KEY is not set in environment" };
  }
  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: "Say just OK if you can read this",
      config: { temperature: 0.1 },
    });
    if (response.text) {
      return { ok: true, message: "Connected. Response: " + response.text };
    }
    return { ok: false, message: "Empty response from API" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { ok: false, message: "API error: " + msg };
  }
}

export async function detectLanguage(
  message: string
): Promise<DetectedLanguage> {
  const prompt = getLanguageDetectionPrompt(message);
  return generateJSON<DetectedLanguage>(prompt);
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
  const client = getClient();
  if (!client) {
    throw new AIServiceError(
      "AI service is not configured. Please set the GEMINI_API_KEY environment variable.",
      "NO_API_KEY"
    );
  }

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Context:\n${context}\n\nUser message: ${userMessage}\n\nRespond helpfully and conversationally in the same language as the user message. Keep response under 100 words.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return (
      response.text ||
      "I could not process that. Please try again."
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new AIServiceError(
      "Failed to get response from AI service",
      "API_ERROR",
      msg
    );
  }
}
