import React, { useState } from "react";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";

const App = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSummary("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      alert("Error summarizing PDF");
    } finally {
      setLoading(false);
    }
  };

  const createMarkup = () => {
    const dirtyHTML = marked(summary || "");
    const cleanHTML = DOMPurify.sanitize(dirtyHTML);
    return { __html: cleanHTML };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">📄 PDF Summarizer (Groq)</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="bg-gray-700 p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 transition py-2 rounded text-white font-semibold"
        >
          {loading ? "Summarizing..." : "Upload & Summarize"}
        </button>
      </form>

      {summary && (
        <div
          className="mt-8 bg-gray-800 p-6 rounded-xl w-full max-w-2xl shadow-md"
          dangerouslySetInnerHTML={createMarkup()}
        />
      )}
    </div>
  );
};

export default App;
