import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { resumesCollection, ResumeBlock } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  const session = await getServerSession(authOptions as any);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const resumes = await resumesCollection();
  const list = await resumes.find({ userId }).sort({ updatedAt: -1 }).toArray();
  return NextResponse.json({ data: list });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, blocks } = await req.json();
  const resumes = await resumesCollection();
  const now = new Date();
  const doc = { userId, name: name || "Untitled Resume", blocks: (blocks || []) as ResumeBlock[], createdAt: now, updatedAt: now };
  const inserted = await resumes.insertOne(doc as any);
  return NextResponse.json({ id: inserted.insertedId, data: doc });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions as any);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, updates } = await req.json();
  const resumes = await resumesCollection();
  await resumes.updateOne({ _id: new ObjectId(id), userId }, { $set: { ...updates, updatedAt: new Date() } } as any);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions as any);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const resumes = await resumesCollection();
  await resumes.deleteOne({ _id: new ObjectId(id), userId } as any);
  return NextResponse.json({ success: true });
}


