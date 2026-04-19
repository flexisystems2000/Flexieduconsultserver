const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();

// --- CRITICAL CORS UPDATE ---
// This allows local files, mobile browsers, and any domain to talk to your server
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health Check Route
app.get('/', (req, res) => {
    res.send('flexieduconsult Server is Running and Healthy! ✅');
});

// Gemini Explanation Route
app.post('/explain', async (req, res) => {
    // Log incoming requests to Render console for debugging
    console.log("Incoming request for AI explanation...");

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("API KEY MISSING");
            return res.status(500).json({ error: "Server API Key not configured" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // This version is more compatible with the v1 API requirements
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1beta' });
        
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("AI Response successful");
        res.json({ text });

    } catch (error) {
        console.error("Gemini Error:", error.message);
        res.status(500).json({ 
            error: "AI failed to respond", 
            details: error.message 
        });
    }
});

// Port & Host Configuration
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ flexieduconsult Server active on port ${PORT}`);
});
