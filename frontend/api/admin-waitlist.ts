import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import axios from 'axios';

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
      console.error('Firebase Admin SDK missing credentials');
    }
  } catch (err) {
    console.error('Firebase Admin init error:', err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, password, emailId, subject, htmlContent } = req.body;

  let isAuthorized = false;
  const authHeader = req.headers.authorization;

  // 1. Verify via Firebase ID Token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await getAuth().verifyIdToken(token);
      const uid = decodedToken.uid;
      
      const dbAdmin = getFirestore();
      const userDoc = await dbAdmin.collection('users').doc(uid).get();
      if (userDoc.exists && userDoc.data()?.role === 'admin') {
        isAuthorized = true;
      }
    } catch (tokenErr) {
      console.warn('[admin-waitlist] Bearer token validation failed:', tokenErr);
    }
  }

  // 2. Verify via static password fallback
  if (!isAuthorized && password && password === process.env.WAITLIST_ADMIN_PASSWORD) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized: Invalid credentials or insufficient permissions' });
  }

  if (!getApps().length) {
    return res.status(500).json({ error: 'Firebase Admin SDK is not configured. Please add FIREBASE_SERVICE_ACCOUNT_KEY in Vercel.' });
  }

  const db = getFirestore();

  try {
    if (action === 'fetch') {
      const snapshot = await db.collection('waitlist').orderBy('timestamp', 'desc').get();
      const waitlist = snapshot.docs.map(doc => {
        const data = doc.data();
        let ts = new Date().toISOString();
        if (data.timestamp) {
          if (typeof data.timestamp.toDate === 'function') {
            ts = data.timestamp.toDate().toISOString();
          } else if (typeof data.timestamp === 'string' || typeof data.timestamp === 'number') {
            ts = new Date(data.timestamp).toISOString();
          }
        }
        return {
          id: doc.id,
          ...data,
          timestamp: ts
        };
      });
      return res.status(200).json({ success: true, waitlist });
    }

    if (action === 'delete') {
      if (!emailId) return res.status(400).json({ error: 'emailId required for deletion' });
      await db.collection('waitlist').doc(emailId).delete();
      return res.status(200).json({ success: true, message: 'Email removed from waitlist' });
    }

    if (action === 'send_email') {
      if (!emailId || !subject || !htmlContent) {
        return res.status(400).json({ error: 'emailId, subject, and htmlContent required' });
      }
      
      const doc = await db.collection('waitlist').doc(emailId).get();
      if (!doc.exists) return res.status(404).json({ error: 'Email not found in waitlist' });
      
      const targetEmail = doc.data()?.email;

      const BREVO_API_KEY = process.env.BREVO_API_KEY;
      if (!BREVO_API_KEY) return res.status(503).json({ error: 'Brevo API key missing' });

      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: 'ExamSync', email: 'examsyncuni@gmail.com' },
          to: [{ email: targetEmail }],
          subject,
          htmlContent,
        },
        {
          headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      return res.status(200).json({ success: true, message: 'Email sent successfully!' });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error: any) {
    console.error('Admin Waitlist Error:', error);
    res.status(500).json({ error: error.message || 'Failed to execute admin action', detail: error.message });
  }
}
