import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

import { generateInterviewPrep } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = (session as any)?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { jobDescription, resumeBlocks } = await req.json();
  if (!jobDescription) return NextResponse.json({ error: "Missing jobDescription" }, { status: 400 });
  const resumeText = (resumeBlocks || []).map((b: any) => b.content).join("\n");
  
  try {
    const q = await generateInterviewPrep(jobDescription, resumeText);
    const technical = Array.isArray(q.technical) ? q.technical : [];
    const behavioral = Array.isArray(q.behavioral) ? q.behavioral : [];
    const systemDesign = Array.isArray(q.systemDesign) ? q.systemDesign : [];
    
    const ttsPrompt = `You are the interviewer. Ask the following questions one by one, waiting for answers, and provide concise feedback after each answer. Questions: ${[...technical, ...behavioral, ...systemDesign].join(" | ")}`;
    return NextResponse.json({ technical, behavioral, systemDesign, ttsPrompt });
  } catch (error) {
    console.error("Interview prep error:", error);
    return NextResponse.json({ error: "Failed to generate interview prep" }, { status: 500 });
  }
}


