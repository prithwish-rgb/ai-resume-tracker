import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

function generateQuestions(jobDescription: string, resumeText: string) {
  const jd = jobDescription.toLowerCase();
  const tech = ["javascript","typescript","react","next","node","python","sql","aws","docker","kubernetes","graphql"];
  const techInRole = tech.filter(t => jd.includes(t));
  const technical = techInRole.slice(0, 6).map(t => `Deep dive: Tell me about a time you used ${t} to solve a challenging problem. What was the impact?`);
  const behavioral = [
    "Tell me about a project you’re most proud of. What was your specific contribution?",
    "Describe a time you managed conflicting priorities. How did you decide what to do first?",
    "Tell me about a failure. What did you learn and what changed afterward?",
  ];
  const systemDesign = [
    "Design a scalable job tracking system for thousands of users. Discuss data model, APIs, and scaling.",
  ];
  return { technical, behavioral, systemDesign };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!((session?.user as any)?.id)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { jobDescription, resumeBlocks } = await req.json();
  if (!jobDescription) return NextResponse.json({ error: "Missing jobDescription" }, { status: 400 });
  const resumeText = (resumeBlocks || []).map((b: any) => b.content).join("\n");
  const q = generateQuestions(jobDescription, resumeText);
  const ttsPrompt = `You are the interviewer. Ask the following questions one by one, waiting for answers, and provide concise feedback after each answer. Questions: ${[...q.technical, ...q.behavioral, ...q.systemDesign].join(" | ")}`;
  return NextResponse.json({ ...q, ttsPrompt });
}


