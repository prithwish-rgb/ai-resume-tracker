import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = (session.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { targetName, role, company, relationship } = await req.json();
  const msg = `Hi ${targetName || "there"},\n\nI hope you're well! I'm exploring ${role || "a role"} opportunities at ${company || "your company"}. Given your ${relationship || "connection"}, I'd value any insights into the team or referral guidance.\n\nHappy to share my resume; thanks in advance!`;
  return NextResponse.json({ message: msg });
}


