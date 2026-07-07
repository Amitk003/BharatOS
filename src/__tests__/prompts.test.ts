import { describe, it, expect } from "vitest";
import {
  SYSTEM_PROMPT,
  getIntentPrompt,
  getClarificationPrompt,
  getJourneyPrompt,
  getDocumentPrompt,
  getOpportunityPrompt,
  getLanguageDetectionPrompt,
  getMessageAnalysisPrompt,
} from "@/lib/prompts";

describe("SYSTEM_PROMPT", () => {
  it("mentions Journeys as the core concept", () => {
    expect(SYSTEM_PROMPT).toContain("Journeys");
  });

  it("instructs responding in user language", () => {
    expect(SYSTEM_PROMPT.toLowerCase()).toContain("language");
  });
});

describe("getIntentPrompt", () => {
  it("includes the user message in the prompt", () => {
    const prompt = getIntentPrompt("I want to start a business");
    expect(prompt).toContain("I want to start a business");
  });

  it("lists all valid intents", () => {
    const prompt = getIntentPrompt("test");
    expect(prompt).toContain("JOURNEY_GOAL");
    expect(prompt).toContain("DOCUMENT_QUERY");
    expect(prompt).toContain("COMPLAINT");
    expect(prompt).toContain("SCHEME_ELIGIBILITY");
    expect(prompt).toContain("GENERAL");
  });
});

describe("getJourneyPrompt", () => {
  it("includes user goal in the prompt", () => {
    const prompt = getJourneyPrompt("start a dairy farm", { age: 30, locationState: "UP" });
    expect(prompt).toContain("start a dairy farm");
  });

  it("includes profile in the prompt", () => {
    const prompt = getJourneyPrompt("test", { age: 25, locationState: "Maharashtra" });
    expect(prompt).toContain("Maharashtra");
  });

  it("asks for JSON output with task schema", () => {
    const prompt = getJourneyPrompt("test", {});
    expect(prompt).toContain("tasks");
    expect(prompt).toContain("documentType");
  });
});

describe("getDocumentPrompt", () => {
  it("includes extracted text in prompt", () => {
    const prompt = getDocumentPrompt("Name: Amit", { age: 30 });
    expect(prompt).toContain("Name: Amit");
  });

  it("asks for validation fields", () => {
    const prompt = getDocumentPrompt("test", {});
    expect(prompt).toContain("isValid");
    expect(prompt).toContain("issues");
    expect(prompt).toContain("suggestions");
  });
});

describe("getOpportunityPrompt", () => {
  it("includes profile in the prompt", () => {
    const prompt = getOpportunityPrompt({ age: 60, occupation: "farmer", locationState: "Punjab" });
    expect(prompt).toContain("Punjab");
    expect(prompt).toContain("farmer");
  });

  it("limits to at least 3 schemes", () => {
    const prompt = getOpportunityPrompt({});
    expect(prompt).toContain("3");
  });
});

describe("getLanguageDetectionPrompt", () => {
  it("includes the message to detect", () => {
    const prompt = getLanguageDetectionPrompt("Namaste, main ek business shuru karna chahta hoon");
    expect(prompt).toContain("Namaste");
  });

  it("asks for languageCode field", () => {
    const prompt = getLanguageDetectionPrompt("test");
    expect(prompt).toContain("languageCode");
  });
});

describe("getClarificationPrompt", () => {
  it("asks for clarification questions", () => {
    const prompt = getClarificationPrompt("I want a passport", { age: 0 });
    expect(prompt).toContain("needsClarification");
    expect(prompt).toContain("questions");
  });
});

describe("getMessageAnalysisPrompt", () => {
  it("contains user message and asks for language, intent, and clarification", () => {
    const prompt = getMessageAnalysisPrompt("Help me apply for Mudra loan", { age: 25 });
    expect(prompt).toContain("Mudra loan");
    expect(prompt).toContain("language");
    expect(prompt).toContain("intent");
    expect(prompt).toContain("clarification");
  });
});
