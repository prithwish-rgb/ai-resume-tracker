import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connected successfully!",
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error("Database test failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Database connection failed. Please check your MONGODB_URI in .env.local"
    }, { status: 500 });
  }
}
