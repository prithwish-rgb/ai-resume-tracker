import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

async function fetchNews(company: string) {
  // Basic public web search stub (no API keys); user can plug real sources later
  const query = encodeURIComponent(`${company} news`);
  const url = `https://news.google.com/rss/search?q=${query}`;
  try {
    const res = await fetch(url);
    const xml = await res.text();
    const items = Array.from(xml.matchAll(/<title>([^<]+)<\/title>\s*<link>([^<]+)<\/link>/g)).slice(1,6).map(m => ({ title: m[1], link: m[2] }));
    return items;
  } catch { return []; }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { company } = await req.json();
  if (!company) return NextResponse.json({ error: "Missing company" }, { status: 400 });
  const news = await fetchNews(company);
  // Placeholders for StackShare / Crunchbase; real integrations require API keys
  const techStack = [] as string[];
  const funding = null as any;
  return NextResponse.json({ company, news, techStack, funding });
}


