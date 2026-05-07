import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { generateInterviewQuestions, isAIEnabled, AIDisabledError } from "@/lib/ai";

async function getUID() {
  const session = await getServerSession(authOptions as never);
  return (session as { user?: { id?: string } } | null)?.user?.id ?? null;
}

export async function POST(req: Request) {
  try {
    const uid = await getUID();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobDescription, resumeBlocks, numQuestions } = await req.json();
    if (!jobDescription?.trim())
      return NextResponse.json({ error: "jobDescription is required" }, { status: 400 });

    const resumeText = Array.isArray(resumeBlocks)
      ? (resumeBlocks as { type: string; content: string }[])
          .map(b => `[${b.type?.toUpperCase()}]\n${b.content}`)
          .join("\n\n")
      : "";

    const n      = Math.min(Math.max(parseInt(numQuestions ?? "5", 10), 1), 15);
    const result = await generateInterviewQuestions(jobDescription, resumeText, n);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof AIDisabledError)
      return NextResponse.json({ error: e.message, aiEnabled: false }, { status: 503 });
    console.error("[interview.prepare.POST]", e);
    return NextResponse.json({ error: (e as Error).message || "Generation failed", aiEnabled: isAIEnabled() }, { status: 500 });
  }
}
