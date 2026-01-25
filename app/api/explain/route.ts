import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const pastedText = formData.get("policyText")?.toString() || "";

    let extractedText = "";

    // ---- PDF extraction ----
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || "";
    }

    const policyText = `${extractedText}\n\n${pastedText}`.trim();

    if (!policyText) {
      return NextResponse.json(
        { error: "No policy text provided" },
        { status: 400 }
      );
    }

    // ---- Grounded LLM call ----
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `
You are a council policy interpreter.
Use ONLY the provided policy text.
Do NOT infer or invent obligations.
Respond strictly in valid JSON with this schema:

{
  "summary": string,
  "obligations": string[],
  "options": string[],
  "risks": string[],
  "confidence": number (0-100)
}
          `,
        },
        {
          role: "user",
          content: `
Policy text:
"""
${policyText}
"""
          `,
        },
      ],
    });

    const raw = completion.choices[0].message.content;

    if (!raw) {
      throw new Error("Empty AI response");
    }

    // ---- Ensure clean JSON ----
    const parsed = JSON.parse(raw);

    return NextResponse.json(parsed);

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to interpret policy" },
      { status: 500 }
    );
  }
}
