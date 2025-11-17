require('dotenv').config();

const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/process', async (req, res) => {
  try {
    const rows = req.body;

    const formattedBuffer = rows
      .map((row) => `${row[0]} | ${row[1]} | ${row[2]} \n`)
      .join('');

    const finalPrompt = `${formattedBuffer}
You are a professional moderator who looks at the grades for the teacher's lesson. Above you are given a table with 3 columns separated by a "|" symbol. The first line contains the "Criterion" by which the teacher and his lesson were evaluated. The second row stores scores from 0 to 3. The third row stores a description of the score. You need to analyze this table. Describe in detail the weaknesses of the teacher / lesson and give him recommendations on how to improve his work with specific techniques. Also, don't forget to briefly describe the good sides. Be polite and considerate. In your answer do not use Markdown Markup Language`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const generation = await model.generateContent(finalPrompt);
    const response = await generation.response;
    const resultText = response?.text()?.trim() || 'No response received.';

    res.json({ result: resultText });
  } catch (error) {
    console.error('Gemini processing error:', error);
    res.status(500).json({
      error: 'Failed to process request.',
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

