import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, createOrUpdateProfile, getProfileData } from "@/lib/db";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ profile: null }, { status: 401 });
    }
    const user = await getOrCreateUser(sessionId);
    const profile = await getProfileData(user.id);
    return NextResponse.json({
      profile,
      user: {
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "Session required" }, { status: 401 });
    }
    const body = await req.json();
    const user = await getOrCreateUser(sessionId);

    // Update user name if provided
    if (body.name !== undefined) {
      const prisma = await getPrisma();
      await prisma.user.update({
        where: { id: user.id },
        data: { name: body.name },
      });
    }

    // Update profile
    const profileData = {
      age: body.age !== undefined ? Number(body.age) : undefined,
      occupation: body.occupation || null,
      monthlyIncome: body.monthlyIncome !== undefined ? Number(body.monthlyIncome) : undefined,
      education: body.education || null,
      disabilityStatus: body.disabilityStatus === true,
      maritalStatus: body.maritalStatus || "Single",
      locationState: body.locationState || null,
      hasLand: body.hasLand === true,
      language: body.language || "en",
    };

    const profile = await createOrUpdateProfile(user.id, profileData);
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Profile POST error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
