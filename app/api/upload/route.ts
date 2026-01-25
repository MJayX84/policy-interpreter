import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

export const runtime = "nodejs"; // ensures Node runtime

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse PDF
    const data = await pdfParse(buffer);

    // Return text content
    return NextResponse.json({ text: data.text });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "File processing failed" }, { status: 500 });
  }
}
