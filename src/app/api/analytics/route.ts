import { NextResponse } from "next/server";
import { Brain } from "lucide-react";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { jobsCollection, interviewsCollection } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any);
    const userId = (session && typeof session === "object" && "user" in session && session.user && typeof session.user === "object" && "id" in session.user)
      ? (session.user as any).id
      : undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jobs = await jobsCollection();
    const interviews = await interviewsCollection();

    const total = await jobs.countDocuments({ userId });
    const applied = await jobs.countDocuments({ userId, status: "applied" });
    const interview = await jobs.countDocuments({ userId, status: "interview" });
    const offer = await jobs.countDocuments({ userId, status: "offer" });
    const rejected = await jobs.countDocuments({ userId, status: "rejected" });

    const appToInterviewRate = total ? (interview / Math.max(1, applied)) : 0;

    return NextResponse.json({
      totals: { total, applied, interview, offer, rejected },
      metrics: {
        applicationToInterviewRate: appToInterviewRate,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({
      totals: { total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 },
      metrics: { applicationToInterviewRate: 0 },
    }, { status: 500 });
  }
}


