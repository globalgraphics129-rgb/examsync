import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Unified Firebase Admin init — works in both Vercel and local dev
if (!getApps().length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      // Vercel: stored as a single JSON string env var
      initializeApp({
        credential: cert(JSON.parse(serviceAccountKey)),
      });
    } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      // Local dev: individual env vars
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      console.warn('[reset-password] No Firebase Admin credentials found. Password reset will not work.');
    }
  } catch (error) {
    console.error('Firebase admin init error', error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, newPassword, code } = req.body;

    if (!email || !newPassword || !code) {
      return res.status(400).json({ error: 'Missing parameters: email, newPassword, code required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = getFirestore();
    const otpDoc = await db.collection('otps').doc(email).get();

    if (!otpDoc.exists) {
      return res.status(400).json({ error: 'No reset code found or it has expired. Please request a new one.' });
    }

    const otpData = otpDoc.data()!;

    if (otpData.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    if (Date.now() > otpData.expiresAt) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // Update password using Admin SDK
    const userRecord = await getAuth().getUserByEmail(email);
    await getAuth().updateUser(userRecord.uid, { password: newPassword });

    // Clean up OTP
    await db.collection('otps').doc(email).delete();

    res.status(200).json({ success: true, message: 'Password updated successfully' });

  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
