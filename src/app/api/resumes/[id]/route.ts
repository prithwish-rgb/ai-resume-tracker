import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { resumesCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  _req: Request, 
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = (session as any)?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const params = await context.params;
  if (!params.id || !ObjectId.isValid(params.id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const resumes = await resumesCollection();
  const resume = await resumes.findOne({ _id: new ObjectId(params.id as string), userId } as any);
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: resume });
}


