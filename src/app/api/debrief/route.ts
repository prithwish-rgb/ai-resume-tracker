import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { debriefsCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const col = await debriefsCollection();
  const list = await col.find({ userId }).sort({ updatedAt: -1 }).toArray();
  return NextResponse.json({ data: list });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { jobId, interviewers, questions, sentiment, notes } = await req.json();
  const col = await debriefsCollection();
  const now = new Date();
  const doc = { userId, jobId, interviewers, questions, sentiment, notes, createdAt: now, updatedAt: now } as any;
  const inserted = await col.insertOne(doc);
  return NextResponse.json({ id: inserted.insertedId, data: doc });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, updates } = await req.json();
  const col = await debriefsCollection();
  await col.updateOne({ _id: new ObjectId(id), userId }, { $set: { ...updates, updatedAt: new Date() } } as any);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  const col = await debriefsCollection();
  await col.deleteOne({ _id: new ObjectId(id), userId } as any);
  return NextResponse.json({ success: true });
}


