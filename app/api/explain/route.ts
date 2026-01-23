import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No input provided" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a Local Government Policy Interpreter.

Rules:
- Explain content in plain English.
- Do NOT provide legal advice.
- If policy context is missing or unclear, say so.
- Be neutral, accurate, and cautious.
- Respond ONLY in valid JSON using this structure:

{
  "summary": string,
  "obligations": string[],
  "options": string[],
  "risks": string[],
  "confidence": "high" | "medium" | "low"
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Explain the following council-related text:\n\n${text}`
        }
      ]
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);

  } catch (err: any) {
    console.error("FULL AI ERROR OBJECT:", err);

  return NextResponse.json(
    {
      error: "AI processing failed",
      details: err?.message || err?.toString()
    },
    { status: 500 }
  );
  }
}
