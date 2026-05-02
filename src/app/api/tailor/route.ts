import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { resumesCollection, ResumeBlock } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

import { tailorResumeBlocks } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = (session as any)?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { jobDescription, baseResumeId } = await req.json();
  if (!jobDescription) return NextResponse.json({ error: "Missing jobDescription" }, { status: 400 });
  
  const resumes = await resumesCollection();
  
  let primary;
  if (baseResumeId) {
    primary = await resumes.findOne({ _id: new ObjectId(baseResumeId), userId } as any);
  } else {
    primary = await resumes.findOne({ userId }, { sort: { updatedAt: -1 } } as any);
  }

  if (!primary) {
    return NextResponse.json({ error: "No base resume found" }, { status: 404 });
  }

  try {
    const tailoredBlocks = await tailorResumeBlocks(primary.blocks || [], jobDescription);
    return NextResponse.json({ name: `${primary.name} (Tailored)`, blocks: tailoredBlocks });
  } catch (error) {
    console.error("Tailor error:", error);
    return NextResponse.json({ error: "Failed to tailor resume" }, { status: 500 });
  }
}


