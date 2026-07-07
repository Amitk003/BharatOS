import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, getUserDocuments, createDocument } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ documents: [] });
    }
    const user = await getOrCreateUser(sessionId);
    const documents = await getUserDocuments(user.id);
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Documents GET error:", error);
    return NextResponse.json({ documents: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "Session required" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;

    if (!file || !name || !type) {
      return NextResponse.json({ error: "File, name, and type required" }, { status: 400 });
    }

    const user = await getOrCreateUser(sessionId);

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const document = await createDocument(
      user.id,
      name,
      type,
      `data:${file.type};base64,${base64}`
    );

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Documents POST error:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
