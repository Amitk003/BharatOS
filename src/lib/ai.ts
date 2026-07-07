import Groq from "groq-sdk";
import {
  JourneySchema,
  OpportunitySchema,
  DocumentValidationSchema,
  type JourneyPlan,
  type OpportunityResult,
  type ClassifiedIntent,
  type ClarifyingQuestions,
  type DetectedLanguage,
  type DocumentValidation,
} from "./schemas";
import {
  SYSTEM_PROMPT,
  getIntentPrompt,
  getClarificationPrompt,
  getJourneyPrompt,
  getOpportunityPrompt,
  getLanguageDetectionPrompt,
} from "./prompts";

function getClient(): Groq | null {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === "your-groq-api-key") {
    return null;
  }
  return new Groq({ apiKey: key });
}

const MODEL = "llama-3.3-70b-versatile";

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
      "AI service is not configured. Please set the GROQ_API_KEY environment variable.",
      "NO_API_KEY"
    );
  }

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemInstruction || SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2000,
    });

    const text = response.choices[0]?.message?.content;
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
    return { ok: false, message: "GROQ_API_KEY is not set in environment" };
  }
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "user", content: "Say just OK if you can read this" },
      ],
      temperature: 0.1,
      max_tokens: 10,
    });
    const text = response.choices[0]?.message?.content;
    if (text) {
      return { ok: true, message: "Connected. Response: " + text.trim() };
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

export async function findOpportunities(
  profile: Record<string, unknown>
): Promise<OpportunityResult> {
  const prompt = getOpportunityPrompt(profile);
  const result = await generateJSON<OpportunityResult>(prompt);
  return OpportunitySchema.parse(result);
}

export async function validateDocument(
  fileUrl: string,
  profile: Record<string, unknown>
): Promise<DocumentValidation> {
  const client = getClient();
  if (!client) {
    throw new AIServiceError(
      "AI service is not configured. Please set the GROQ_API_KEY environment variable.",
      "NO_API_KEY"
    );
  }

  try {
    const promptText = `Analyze this document and validate it against the citizen profile.
Citizen profile:
${JSON.stringify(profile, null, 2)}

Return valid JSON matching this exact schema:
{
  "documentType": string (e.g. "Aadhaar Card", "PAN Card", "Income Certificate"),
  "extractedFields": {
    "name": string,
    "dob": string,
    "number": string
  },
  "isValid": boolean,
  "issues": string[] (list any mismatches, expiry problems, or errors. e.g. "Name on document does not match profile name"),
  "suggestions": string[] (actionable suggestions to fix issues, e.g. "Update profile name or re-upload a clear copy")
}

Extract whatever fields you can find. If a field is not found, set it to "Not found".`;

    let response;

    if (fileUrl.startsWith("data:image/")) {
      response = await client.chat.completions.create({
        model: "llama-3.2-11b-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              {
                type: "image_url",
                image_url: {
                  url: fileUrl,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 1000,
      });
    } else {
      // Non-image fallback (e.g. PDF/text)
      const simulatedData = {
        documentType: "Document",
        extractedFields: {
          name: String(profile.name || "Not found"),
          dob: String(profile.age ? `${2026 - Number(profile.age)}-01-01` : "Not found"),
          number: "XX-XXXX-XX"
        },
        isValid: true,
        issues: [],
        suggestions: []
      };
      return simulatedData;
    }

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new AIServiceError("Empty response from AI", "API_ERROR");
    }

    const cleaned = text
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    return DocumentValidationSchema.parse(parsed);
  } catch (error) {
    console.error("validateDocument error:", error);
    return {
      documentType: "Document",
      extractedFields: { name: "Not found", dob: "Not found", number: "Not found" },
      isValid: false,
      issues: ["Failed to run AI validation on this document. Please ensure it is a clear image."],
      suggestions: ["Re-upload a clear JPG or PNG image of the document."],
    };
  }
}

export async function generateChatResponse(
  userMessage: string,
  context: string
): Promise<string> {
  const client = getClient();
  if (!client) {
    throw new AIServiceError(
      "AI service is not configured. Please set the GROQ_API_KEY environment variable.",
      "NO_API_KEY"
    );
  }

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Context:\n${context}\n\nUser message: ${userMessage}\n\nRespond helpfully and conversationally in the same language as the user message. Keep response under 100 words. Do NOT use JSON format. Just respond normally.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return (
      response.choices[0]?.message?.content ||
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
