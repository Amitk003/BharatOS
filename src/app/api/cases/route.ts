import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, getUserCases, createCivicCase } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ cases: [] });
    }
    const user = await getOrCreateUser(sessionId);
    const cases = await getUserCases(user.id);
    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Cases GET error:", error);
    return NextResponse.json({ cases: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "Session required" }, { status: 401 });
    }

    const { title, description, category } = await req.json();
    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }

    const user = await getOrCreateUser(sessionId);
    const civicCase = await createCivicCase(user.id, title, description, category);

    return NextResponse.json({ case: civicCase });
  } catch (error) {
    console.error("Cases POST error:", error);
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
  }
}
