const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// 1. Health Check Route (Helps Render see the app is live)
app.get('/', (req, res) => {
    res.send('Flexi Server is Running and Healthy! ✅');
});

// 2. Gemini Explanation Route
app.post('/explain', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "API Key missing on server environment" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "AI failed to respond", details: error.message });
    }
});

// 3. Port & Host Configuration (Critical for Render)
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Flexi Server active on port ${PORT}`);
});
