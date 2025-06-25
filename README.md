# 📄 Smart PDF Summarizer with AI & Voice Output

An intelligent full-stack web application that allows users to upload PDF files, summarize their content using AI (Groq/OpenAI), and interact with the summary via text, voice, and download options. Built with "React", "Node.js", and "Groq API".

---

## 🚀 Features

- 📤 "Upload PDF": Upload any PDF file for summarization.
- 🤖 "AI-Powered Summary": Uses LLaMA 3 via Groq API to generate concise and meaningful summaries.
- 🗣️ **Text-to-Speech**: Listen to the summary aloud with synchronized word-by-word highlighting.
- 📋 **Copy Summary**: Easily copy the generated summary to your clipboard.
- 🔒 **Secure File Handling**: Automatically deletes uploaded files after processing.

---

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Marked.js, React Icons
- **Backend**: Express.js, Multer, pdf-parse, Axios
- **AI Model**: [Groq API]
- **Text-to-Speech**: 
  - 🔊 Browser-based: `SpeechSynthesisUtterance`
