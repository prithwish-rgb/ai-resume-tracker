import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const config = {
  api: {
    bodyParser: false, // Required for formidable
  },
};

export async function POST(req: Request): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    const form = formidable({ multiples: false });

    form.parse(req as any, async (err, fields, files) => {
      if (err) {
        resolve(NextResponse.json({ error: "File parsing error" }, { status: 500 }));
        return;
      }

      try {
        if (!files.file || !Array.isArray(files.file) || files.file.length === 0) {
          resolve(NextResponse.json({ error: "No file uploaded" }, { status: 400 }));
          return;
        }
        const file = files.file[0];
        const filePath = file.filepath;
        let text = "";

        if (file.mimetype === "application/pdf") {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(dataBuffer);
          text = pdfData.text;
        } else if (
          file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const data = await mammoth.extractRawText({ path: filePath });
          text = data.value;
        } else {
          resolve(NextResponse.json({ error: "Unsupported file type" }, { status: 400 }));
          return;
        }

        resolve(NextResponse.json({ text }));
      } catch (error) {
        resolve(NextResponse.json({ error: "File processing error" }, { status: 500 }));
      }
    });
  });
}
