"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [policyText, setPolicyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (policyText.trim()) formData.append("policyText", policyText);

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Interpretation failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <h1 className="title">Council Policy Interpreter</h1>

      <div className="card">
        <textarea
          placeholder="Paste council policy text here (optional if uploading PDF)"
          value={policyText}
          onChange={(e) => setPolicyText(e.target.value)}
          rows={8}
        />

        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleExplain}
          disabled={loading || (!file && !policyText.trim())}
        >
          {loading ? "Interpreting…" : "Interpret Policy"}
        </button>

        {error && <p className="error">{error}</p>}
      </div>

      {result && (
        <div className="output">
          <section>
            <h3><strong>Summary</strong></h3>
            <p>{result.summary}</p>
          </section>

          <section>
            <h3><strong>Obligations</strong></h3>
            <ul>
              {result.obligations?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3><strong>Options</strong></h3>
            <ul>
              {result.options?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="confidence">
            <h3>
              <strong>Confidence</strong>
              <span className="tooltip">
                ⓘ
                <span className="tooltip-text">
                  This score represents the AI’s confidence that the
                  interpretation accurately reflects the source policy,
                  based on clarity, consistency, and completeness of the input.
                </span>
              </span>
            </h3>
            <p>{result.confidence}%</p>
          </section>
        </div>
      )}
    </main>
  );
}
