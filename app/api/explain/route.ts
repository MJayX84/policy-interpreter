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
- If policy context is missing, say so explicitly.
- Always respond using the defined JSON structure.
- Be neutral, accurate, and cautious.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Explain the following council-related text:\n\n${text}`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "policy_explanation",
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              obligations: {
                type: "array",
                items: { type: "string" }
              },
              options: {
                type: "array",
                items: { type: "string" }
              },
              risks: {
                type: "array",
                items: { type: "string" }
              },
              confidence: {
                type: "string",
                description: "high | medium | low"
              }
            },
            required: [
              "summary",
              "obligations",
              "options",
              "risks",
              "confidence"
            ]
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content ?? "{}");

    return NextResponse.json(parsed);

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "AI processing failed" },
      { status: 500 }
    );
  }
}
