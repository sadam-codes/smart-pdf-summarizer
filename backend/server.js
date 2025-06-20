const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const pdfRoutes = require('./controllers/pdfController');

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use('/upload', pdfRoutes);

const PORT = process.env.SERVER || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
