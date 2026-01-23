"use client";

import { useState } from "react";

type ExplainResult = {
  summary: string;
  obligations: string[];
  options: string[];
  risks?: string[];
  confidence?: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional: store uploaded document ID for retrieval
  const [uploadedDocId, setUploadedDocId] = useState<number | null>(null);

  // --- File Upload Handler ---
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("File upload failed");
      const data = await res.json();
      console.log("Upload success:", data);
      setUploadedDocId(data.docId); // store for later use in /api/explain
    } catch (err: any) {
      console.error(err);
      setError(err.message || "File upload error");
    } finally {
      setLoading(false);
    }
  }

  // --- Explain Handler ---
  async function handleExplain() {
    console.log("Explain clicked");

    if (!input.trim() && uploadedDocId === null) {
      setError("Please enter text or upload a document to explain.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, docId: uploadedDocId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      const data = await res.json();
      console.log("API RESPONSE:", data);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">
        Council Policy Interpreter
      </h1>

      <p className="text-gray-600 mb-4">
        Paste your council letter or describe your situation, or upload a policy document.
      </p>

      {/* --- Text Input --- */}
      <textarea
        className="w-full h-40 border rounded-md p-3 mb-4"
        placeholder="Paste your council letter or describe your situation..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* --- File Upload Input --- */}
      <input
        type="file"
        accept=".pdf,.txt,.docx"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {/* --- Explain Button --- */}
      <button
        onClick={handleExplain}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {loading ? "Explaining..." : "Explain"}
      </button>

      {/* --- Error Display --- */}
      {error && (
        <p className="text-red-600 mb-4">
          {error}
        </p>
      )}

      {/* --- Result Display --- */}
      {result && (
        <div className="border rounded p-4 space-y-4">
          <p>
            <strong>Summary</strong>: {result.summary}
          </p>

          <div>
            <strong>Obligations</strong>
            <ul className="list-disc ml-5">
              {result.obligations.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>

          <div>
            <strong>Options</strong>
            <ul className="list-disc ml-5">
              {result.options.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>

          {result.risks && result.risks.length > 0 && (
            <div>
              <strong>Risks</strong>
              <ul className="list-disc ml-5">
                {result.risks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {result.confidence && (
            <p>
              <strong>Confidence</strong>: {result.confidence}
            </p>
          )}
        </div>
      )}
    </main>
  );
}
