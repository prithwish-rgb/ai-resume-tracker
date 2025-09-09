import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { resumesCollection, ResumeBlock } from "@/lib/mongodb";

function pickBlocks(blocks: ResumeBlock[], jobDescription: string) {
  const jd = jobDescription.toLowerCase();
  const scored = blocks.map(b => {
    const content = (b.content || "").toLowerCase();
    const overlap = ["javascript","typescript","react","next","node","python","sql","aws","docker","kubernetes","graphql","css","html"]
      .reduce((acc, k) => acc + (jd.includes(k) && content.includes(k) ? 1 : 0), 0);
    return { block: b, overlap };
  });
  scored.sort((a,b) => b.overlap - a.overlap);
  return scored.slice(0, 12).map(s => s.block);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { jobDescription } = await req.json();
  if (!jobDescription) return NextResponse.json({ error: "Missing jobDescription" }, { status: 400 });
  const resumes = await resumesCollection();
  const primary = await resumes.findOne({ userId }, { sort: { updatedAt: -1 } } as any);
  const tailored = pickBlocks(primary?.blocks || [], jobDescription);
  return NextResponse.json({ name: `${primary?.name || "Resume"} (Tailored)`, blocks: tailored });
}


