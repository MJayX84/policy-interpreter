"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleExplain() {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">
        Council Policy Interpreter
      </h1>

      <textarea
        className="w-full h-40 border rounded-md p-3 mb-4"
        placeholder="Paste your council letter or describe your situation..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handleExplain}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded mb-6"
      >
        {loading ? "Explaining..." : "Explain"}
      </button>

      {result && (
        <div className="border rounded p-4 space-y-4">
          <p><strong>Summary</strong>: {result.summary}</p>

          <div>
            <strong>Obligations</strong>
            <ul className="list-disc ml-5">
              {result.obligations?.map((o: string, i: number) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>

          <div>
            <strong>Options</strong>
            <ul className="list-disc ml-5">
              {result.options?.map((o: string, i: number) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>

          <div>
            <strong>Sources</strong>
            <ul className="list-disc ml-5">
              {result.sources?.map((s: any, i: number) => (
                <li key={i}>
                  {s.document} – Section {s.section}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
