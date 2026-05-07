import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { resumesCollection } from "@/lib/mongodb";
import { tailorResume, isAIEnabled, AIDisabledError } from "@/lib/ai";

async function getUID() {
  const session = await getServerSession(authOptions as never);
  return (session as { user?: { id?: string } } | null)?.user?.id ?? null;
}

export async function POST(req: Request) {
  try {
    const uid = await getUID();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobDescription } = await req.json();
    if (!jobDescription?.trim())
      return NextResponse.json({ error: "jobDescription is required" }, { status: 400 });

    const col     = await resumesCollection();
    const primary = await col.findOne({ userId: uid } as never, { sort: { updatedAt: -1 } } as never) as { blocks?: { type: string; content: string; tags?: string[] }[]; name?: string } | null;

    if (!primary?.blocks?.length)
      return NextResponse.json({ error: "No resume found. Build one in Resume Builder first." }, { status: 404 });

    const resumeText = primary.blocks
      .map(b => `[${b.type.toUpperCase()}]\n${b.content}`)
      .join("\n\n");

    const result = await tailorResume(resumeText, jobDescription);
    return NextResponse.json({ ...result, sourceName: primary.name ?? "Resume" });
  } catch (e) {
    if (e instanceof AIDisabledError)
      return NextResponse.json({ error: e.message, aiEnabled: false }, { status: 503 });
    console.error("[tailor.POST]", e);
    return NextResponse.json({ error: (e as Error).message || "Tailoring failed", aiEnabled: isAIEnabled() }, { status: 500 });
  }
}
