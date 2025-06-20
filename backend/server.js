const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        const pdfPath = req.file.path;
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer); // ✅ Now works
        const text = data.text.slice(0, 3000);

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama3-70b-8192',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that summarizes PDF documents.',
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

        fs.unlinkSync(pdfPath); // delete uploaded file
        res.json({ summary: response.data.choices[0].message.content });

    } catch (err) {
        console.error('Full Error:', err);
        res.status(500).json({ error: 'Failed to summarize PDF' });
    }
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
