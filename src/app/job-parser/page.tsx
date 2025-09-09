"use client";
import { useState } from "react";

export default function JobParser() {
  const [jobLink, setJobLink] = useState("");
  const [jobText, setJobText] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
const [url, setUrl] = useState("");
  const handleParse = async () => {
     if (!url) {
      alert("Please enter a job link");
      return;
    }
    const res = await fetch("/api/parse-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: jobLink, rawText: jobText }),
    });
    const data = await res.json();
    setParsedData(data);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">AI-Powered Job Parser</h1>

      <input
        type="text"
        placeholder="Paste Job URL"
        value={jobLink}
        onChange={(e) => setJobLink(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <textarea
        placeholder="Or paste job description text"
        value={jobText}
        onChange={(e) => setJobText(e.target.value)}
        className="w-full border p-2 rounded h-32"
      />

      <button
        onClick={handleParse}
        className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600"
      >
        Parse Job Posting
      </button>

      {parsedData && (
        <div className="mt-6 p-4 border rounded space-y-2">
          <h2 className="text-xl font-semibold">Parsed Job Info</h2>
          <p><strong>Job Title:</strong> {parsedData.jobTitle}</p>
          <p><strong>Company:</strong> {parsedData.company}</p>
          <p><strong>Description:</strong> {parsedData.description}</p>
          <p><strong>Skills:</strong> {parsedData.skills?.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
