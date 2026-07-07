import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, getProfileData } from "@/lib/db";
import { findOpportunities } from "@/lib/ai";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ opportunities: null });
    }

    const user = await getOrCreateUser(sessionId);
    const profile = await getProfileData(user.id);

    if (!profile) {
      return NextResponse.json({ opportunities: null });
    }

    const opportunities = await findOpportunities(profile as Record<string, unknown>);

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error("Opportunities error:", error);
    return NextResponse.json({ opportunities: null });
  }
}
