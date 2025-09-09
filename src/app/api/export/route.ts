import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { jobsCollection, resumesCollection, interviewsCollection, debriefsCollection } from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authOptions as any);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [jobs, resumes, interviews, debriefs] = await Promise.all([
    (await jobsCollection()).find({ userId }).toArray(),
    (await resumesCollection()).find({ userId }).toArray(),
    (await interviewsCollection()).find({ userId }).toArray(),
    (await debriefsCollection()).find({ userId }).toArray(),
  ]);

  const payload = { userId, exportedAt: new Date().toISOString(), jobs, resumes, interviews, debriefs };
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=resume-tracker-export.json",
    },
  });
}


