import React, { useState, useRef } from "react";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Toaster, toast } from "react-hot-toast";
import { FaRegFilePdf } from "react-icons/fa6";
import { MdOutlineOutput } from "react-icons/md";
import { BsFillSignStopFill } from "react-icons/bs";
import { IoCopyOutline } from "react-icons/io5";


const Pdf = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(null);
  const [rate, setRate] = useState(1);
  const wordsRef = useRef([]);
  const [audioPath, setAudioPath] = useState("");


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSummary("");
    setCurrentWordIndex(null);
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
      setAudioPath(res.data.audio);
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

  const handleReadAloud = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentWordIndex(null);
      return;
    }

    if (summary) {
      const utterance = new SpeechSynthesisUtterance(summary);
      utterance.lang = "en-US";
      utterance.rate = rate;
      utterance.pitch = 1;

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const index = getWordIndexAtChar(event.charIndex);
          setCurrentWordIndex(index);
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentWordIndex(null);
      };

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary).then(() => {
      toast.success("Summary copied to clipboard!");
    });
  };

  const getWordIndexAtChar = (charIndex) => {
    let total = 0;
    for (let i = 0; i < wordsRef.current.length; i++) {
      total += wordsRef.current[i].length + 1;
      if (total > charIndex) return i;
    }
    return null;
  };

  const createHighlightedMarkup = () => {
    if (!summary) return { __html: "" };
    wordsRef.current = summary.split(" ");
    const html = wordsRef.current
      .map((word, i) =>
        i === currentWordIndex
          ? `<mark style="background: black; color: white; padding: 2px 4px; border-radius:5px">${DOMPurify.sanitize(word)}</mark>`
          : DOMPurify.sanitize(word)
      )
      .join(" ");
    return { __html: marked.parse(html) };
  };

  return (
    <div
      className="min-h-screen bg-[#f7f7f5] text-[#1c1c1c] px-4 py-10"
      style={{
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
      }}
    >
      <Toaster position="top-right" />
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
              Choose <FaRegFilePdf className="text-xl" />
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
                Selected:{" "}
                <span className="font-medium text-[#222]">{file.name}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#1c1c1c] hover:bg-[#000] text-white py-2 rounded-md font-medium transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Processing..." : "Upload & Summarize"}
          </button>
        </form>

        {summary && (
          <div className="mt-6 border-t pt-4 border-[#e5e5e5]">
            <h2 className="py-2 inline-flex items-center font-medium">
              Summary <MdOutlineOutput className="text-xl" />
            </h2>

            <div
              className="prose prose-lg max-w-none text-justify leading-relaxed"
              dangerouslySetInnerHTML={createHighlightedMarkup()}
            />

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={handleReadAloud}
                className="bg-black text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
              >
                {isSpeaking ? (
                  <>
                    <BsFillSignStopFill className="text-2xl" />
                  </>
                ) : (
                  <>🔊</>
                )}
              </button>


              <button
                onClick={handleCopy}
                className="bg-black text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
              >
                <IoCopyOutline />
                Copy
              </button>
              {audioPath && (
                <a
                  href={`http://localhost:3000/upload/audio/${audioPath.split('/').pop()}`}
                  download
                  className="bg-black text-white px-4 py-2 rounded-md font-medium"
                >
                  🎧 Download Audio
                </a>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pdf;
