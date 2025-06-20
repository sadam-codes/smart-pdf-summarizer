const express = require('express');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    const pdfPath = req.file.path;
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text.slice(0, 1000);

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes PDF documents. Summarize the PDF with meaningful content.',
          },
          {
            role: 'user',
            content: `Summarize the following PDF content:\n\n${text}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    fs.unlinkSync(pdfPath);
    res.json({ summary: response.data.choices[0].message.content });

  } catch (err) {
    console.error('Summarization Error:', err);
    res.status(500).json({ error: 'Failed to summarize PDF' });
  }
});

module.exports = router;
