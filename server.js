// ============================================
// BACKEND SERVER FOR GROQ AI INTEGRATION
// ============================================
// Run: npm start

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.error('❌ ERROR: GROQ_API_KEY not found in .env file');
    process.exit(1);
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        const { message, context, systemPrompt } = req.body;

        const messages = [
            {
                role: 'system',
                content: systemPrompt || 'You are Soul, a caring and empathetic AI companion for emotional support. Respond with warmth, understanding, and use terms of endearment like "sweetie", "love", "dear", "honey". Add emojis like 💕, 🥰, ✨, 🌸 to make responses feel warm and caring. Keep responses concise and supportive.'
            },
            ...context,
            {
                role: 'user',
                content: message
            }
        ];

        const completion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.9,
            max_tokens: 150
        });

        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get response' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('🤖 Using Groq AI (Llama 3.1)');
});
