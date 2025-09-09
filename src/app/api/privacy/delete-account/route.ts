import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { jobsCollection, resumesCollection, interviewsCollection, debriefsCollection, connectToDatabase } from "@/lib/mongodb";

export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = (session.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await Promise.all([
    (await jobsCollection()).deleteMany({ userId }),
    (await resumesCollection()).deleteMany({ userId }),
    (await interviewsCollection()).deleteMany({ userId }),
    (await debriefsCollection()).deleteMany({ userId }),
  ]);

  // Optionally delete user document if stored
  try {
    const db = await connectToDatabase();
    await db.collection("users").deleteOne({ _id: new (require("mongodb").ObjectId)(userId) });
  } catch {}

  return NextResponse.json({ success: true });
}


