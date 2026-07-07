import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateDocument, analyzeMessage } from "@/lib/ai";

const mockChatCompletionsCreate = vi.fn().mockImplementation(async (args) => {
  const userMessage = args.messages[args.messages.length - 1];
  const prompt = typeof userMessage.content === "string" 
    ? userMessage.content 
    : userMessage.content[0]?.text || "";

  if (prompt.includes("Analyze this document")) {
    return {
      choices: [
        {
          message: {
            content: JSON.stringify({
              documentType: "Aadhaar Card",
              extractedFields: {
                name: "Amit Kumar",
                dob: "1995-01-15",
                number: "1234-5678-9012",
              },
              isValid: true,
              issues: [],
              suggestions: [],
            }),
          },
        },
      ],
    };
  }

  if (prompt.includes("Analyze the following user message")) {
    return {
      choices: [
        {
          message: {
            content: JSON.stringify({
              language: {
                name: "Hindi",
                languageCode: "hi",
                shouldTranslate: true,
              },
              intent: "JOURNEY_GOAL",
              clarification: {
                needsClarification: true,
                questions: ["State?"],
              },
            }),
          },
        },
      ],
    };
  }

  return {
    choices: [
      {
        message: {
          content: "{}",
        },
      },
    ],
  };
});

vi.mock("groq-sdk", () => {
  return {
    default: class MockGroq {
      chat = {
        completions: {
          create: mockChatCompletionsCreate,
        },
      };
    },
  };
});

describe("validateDocument", () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = "mock-key";
  });

  it("handles non-image documents with fallback simulation", async () => {
    const result = await validateDocument("data:application/pdf;base64,aaaa", {
      name: "Amit Kumar",
      age: 31,
    });
    expect(result.documentType).toBe("Document");
    expect(result.isValid).toBe(true);
    expect(result.extractedFields.name).toBe("Amit Kumar");
  });

  it("sends image documents to AI vision service and extracts correct validation structure", async () => {
    const result = await validateDocument("data:image/png;base64,aaaa", {
      name: "Amit Kumar",
      age: 31,
    });
    expect(result.documentType).toBe("Aadhaar Card");
    expect(result.isValid).toBe(true);
    expect(result.extractedFields.name).toBe("Amit Kumar");
    expect(result.extractedFields.dob).toBe("1995-01-15");
  });
});

describe("analyzeMessage", () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = "mock-key";
  });

  it("sends chat message to analysis and extracts intent and language details", async () => {
    const result = await analyzeMessage("Mera naam Amit hai", {});
    expect(result.intent).toBe("JOURNEY_GOAL");
    expect(result.language.name).toBe("Hindi");
    expect(result.language.languageCode).toBe("hi");
    expect(result.language.shouldTranslate).toBe(true);
    expect(result.clarification.needsClarification).toBe(true);
    expect(result.clarification.questions).toContain("State?");
  });
});
