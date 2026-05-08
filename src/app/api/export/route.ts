import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { resumesCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  const uid = (session as { user?: { id?: string } } | null)?.user?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { resumeId, format = "json" } = await req.json();
  if (!resumeId || !ObjectId.isValid(resumeId))
    return NextResponse.json({ error: "Invalid resumeId" }, { status: 400 });

  const col = await resumesCollection();
  const r = await col.findOne({ _id: new ObjectId(resumeId), userId: uid });
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (format === "json") {
    return new NextResponse(JSON.stringify(r, null, 2), {
      headers: {
        "content-type": "application/json",
        "content-disposition": `attachment; filename="${slug(r.name)}.json"`,
      },
    });
  }

  // HTML "print to PDF" — works in any browser, no server-side chromium needed.
  const html = renderResumeHTML(r);
  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-disposition": `inline; filename="${slug(r.name)}.html"`,
    },
  });
}

function slug(s: string) { return s.replace(/[^a-z0-9]+/gi, "-").toLowerCase(); }

function renderResumeHTML(r: { name: string; blocks: { type: string; content: string; tags?: string[] }[] }) {
  const sectionOrder = ["summary","experience","project","education","skill"];
  const grouped = sectionOrder.map(t => ({ t, items: r.blocks.filter(b => b.type === t) })).filter(g => g.items.length);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escape(r.name)}</title>
<style>
  @page { margin: 0.6in; }
  body { font: 11pt/1.45 -apple-system,Segoe UI,Roboto,sans-serif; color:#111; max-width:780px; margin:auto; }
  h1 { font-size: 22pt; margin: 0 0 4pt; }
  h2 { font-size: 12pt; text-transform: uppercase; letter-spacing:.06em; border-bottom:1px solid #333; margin-top: 18pt; }
  .item { margin: 8pt 0; }
  .tags { color:#555; font-size: 9.5pt; }
  @media print { .noprint { display:none } }
</style></head><body>
<h1>${escape(r.name)}</h1>
<div class="noprint" style="margin:8pt 0 16pt;color:#555">Press Ctrl/Cmd-P to save as PDF.</div>
${grouped.map(g => `
  <h2>${cap(g.t)}</h2>
  ${g.items.map(b => `
    <div class="item">
      <div>${escape(b.content).replace(/\n/g,"<br>")}</div>
      ${b.tags?.length ? `<div class="tags">${b.tags.map(escape).join(" • ")}</div>` : ""}
    </div>`).join("")}
`).join("")}
</body></html>`;
}
const cap = (s:string)=>s[0].toUpperCase()+s.slice(1);
const escape = (s:string)=>s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]!));
