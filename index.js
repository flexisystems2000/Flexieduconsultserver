const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();

// Comprehensive CORS for mobile/local access
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});

// Health Check
app.get('/', (req, res) => {
    res.send('flexieduconsults Server is Running! ✅');
});

// Explanation Route
app.post('/explain', async (req, res) => {
    console.log("Request received for OpenAI...");
    try {
        const { prompt } = req.body;

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: "OpenAI Key missing in Render" });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Fast and cost-effective
            messages: [
                { role: "system", content: "You are an expert tutor for Nigerian secondary students. Keep explanations under 3 sentences." },
                { role: "user", content: prompt }
            ],
            max_tokens: 150
        });

        const text = completion.choices[0].message.content;
        console.log("Success: Explanation generated.");
        res.json({ text });

    } catch (error) {
        console.error("OpenAI Error:", error.message);
        res.status(500).json({ error: "OpenAI failed", details: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ flexieduconsults Server active on port ${PORT}`);
});
