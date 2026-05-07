import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { parseJobDescription, isAIEnabled } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { url, rawText } = await req.json();
    let textToParse = rawText ?? "";

    if (url) {
      try {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(url, {
          signal: ctrl.signal,
          headers: { "user-agent": "Mozilla/5.0 (compatible; AIResumeTrackerBot/1.0)" },
        });
        if (res.ok) {
          const html = await res.text();
          const $ = cheerio.load(html);
          $("script,style,nav,footer,header,svg,noscript").remove();
          textToParse = $("body").text().replace(/\s+/g, " ").trim().slice(0, 12000);
        }
      } catch (e) {
        console.warn("[parse-job] URL fetch:", (e as Error).message);
      }
    }

    if (!textToParse.trim())
      return NextResponse.json({ error: "No content to parse" }, { status: 400 });

    const parsed = await parseJobDescription(textToParse);
    return NextResponse.json({
      success: true, aiEnabled: isAIEnabled(),
      jobTitle: parsed.title, companyName: parsed.company,
      description: parsed.summary, skills: parsed.requiredSkills,
      data: parsed,
    });
  } catch (e) {
    console.error("[parse-job.POST]", e);
    return NextResponse.json({ error: (e as Error).message || "Parse failed", aiEnabled: isAIEnabled() }, { status: 500 });
  }
}
