import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { generateNegotiationScript, isAIEnabled, AIDisabledError } from "@/lib/ai";

async function getUID() {
  const session = await getServerSession(authOptions as never);
  return (session as { user?: { id?: string } } | null)?.user?.id ?? null;
}

export async function POST(req: Request) {
  try {
    const uid = await getUID();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { role, company, location, offeredBase, offeredBonus, offeredEquity, yearsExperience, targetBase } = await req.json();
    if (!role || !company)
      return NextResponse.json({ error: "role and company are required" }, { status: 400 });

    const result = await generateNegotiationScript({
      role, company,
      location:        location        ?? "",
      offeredBase:     offeredBase     ?? "Not disclosed",
      offeredBonus:    offeredBonus    ?? "",
      offeredEquity:   offeredEquity   ?? "",
      yearsExperience: yearsExperience ?? "Not specified",
      targetBase:      targetBase      ?? "",
    });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof AIDisabledError)
      return NextResponse.json({ error: e.message, aiEnabled: false }, { status: 503 });
    console.error("[negotiate.POST]", e);
    return NextResponse.json({ error: (e as Error).message || "Generation failed", aiEnabled: isAIEnabled() }, { status: 500 });
  }
}
