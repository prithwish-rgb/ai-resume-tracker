import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import nlp from "compromise";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // ✅ Fetch the job page directly
    const response = await fetch(url);
    const html = await response.text();

    // Load HTML into Cheerio
    const $ = cheerio.load(html);

    // Extract Title
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text() ||
      "";

    // Extract Description
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $("meta[name='description']").attr("content") ||
      $("body").text().slice(0, 500) || ""; // fallback: first 500 chars
      "";

    // Extract Company
    let company = "";
    const possibleCompanyTags = [
      "meta[name='company']",
      ".topcard__org-name",
      ".jobsearch-CompanyReview--heading",
    ];
    for (const selector of possibleCompanyTags) {
      if ($(selector).text()) {
        company = $(selector).text().trim();
        break;
      }
    }

    // --- Keyword Extraction using NLP ---
    let keywords: string[] = [];
    if (description) {
      const doc = nlp(description);
      const techKeywords = [
        "JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS",
        "Docker", "Kubernetes", "SQL", "NoSQL", "Next.js", "Tailwind",
        "HTML", "CSS", "Git", "CI/CD", "REST", "GraphQL",
      ];
      keywords = techKeywords.filter((word) =>
        description.toLowerCase().includes(word.toLowerCase())
      );
      const nouns = doc.nouns().out("array");
      keywords.push(...nouns.slice(0, 10));
      keywords = [...new Set(keywords)];
    }

    return NextResponse.json({
      success: true,
      // legacy structured payload
      data: { title, company, description, keywords },
      // flat fields for current UI usage
      jobTitle: title,
      companyName: company,
      description,
      keywords,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to parse job page" },
      { status: 500 }
    );
  }
}
