import { NextResponse } from "next/server";
import { Brain } from "lucide-react";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { jobsCollection, interviewsCollection } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = (session.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await jobsCollection();
    const interviews = await interviewsCollection();

    // Use aggregation to reduce database calls
    const pipeline = [
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          applied: { $sum: { $cond: [{ $eq: ["$status", "applied"] }, 1, 0] } },
          interview: { $sum: { $cond: [{ $eq: ["$status", "interview"] }, 1, 0] } },
          offer: { $sum: { $cond: [{ $eq: ["$status", "offer"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } }
        }
      }
    ];

    const result = await jobs.aggregate(pipeline).toArray();
    const stats = result[0] || { total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 };
    
    const { total, applied, interview, offer, rejected } = stats;

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


