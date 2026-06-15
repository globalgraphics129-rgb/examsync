import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
if (!getApps().length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      initializeApp({ credential: cert(JSON.parse(serviceAccountKey)) });
    } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  } catch (err) {
    console.error('Firebase Admin init error:', err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const auth = getAuth();
    const db = getFirestore();

    // 1. Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    // 2. Create user profile in Firestore
    await db.collection('users').doc(uid).set({
      name,
      email,
      role: 'student',
      isVerified: false,
      onboardingCompleted: false,
      uniId: '',
      faculty: '',
      department: '',
      semester: '',
      courses: [],
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(200).json({ success: true, uid });

  } catch (error: any) {
    console.error('Signup API error:', error);
    
    // Handle existing email error specifically
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ error: 'This email is already registered. Please sign in instead.' });
    }

    res.status(500).json({ error: error.message || 'Internal server error during signup' });
  }
}
