import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, getUserJourneys, updateTaskStatus, recalculateJourneyProgress } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("session-id")?.value || req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ journeys: [] });
    }
    const user = await getOrCreateUser(sessionId);
    const journeys = await getUserJourneys(user.id);
    return NextResponse.json({ journeys });
  } catch (error) {
    console.error("Journey GET error:", error);
    return NextResponse.json({ journeys: [] });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { taskId, status } = await req.json();
    if (!taskId || !status) {
      return NextResponse.json({ error: "taskId and status required" }, { status: 400 });
    }

    const task = await updateTaskStatus(taskId, status);

    await recalculateJourneyProgress(task.journeyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Journey PATCH error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
