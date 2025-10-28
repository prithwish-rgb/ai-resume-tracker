import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { jobsCollection } from "@/lib/mongodb";
import { parseJobFromUrlOrText } from "@/lib/utils";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any);
    const userId = (session && typeof session === "object" && "user" in session && (session.user as any)?.id)
      ? (session.user as any).id
      : undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const jobs = await jobsCollection();
    const list = await jobs.find({ userId }).sort({ updatedAt: -1 }).toArray();
    return NextResponse.json({ data: list });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Database connection failed", data: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  const userId =
    session && typeof session === "object" && "user" in session && (session.user as any)?.id
      ? (session.user as any).id
      : undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await req.json();
  const { url, emailText, manual } = payload || {};

  const jobs = await jobsCollection();
  const now = new Date();

  let parsed = { title: manual?.title, company: manual?.company, description: manual?.description, keywords: manual?.keywords || [] } as any;
  let source: "manual" | "url" | "email" = "manual";

  if (url) {
    source = "url";
    try {
      const res = await parseJobFromUrlOrText({ url });
      parsed = res;
    } catch {}
  } else if (emailText) {
    source = "email";
    try {
      const res = await parseJobFromUrlOrText({ text: emailText });
      parsed = res;
    } catch {}
  }

  const doc = {
    userId,
    source,
    url,
    title: parsed.title?.trim(),
    company: parsed.company?.trim(),
    description: parsed.description?.trim(),
    keywords: parsed.keywords || [],
    status: "saved" as const,
    createdAt: now,
    updatedAt: now,
  };

  const inserted = await jobs.insertOne(doc as any);
  return NextResponse.json({ id: inserted.insertedId, data: doc });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions as any);
  const userId =
    session && typeof session === "object" && "user" in session && (session.user as any)?.id
      ? (session.user as any).id
      : undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, updates } = await req.json();
  const jobs = await jobsCollection();
  await jobs.updateOne(
    { _id: new ObjectId(id), userId },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions as any);
  const userId =
    session && typeof session === "object" && "user" in session && (session.user as any)?.id
      ? (session.user as any).id
      : undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const jobs = await jobsCollection();
  await jobs.deleteOne({ _id: new ObjectId(id), userId });
  return NextResponse.json({ success: true });
}


