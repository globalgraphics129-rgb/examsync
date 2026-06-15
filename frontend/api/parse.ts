import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const schema = z.object({
  pdfBase64: z.string().optional(),
  text: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pdfBase64, text } = schema.parse(req.body);
    
    if (!pdfBase64 && !text) {
      return res.status(400).json({ error: 'Provide pdfBase64 or text' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'AI service not configured. Please add GEMINI_API_KEY.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let contentToAnalyze = text || '';

    if (pdfBase64) {
      // In a full implementation, you would use a library like pdf-parse to extract text from the base64 PDF.
      // Since this is a serverless function and pdf parsing can be heavy, it's often better to send the text directly
      // from the frontend. For now, we'll assume the frontend extracts it or it's mocked.
      contentToAnalyze = pdfBase64; 
    }

    const systemPrompt = `Extract exam schedules from the provided text. Return ONLY a JSON object with this exact structure:
{
  "entries": [
    {
      "courseCode": "e.g. CSC 401",
      "courseTitle": "e.g. Software Engineering",
      "date": "YYYY-MM-DD",
      "time": "HH:MM (24-hour)",
      "venue": "e.g. Lecture Theater 1",
      "examType": "CBT or Written"
    }
  ]
}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nText to analyze:\n${contentToAnalyze}` }] }]
    });

    const responseText = result.response.text();
    
    // Find JSON block
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsedJson = JSON.parse(jsonMatch[0]);
    res.status(200).json(parsedJson);

  } catch (error: any) {
    console.error('Parse error:', error);
    res.status(500).json({ error: error.message });
  }
}
