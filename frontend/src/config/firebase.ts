import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize core Firebase services (always required)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Firebase Cloud Messaging requires HTTPS + service worker.
// We initialize it lazily and separately so it never crashes core services.
let messaging: any = null;
const getMessagingInstance = async () => {
  if (messaging) return messaging;
  try {
    const { getMessaging, isSupported } = await import('firebase/messaging');
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
    }
  } catch (err) {
    console.warn('Firebase Messaging not available in this environment:', err);
  }
  return messaging;
};

export { auth, db, storage, getMessagingInstance };
export default app;
