import { NextRequest, NextResponse } from "next/server";
import {
  classifyIntent,
  detectLanguage,
  getClarifyingQuestions,
  generateJourney,
  generateChatResponse,
} from "@/lib/ai";
import {
  getOrCreateUser,
  createOrUpdateProfile,
  getProfileData,
  createJourney,
} from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Message and sessionId are required" },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(sessionId);

    let profile = await getProfileData(user.id);

    const langInfo = await detectLanguage(message);

    if (langInfo.shouldTranslate) {
      await createOrUpdateProfile(user.id, {
        language: langInfo.languageCode,
      });
    }

    const intent = await classifyIntent(message);

    if (intent.intent === "JOURNEY_GOAL") {
      if (!profile || !profile.locationState || !profile.age) {
        const clarification = await getClarifyingQuestions(
          message,
          (profile as Record<string, unknown>) || {}
        );

        if (clarification.needsClarification) {
          return NextResponse.json({
            message: clarification.questions.join("\n"),
            clarifyingQuestions: clarification.questions,
          });
        }
      }

      const journeyPlan = await generateJourney(message, {
        ...(profile || {}),
        goal: message,
      } as Record<string, unknown>);

      const journey = await createJourney(
        user.id,
        journeyPlan.title,
        null,
        journeyPlan.tasks.map((t) => ({
          title: t.title,
          description: t.description,
          order: t.order,
          documentType: t.documentType,
        }))
      );

      const taskList = journey.tasks
        .map((t) => `${t.order}. ${t.title}`)
        .join("\n");

      return NextResponse.json({
        message: `I have created a journey for you: **${journey.title}**\n\nHere are the steps:\n${taskList}\n\nYou can track your progress on the Dashboard.`,
        journeyId: journey.id,
      });
    }

    if (intent.intent === "COMPLAINT") {
      return NextResponse.json({
        message:
          "I can help you report a civic issue. Please go to the Cases page to file a complaint with details and location.",
        redirectTo: "/cases",
      });
    }

    if (intent.intent === "SCHEME_ELIGIBILITY") {
      if (!profile) {
        const clarification = await getClarifyingQuestions(message, {});
        return NextResponse.json({
          message: clarification.questions.join("\n"),
          clarifyingQuestions: clarification.questions,
        });
      }

      return NextResponse.json({
        message:
          "I am checking which schemes you qualify for. Please visit the Dashboard to see your opportunities.",
        redirectTo: "/dashboard",
      });
    }

    const context = profile
      ? `User profile: ${JSON.stringify(profile)}`
      : "New user, no profile yet";

    const response = await generateChatResponse(message, context);

    return NextResponse.json({
      message: response,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);

    if (error?.code === "NO_API_KEY") {
      return NextResponse.json(
        {
          message:
            "BharatOS AI is not configured yet. Please set the GROQ_API_KEY environment variable to enable AI features. You can get a key from https://console.groq.com",
        },
        { status: 200 }
      );
    }

    const detail = error?.detail || error?.message || "Unknown error";
    console.error("Chat error detail:", detail);

    return NextResponse.json(
      {
        message: `AI service error: ${detail}. Check that your GROQ_API_KEY is valid.`,
      },
      { status: 200 }
    );
  }
}
