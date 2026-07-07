export const SYSTEM_PROMPT = `You are BharatOS, a civic AI assistant for Indian citizens. Your job is to help users accomplish real-life goals by creating step-by-step plans called Journeys. You do NOT give simple answers. You build actionable plans. Always respond in the same language as the user's message. Be helpful, accurate, and practical. If the user writes in Hindi, Tamil, Bengali, or any other Indian language, respond in that same language.`;

export function getLanguageDetectionPrompt(message: string): string {
  return `Detect the language of the following message. Return JSON with fields: "language" (full name), "languageCode" (ISO code like "hi", "ta", "bn", "en"), and "shouldTranslate" (true if not English).

Message: "${message}"

Return only the JSON object, no other text.`;
}

export function getIntentPrompt(message: string): string {
  return `Classify the following user message into exactly one intent.

Message: "${message}"

Return valid JSON with field "intent" which must be one of:
- JOURNEY_GOAL: User wants to accomplish something (start business, get passport, find schemes, apply for something)
- DOCUMENT_QUERY: User asking about documents or uploading files
- COMPLAINT: User wants to report an issue (pothole, water, electricity, road, sanitation)
- SCHEME_ELIGIBILITY: User asking what schemes or benefits they qualify for
- GENERAL: Anything else

Respond ONLY with the JSON object, no other text.`;
}

export function getClarificationPrompt(
  goal: string,
  profile: Record<string, unknown>
): string {
  return `User goal: "${goal}"
User profile: ${JSON.stringify(profile, null, 2)}

Determine if you need more information before creating a journey plan. Ask only essential questions (max 4).

Keep each question very short and direct. Examples: "Your age?" "Your location?" "Land size?" "Budget?"

Return JSON: { "needsClarification": boolean, "questions": string[] }

If profile already has enough details (age, location, occupation), set needsClarification to false.`;
}

export function getJourneyPrompt(
  goal: string,
  profile: Record<string, unknown>
): string {
  const lang = String(profile.language || "en").toLowerCase();
  let langInstruction = "Use English for all task titles and descriptions.";
  if (lang !== "en" && lang !== "english") {
    langInstruction = `Translate the output appropriately. Generate the journey title, task titles, and task descriptions in the citizen's preferred language matching language code "${lang}" (e.g. Hindi if "hi", Tamil if "ta", Bengali if "bn", Marathi if "mr", etc.).`;
  }

  return `Generate a step-by-step civic journey for the following goal.

User goal: "${goal}"
User profile: ${JSON.stringify(profile, null, 2)}

Create a practical journey with ordered tasks that the citizen needs to complete. Each task should be a real government process or document needed.

Return valid JSON matching this exact schema:
{
  "title": string (short journey name, in the user's preferred language),
  "tasks": [
    {
      "title": string (task name, e.g. "Get Aadhaar Updated", in the user's preferred language),
      "description": string (brief what to do, in the user's preferred language),
      "order": number (starting from 1),
      "documentType": string | null (set to document name if task requires a document like "Aadhaar", "PAN", "Income Certificate", etc., otherwise null. ALWAYS write the documentType name in English or common name like "Aadhaar", "PAN", "Income Certificate")
    }
  ]
}

Generate 3-8 tasks. Be realistic about Indian government processes. ${langInstruction}`;
}

export function getDocumentPrompt(
  extractedText: string,
  profile: Record<string, unknown>
): string {
  return `Analyze this extracted document text and validate it against the citizen profile.

Extracted text from document:
"${extractedText}"

Citizen profile:
${JSON.stringify(profile, null, 2)}

Return valid JSON matching this exact schema:
{
  "documentType": string (e.g. "Aadhaar Card", "PAN Card"),
  "extractedFields": {
    "name": string,
    "dob": string,
    "number": string
  },
  "isValid": boolean,
  "issues": string[] (list any mismatches, expiry problems, or errors),
  "suggestions": string[] (actionable suggestions to fix issues)
}

Extract whatever fields you can find. If a field is not found, set it to "Not found".`;
}

export function getOpportunityPrompt(
  profile: Record<string, unknown>
): string {
  return `Given this citizen profile, find Indian government schemes the person likely qualifies for.

Profile:
${JSON.stringify(profile, null, 2)}

Consider schemes like PM Kisan, Mudra Loan, Jan Dhan Yojana, Udyam Registration, PM Awas Yojana, Ayushman Bharat, Sukanya Samriddhi, etc.

Return valid JSON matching this exact schema:
{
  "schemes": [
    {
      "name": string (scheme name),
      "description": string (brief description),
      "estimatedBenefit": number (estimated annual benefit in rupees),
      "eligibilityStatus": "ELIGIBLE" | "LIKELY" | "NEEDS_INFO"
    }
  ],
  "totalEstimatedBenefit": number (sum of all estimated benefits)
}

Return at least 3 schemes if the profile has enough info. Use realistic estimates.`;
}

export function getMessageAnalysisPrompt(
  message: string,
  profile: Record<string, unknown>
): string {
  return `Analyze the following user message and citizen profile.
User message: "${message}"
Citizen profile: ${JSON.stringify(profile, null, 2)}

Perform three analysis steps:
1. Language Detection: Detect the language of the user message. Provide the full language name (e.g. "Hindi", "English"), ISO 2-letter languageCode (e.g. "hi", "en", "ta"), and set shouldTranslate to true if the language is not English.
2. Intent Classification: Classify the intent of the message into one of:
   - "JOURNEY_GOAL": User wants to accomplish a real-life civic goal (e.g. start a dairy farm, register a shop, apply for passport, register a business, etc.).
   - "DOCUMENT_QUERY": User asking about document requirements or uploading files.
   - "COMPLAINT": User reporting a public/infrastructure issue (e.g. pothole, road damage, water supply, electricity cut, garbage).
   - "SCHEME_ELIGIBILITY": User asking what benefits, opportunities or schemes they qualify for.
   - "GENERAL": Normal conversation, greeting, or any other query.
3. Clarification Check: If the intent is "JOURNEY_GOAL" or "SCHEME_ELIGIBILITY", determine if you need more profile details (like age, location state, occupation, land ownership, monthly income) before you can construct a journey plan or find eligible schemes. If the profile already has locationState and age, set needsClarification to false. If you need more info, ask up to 4 essential clarifying questions (short, e.g., "Your age?", "Your state?"). Otherwise, set needsClarification to false and questions to [].

Return valid JSON matching this exact structure:
{
  "language": {
    "name": string,
    "languageCode": string,
    "shouldTranslate": boolean
  },
  "intent": "JOURNEY_GOAL" | "DOCUMENT_QUERY" | "COMPLAINT" | "SCHEME_ELIGIBILITY" | "GENERAL",
  "clarification": {
    "needsClarification": boolean,
    "questions": string[]
  }
}

Respond ONLY with the JSON object, no other text.`;
}
