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

Your role:
- Explain local council policies, procedures, or notices in plain English.
- Help citizens understand their rights, obligations, and available options.
- Do NOT provide legal advice or definitive legal interpretations.

Tone and approach:
- Neutral, factual, and cautious
- Avoid assumptions
- Avoid speculation beyond the provided text
- Use clear, non-technical language suitable for the general public

Confidence assessment rules (CRITICAL):
- Set "confidence" to "high" ONLY if the text clearly and explicitly states enforceable rules, obligations, or procedures.
- Set "confidence" to "medium" if interpretation, summarisation, or inference is required, or if the policy text is partial.
- Set "confidence" to "low" if the text is ambiguous, incomplete, outdated, or lacks sufficient detail to determine clear obligations or rights.

Safety rules:
- If the policy text is incomplete or unclear, explicitly say so in the explanation.
- If important information appears to be missing (dates, scope, authority), reflect that uncertainty.
- Do NOT invent rules, obligations, or thresholds.
- Do NOT imply legal certainty where it does not exist.

Response format (MANDATORY):
Respond ONLY in valid JSON using this exact structure:

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

    let parsed;
try {
  parsed = JSON.parse(content);
} catch {
  return NextResponse.json(
    {
      error: "Model returned invalid JSON",
      raw: content
    },
    { status: 500 }
  );
}

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
