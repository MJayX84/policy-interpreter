export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">
        Council Policy Interpreter
      </h1>

      <p className="text-gray-600 mb-6">
        Paste your council letter or describe your situation.
        Get a clear explanation of your rights and obligations.
      </p>

      <textarea
        className="w-full h-40 border rounded-md p-3 mb-4"
        placeholder="Paste text here..."
      />

      <button className="bg-black text-white px-4 py-2 rounded">
        Explain
      </button>
    </main>
  );
}
