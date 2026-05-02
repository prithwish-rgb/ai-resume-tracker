import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { jobsCollection } from "@/lib/mongodb";
import { parseJobFromUrlOrText } from "@/lib/utils";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any);
    const userId = (session as any)?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const jobs = await jobsCollection();
    const list = await jobs.find({ userId }).sort({ updatedAt: -1 }).toArray();
    return NextResponse.json({ data: list });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Database connection failed", data: [] }, { status: 500 });
  }
}

import { extractJobDetails } from "@/lib/ai";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    const userId = (session as any)?.user?.id;
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
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fetch failed with status: ${res.status}`);
        const html = await res.text();
        const $ = cheerio.load(html);
        $("script, style").remove();
        const text = $("body").text().replace(/\s+/g, " ").trim();
        const extracted = await extractJobDetails(text);
        if (extracted.title || extracted.company) parsed = { ...parsed, ...extracted };
      } catch (error) {
        console.error("Failed to parse from URL:", error);
      }
    } else if (emailText) {
      source = "email";
      try {
        const extracted = await extractJobDetails(emailText);
        if (extracted.title || extracted.company) parsed = { ...parsed, ...extracted };
      } catch (error) {
        console.error("Failed to parse from email:", error);
      }
    }

    const doc = {
      userId,
      source,
      url,
      title: parsed.title?.trim() || manual?.title?.trim() || "Untitled Position",
      company: parsed.company?.trim() || manual?.company?.trim() || "Unknown Company",
      description: parsed.description?.trim() || manual?.description?.trim() || "",
      keywords: parsed.keywords || manual?.keywords || [],
      status: manual?.status || "saved",
      createdAt: now,
      updatedAt: now,
    };

    const inserted = await jobs.insertOne(doc as any);
    return NextResponse.json({ id: inserted.insertedId, data: doc });
  } catch (error) {
    console.error("Error adding job:", error);
    return NextResponse.json({ error: "Failed to add job" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    const userId = (session as any)?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, updates } = await req.json();
    if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const jobs = await jobsCollection();
    await jobs.updateOne(
      { _id: new ObjectId(id as string), userId },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    const userId = (session as any)?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const jobs = await jobsCollection();
    await jobs.deleteOne({ _id: new ObjectId(id as string), userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}


