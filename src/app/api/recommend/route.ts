import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { resumesCollection } from "@/lib/mongodb";

function scoreMatch(resumeText: string, jobText: string) {
  const text = (resumeText || "").toLowerCase();
  const job = (jobText || "").toLowerCase();
  const keywords = ["javascript","typescript","react","next","node","python","java","sql","aws","docker","kubernetes","graphql","tailwind","css","html"];
  let hits = 0;
  for (const k of keywords) {
    if (job.includes(k) && text.includes(k)) hits += 1;
  }
  const density = hits / Math.max(1, keywords.length);
  if (density >= 0.35) return { verdict: "Strong Match - Apply", score: density } as const;
  if (density >= 0.18) return { verdict: "Potential Reach", score: density } as const;
  return { verdict: "Mismatch - Consider Passing", score: density } as const;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobDescription } = await req.json();
  if (!jobDescription) return NextResponse.json({ error: "Missing jobDescription" }, { status: 400 });

  const resumes = await resumesCollection();
  const primary = await resumes.findOne({ userId }, { sort: { updatedAt: -1 } } as any);
  const resumeText = (primary?.blocks || []).map(b => b.content).join("\n\n");
  const result = scoreMatch(resumeText, jobDescription);
  return NextResponse.json(result);
}


