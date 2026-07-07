import { describe, it, expect } from "vitest";
import {
  JourneySchema,
  TaskSchema,
  DocumentValidationSchema,
  OpportunitySchema,
  IntentSchema,
  ClarifyingQuestionSchema,
  LanguageSchema,
} from "@/lib/schemas";

describe("TaskSchema", () => {
  it("accepts a valid task", () => {
    const task = {
      title: "Get Aadhaar Updated",
      description: "Visit the nearest Aadhaar center",
      order: 1,
      documentType: "Aadhaar",
    };
    expect(() => TaskSchema.parse(task)).not.toThrow();
  });

  it("rejects a task without title", () => {
    const task = {
      description: "Visit the nearest Aadhaar center",
      order: 1,
      documentType: null,
    };
    expect(() => TaskSchema.parse(task)).toThrow();
  });

  it("rejects a task with negative order", () => {
    const task = {
      title: "Test",
      description: "Test description",
      order: -1,
      documentType: null,
    };
    expect(() => TaskSchema.parse(task)).toThrow();
  });

  it("accepts null documentType", () => {
    const task = {
      title: "Apply Online",
      description: "Fill the online form",
      order: 2,
      documentType: null,
    };
    const result = TaskSchema.parse(task);
    expect(result.documentType).toBeNull();
  });
});

describe("JourneySchema", () => {
  it("accepts a valid journey with multiple tasks", () => {
    const journey = {
      title: "Start a Dairy Business",
      tasks: [
        { title: "Get Aadhaar", description: "Update Aadhaar", order: 1, documentType: "Aadhaar" },
        { title: "Open Bank Account", description: "Open Jan Dhan account", order: 2, documentType: null },
        { title: "Apply for Loan", description: "Apply for Mudra loan", order: 3, documentType: "Income Certificate" },
      ],
    };
    expect(() => JourneySchema.parse(journey)).not.toThrow();
  });

  it("rejects a journey with empty tasks", () => {
    const journey = {
      title: "Empty Journey",
      tasks: [],
    };
    expect(() => JourneySchema.parse(journey)).toThrow();
  });

  it("rejects a journey without title", () => {
    const journey = {
      tasks: [{ title: "Task 1", description: "Desc", order: 1, documentType: null }],
    };
    expect(() => JourneySchema.parse(journey)).toThrow();
  });
});

describe("DocumentValidationSchema", () => {
  const validValidation = {
    documentType: "Aadhaar Card",
    extractedFields: {
      name: "Amit Kumar",
      dob: "15/01/1995",
      number: "1234-5678-9012",
    },
    isValid: true,
    issues: [],
    suggestions: [],
  };

  it("accepts a valid document validation", () => {
    expect(() => DocumentValidationSchema.parse(validValidation)).not.toThrow();
  });

  it("accepts a validation with issues", () => {
    const withIssues = {
      ...validValidation,
      isValid: false,
      issues: ["Name mismatch with profile"],
      suggestions: ["Update name in Aadhaar to match PAN"],
    };
    expect(() => DocumentValidationSchema.parse(withIssues)).not.toThrow();
  });
});

describe("OpportunitySchema", () => {
  it("accepts a valid opportunity result", () => {
    const opp = {
      schemes: [
        { name: "PM Kisan", description: "Income support for farmers", estimatedBenefit: 6000, eligibilityStatus: "ELIGIBLE" },
        { name: "Mudra Loan", description: "Loan for small business", estimatedBenefit: 50000, eligibilityStatus: "LIKELY" },
      ],
      totalEstimatedBenefit: 56000,
    };
    expect(() => OpportunitySchema.parse(opp)).not.toThrow();
  });

  it("rejects invalid eligibility status", () => {
    const opp = {
      schemes: [
        { name: "PM Kisan", description: "Test", estimatedBenefit: 6000, eligibilityStatus: "INVALID" },
      ],
      totalEstimatedBenefit: 6000,
    };
    expect(() => OpportunitySchema.parse(opp)).toThrow();
  });
});

describe("IntentSchema", () => {
  it("accepts valid intents", () => {
    const validIntents = ["JOURNEY_GOAL", "DOCUMENT_QUERY", "COMPLAINT", "SCHEME_ELIGIBILITY", "GENERAL"];
    for (const intent of validIntents) {
      expect(() => IntentSchema.parse({ intent })).not.toThrow();
    }
  });

  it("rejects invalid intent", () => {
    expect(() => IntentSchema.parse({ intent: "INVALID" })).toThrow();
  });
});

describe("ClarifyingQuestionSchema", () => {
  it("accepts a clarification with questions", () => {
    const data = {
      needsClarification: true,
      questions: ["What is your age?", "Which state do you live in?"],
    };
    expect(() => ClarifyingQuestionSchema.parse(data)).not.toThrow();
  });

  it("accepts no clarification needed", () => {
    const data = {
      needsClarification: false,
      questions: [],
    };
    expect(() => ClarifyingQuestionSchema.parse(data)).not.toThrow();
  });
});

describe("LanguageSchema", () => {
  it("accepts Hindi language detection", () => {
    const lang = {
      language: "Hindi",
      languageCode: "hi",
      shouldTranslate: true,
    };
    expect(() => LanguageSchema.parse(lang)).not.toThrow();
  });

  it("accepts English (no translation needed)", () => {
    const lang = {
      language: "English",
      languageCode: "en",
      shouldTranslate: false,
    };
    expect(() => LanguageSchema.parse(lang)).not.toThrow();
  });
});
