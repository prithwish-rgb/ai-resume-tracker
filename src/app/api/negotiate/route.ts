import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!((session?.user as any)?.id)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { company, role, base, bonus, equity, location, target } = await req.json();

  const script = [
    `Thank you for the offer for the ${role || "role"} at ${company || "your company"}.` ,
    `Based on market data and my experience, I was targeting a base of ${target?.base || "[X]"}${location ? ` for ${location}` : ""}.`,
    base ? `Given the current offer base of ${base}, is there flexibility to move closer to ${target?.base || "[X]"}?` : undefined,
    bonus ? `On bonus, I was hoping for ${target?.bonus || "[Y]%"} vs the current ${bonus}.` : undefined,
    equity ? `For equity, I was targeting ${target?.equity || "[Z]"} to better align with long-term impact.` : undefined,
    `I’m excited about the team and can sign quickly if we can get closer to these numbers.`
  ].filter(Boolean).join("\n\n");

  return NextResponse.json({ script });
}


