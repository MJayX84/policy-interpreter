import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No input provided" },
        { status: 400 }
      );
    }

    // Placeholder logic (OpenAI comes next)
    return NextResponse.json({
      summary: "This is a placeholder explanation.",
      obligations: [
        "You must comply with council requirements as outlined."
      ],
      options: [
        "You may contact the council for clarification.",
        "You may review the cited policy sections."
      ],
      sources: [
        {
          document: "Sample Council Policy",
          section: "1.2"
        }
      ]
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
