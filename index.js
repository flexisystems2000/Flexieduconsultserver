const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();

// Comprehensive CORS for mobile and local file access
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Health Check
app.get('/', (req, res) => {
    res.send('Flexi Server is Running and Healthy! ✅');
});

// Gemini Explanation Route
app.post('/explain', async (req, res) => {
    console.log("AI Request received...");
    
    try {
        const { prompt } = req.body;
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "API Key is missing in Render environment." });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        let result;
        try {
            // Attempt 1: Using the latest 1.5 Flash model
            console.log("Attempting Gemini 1.5 Flash...");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            result = await model.generateContent(prompt);
        } catch (firstError) {
            console.warn("Flash failed, attempting Gemini Pro fallback...");
            // Attempt 2: Fallback to the stable Pro model
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            result = await model.generateContent(prompt);
        }

        const response = await result.response;
        const text = response.text();

        console.log("AI Explanation generated successfully.");
        res.json({ text });

    } catch (finalError) {
        console.error("Critical Gemini Error:", finalError.message);
        res.status(500).json({ 
            error: "AI Service Unavailable", 
            details: finalError.message 
        });
    }
});

// Bind to 0.0.0.0 for Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Flexieduconsult Server active on port ${PORT}`);
});
