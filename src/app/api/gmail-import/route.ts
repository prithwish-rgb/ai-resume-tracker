import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { listRecentMessages } from "@/lib/gmail";
import { parseJobFromUrlOrText } from "@/lib/utils";
import { jobsCollection } from "@/lib/mongodb";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session as any)?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const msgs = await listRecentMessages(10);
    const jobs = await jobsCollection();
    const now = new Date();
    let imported = 0;

    for (const m of msgs) {
      const parsed = await parseJobFromUrlOrText({ text: m.text });
      if (parsed.title || parsed.company) {
        await jobs.insertOne({
          userId,
          source: "email",
          title: parsed.title,
          company: parsed.company,
          description: parsed.description,
          keywords: parsed.keywords,
          status: "saved",
          createdAt: now,
          updatedAt: now,
        } as any);
        imported += 1;
      }
    }

    return NextResponse.json({ imported });
  } catch (error) {
    console.error("[gmail-import.POST]", error);
    const message = error instanceof Error ? error.message : "Failed to import Gmail jobs";
    const status = /not configured/i.test(message) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}


