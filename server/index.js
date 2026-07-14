import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Health check — returns shape consumed by both useSystemStore and OrganizerDashboard
app.get('/api/health', (req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  res.json({
    status: 'ok',
    llm: apiKey ? 'live' : 'offline',
    supabase: supabaseUrl ? 'configured' : 'missing',
    gemini: apiKey ? 'configured' : 'missing'
  });
});

// Generic endpoint for Gemini generateContent
app.post('/api/gemini', async (req, res) => {
  try {
    const { model = 'gemini-2.5-flash', messages, systemInstruction, tools } = req.body;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API_KEY_MISSING' });
    }

    const aiModel = genAI.getGenerativeModel({ model, tools });
    const result = await aiModel.generateContent(messages);
    const response = await result.response;
    
    res.json({ text: response.text() });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Backend proxy listening on http://localhost:${port}`);
});
