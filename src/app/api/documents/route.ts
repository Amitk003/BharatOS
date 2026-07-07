import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateUser,
  getUserDocuments,
  createDocument,
  getProfileData,
  updateDocumentStatus,
  createOrUpdateProfile,
} from "@/lib/db";
import { validateDocument } from "@/lib/ai";

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
    const fileUrl = `data:${file.type};base64,${base64}`;

    // Create document in PENDING state first
    let document = await createDocument(user.id, name, type, fileUrl);

    // Perform AI verification
    try {
      const profile = await getProfileData(user.id);
      const profileObj = (profile || {}) as any;

      const validation = await validateDocument(fileUrl, profileObj);

      // Determine final status
      const status = validation.isValid ? "VERIFIED" : "MISMATCH";
      const issuesStr = validation.issues.length > 0 ? validation.issues.join(", ") : undefined;

      document = await updateDocumentStatus(
        document.id,
        status,
        JSON.stringify(validation.extractedFields),
        issuesStr
      );

      // If document is valid, auto-fill profile details if missing
      if (validation.isValid && validation.extractedFields) {
        const { name: extName, dob } = validation.extractedFields;
        const profileUpdate: Record<string, any> = {};

        // If the user's name is not set, we can update it
        if (extName && extName !== "Not found" && !user.name) {
          const { getPrisma } = await import("@/lib/prisma");
          const prisma = await getPrisma();
          await prisma.user.update({
            where: { id: user.id },
            data: { name: extName },
          });
        }

        // Auto-fill age if not set and date of birth is extracted
        if (dob && dob !== "Not found" && (!profileObj.age || profileObj.age === 0)) {
          // dob is expected to be YYYY-MM-DD or DD/MM/YYYY. Try to extract year.
          let year = NaN;
          if (dob.includes("-")) {
            year = parseInt(dob.split("-")[0]);
          } else if (dob.includes("/")) {
            // Check if year is first or last segment
            const parts = dob.split("/");
            const lastPart = parseInt(parts[parts.length - 1]);
            const firstPart = parseInt(parts[0]);
            if (lastPart > 1900) year = lastPart;
            else if (firstPart > 1900) year = firstPart;
          }

          if (!isNaN(year) && year > 1900) {
            profileUpdate.age = 2026 - year; // Current year is 2026
          }
        }

        // Auto-update hasLand if we uploaded a land document
        if (type === "LAND") {
          profileUpdate.hasLand = true;
        }

        if (Object.keys(profileUpdate).length > 0) {
          await createOrUpdateProfile(user.id, profileUpdate);
        }
      }
    } catch (aiErr) {
      console.error("AI Document Verification failed:", aiErr);
      // Leave as PENDING or set error details
      document = await updateDocumentStatus(
        document.id,
        "PENDING",
        undefined,
        "AI validation failed. Manual review pending."
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Documents POST error:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
