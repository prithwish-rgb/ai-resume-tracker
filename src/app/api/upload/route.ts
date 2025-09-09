import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { resumesCollection } from "@/lib/mongodb";
import { writeFile } from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Detect file type
    let text = "";
    if (file.name.endsWith(".pdf")) {
      const pdfData = await pdf(buffer);
      text = pdfData.text;
    } else if (file.name.endsWith(".docx")) {
      const docxData = await mammoth.extractRawText({ buffer });
      text = docxData.value;
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // Optionally store raw text as a resume draft
    const resumes = await resumesCollection();
    const now = new Date();
    const inserted = await resumes.insertOne({
      userId,
      name: `Imported ${file.name}`,
      blocks: [
        { id: "summary-1", type: "summary", content: text.slice(0, 1000) },
      ],
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ message: "File processed", text, resumeId: inserted.insertedId });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
