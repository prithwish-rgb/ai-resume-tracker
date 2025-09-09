import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !email.includes("@") || !password || password.trim().length < 6) {
      return NextResponse.json(
        { message: "Invalid input - password must be at least 6 characters." },
        { status: 422 }
      );
    }

    const db = await connectToDatabase();

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists!" }, { status: 422 });
    }

    const hashedPassword = await hashPassword(password);

    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "User created successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  }
}
