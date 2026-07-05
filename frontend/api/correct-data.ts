import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Unified Firebase Admin init
if (!getApps().length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      initializeApp({ credential: cert(JSON.parse(serviceAccountKey)) });
    } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      console.warn('[correct-data] No Firebase Admin credentials — corrections will not be saved to Firestore.');
    }
  } catch (err) {
    console.error('Firebase Admin init error:', err);
  }
}

const schema = z.object({
  userStatement: z.string().min(1),
  university: z.string().min(1),
  faculty: z.string().optional(),
  type: z.enum(['faculty', 'department']),
  existingOptions: z.array(z.string()),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userStatement, university, faculty, type, existingOptions } = schema.parse(req.body);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'AI service not configured. Please add GEMINI_API_KEY.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `You are a smart academic data correction AI. A student is trying to select their ${type} during onboarding.
University: ${university}
Faculty: ${faculty || 'Not applicable (they are selecting faculty)'}

Current existing options in the system:
${JSON.stringify(existingOptions, null, 2)}

User's exact feedback statement: "${userStatement}"

Your job: determine what the user means. Are they saying an existing option is mis-named/outdated? Or are they adding a completely new ${type}?

Return ONLY valid JSON:
{
  "action": "rename" | "add_new",
  "oldValue": "exact string from existing options if renaming, otherwise null",
  "newValue": "the correctly formatted new name"
}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }]
    });

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI returned invalid response format');

    const parsed = JSON.parse(jsonMatch[0]);

    // Save correction to Firestore for learning (only if admin is initialized)
    if (getApps().length > 0) {
      try {
        const db = getFirestore();
        await db.collection('ai_corrections').add({
          type,
          university,
          faculty: faculty || null,
          action: parsed.action,
          oldValue: parsed.oldValue,
          newValue: parsed.newValue,
          originalStatement: userStatement,
          timestamp: FieldValue.serverTimestamp(),
        });
      } catch (dbErr) {
        console.warn('[correct-data] Could not save to Firestore:', dbErr);
        // Non-fatal — still return the AI result
      }
    }

    res.status(200).json(parsed);

  } catch (error: any) {
    console.error('Correct-data error:', error);
    res.status(500).json({ error: error.message });
  }
}
