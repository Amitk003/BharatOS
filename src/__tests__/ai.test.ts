import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateDocument } from "@/lib/ai";

const mockChatCompletionsCreate = vi.fn().mockResolvedValue({
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
