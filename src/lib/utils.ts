import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function parseJobFromUrlOrText(input: { url?: string; text?: string }) {
  let htmlText = input.text || "";
  if (input.url) {
    try {
      const res = await fetch(input.url);
      const html = await res.text();
      // naive body text extraction
      const bodyMatch = html.match(/<body[\s\S]*?<\/body>/i);
      htmlText = bodyMatch ? bodyMatch[0].replace(/<[^>]+>/g, " ") : html.replace(/<[^>]+>/g, " ");
    } catch {}
  }
  const text = htmlText || "";
  const titleMatch = text.match(/title[:\-\s]+(.{5,120})/i);
  const companyMatch = text.match(/company[:\-\s]+([A-Za-z0-9 .,&'-]{2,80})/i);
  const desc = text.slice(0, 1200);
  const tech = ["JavaScript","TypeScript","React","Next.js","Node","Python","SQL","AWS","Docker","Kubernetes","GraphQL","Tailwind"];
  const keywords = tech.filter(k => text.toLowerCase().includes(k.toLowerCase()));
  return {
    title: titleMatch?.[1]?.trim(),
    company: companyMatch?.[1]?.trim(),
    description: desc.trim(),
    keywords,
  };
}
