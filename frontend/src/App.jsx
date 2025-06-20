import React, { useState } from "react";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Toaster, toast } from "react-hot-toast";
import { FaRegFilePdf } from "react-icons/fa6";
import { MdOutlineOutput } from "react-icons/md";

const App = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSummary("");
    toast("PDF selected", { icon: "📄" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a PDF first");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      setLoading(true);
      toast.loading("Summarizing PDF...");
      const res = await axios.post("http://localhost:3000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSummary(res.data.summary);
      toast.dismiss();
      toast.success("Summary generated successfully!");
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Failed to summarize PDF");
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
    <div
      className="min-h-screen bg-[#f7f7f5] text-[#1c1c1c] px-4 py-10"
      style={{
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
      }}
    >
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto bg-white border border-[#e2e2e2] shadow-lg rounded-xl p-10">
        <h1 className="text-4xl font-bold mb-6 text-[#222] flex items-center justify-center gap-3">

          Smart <FaRegFilePdf className="text-3xl" /> Summarizer
        </h1>
        <p className="text-base text-[#555] mb-8 text-center">
          Upload your PDF and get an AI-powered summary in seconds.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer bg-white text-[#333] border border-[#ccc] px-5 py-2 rounded-md inline-flex items-center gap-2 hover:shadow-md transition font-medium"
            >
              Choose<FaRegFilePdf className="text-xl" />
            </label>
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {file && (
              <p className="mt-2 text-sm text-[#555] italic">
                Selected: <span className="font-medium text-[#222]">{file.name}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#1c1c1c] hover:bg-[#000] text-white py-2 rounded-md font-medium transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Upload & Summarize"}
          </button>
        </form>


        {summary && (
          <div className="mt-6 border-t border-[#e5e5e5]">
            <h2 className="bg-white text-[#333] py-2  inline-flex items-center font-medium">
              Summary <span><MdOutlineOutput className="text-xl"/></span>
            </h2>
            <div
              className="prose prose-lg max-w-none text-justify text-[#333] leading-relaxed"
              dangerouslySetInnerHTML={createMarkup()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
