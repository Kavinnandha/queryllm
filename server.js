require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

function extractCode(text) {
  const match = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

app.get('/', async (req, res) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).type('text/plain').send('query parameter (string) is required');
  }

  try {
    const prompt = `Write code for the following request. Return ONLY the code, no explanation, wrapped in a single markdown code block.\n\nRequest: ${query}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.type('text/plain').send(extractCode(text));
  } catch (err) {
    console.error(err);
    res.status(500).type('text/plain').send('failed to generate code');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
