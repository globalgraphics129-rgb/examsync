import { useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  deleteUser as firebaseDeleteUser,
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, db, storage } from '../config/firebase';
import { doc, getDoc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthStore } from '../store/authStore';
import type { User } from '../store/authStore';
import api from '../lib/api';

export const useAuth = () => {
  const { setUser, setLoading, setError, user, isLoading, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ uid: firebaseUser.uid, ...userDoc.data() } as User);
          }
        } catch (err: any) {
          setError(err.message);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, setError]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // ── Admin backdoor ──
      if (email === 'admin@examsync.com' && password === 'admin2026') {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          return true;
        } catch (fbErr: any) {
          if (
            fbErr.code === 'auth/user-not-found' || 
            fbErr.code === 'auth/invalid-credential' || 
            fbErr.message?.includes('user-not-found') || 
            fbErr.message?.includes('INVALID_LOGIN_CREDENTIALS')
          ) {
            // First register the admin user via the API
            await api.post('/signup', { email, password, name: 'Glory Adeniran' });
            // Then sign in
            await signInWithEmailAndPassword(auth, email, password);
            return true;
          }
          throw fbErr;
        }
      }

      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Call Backend Signup API (Reliable server-side creation)
      const response = await api.post('/signup', { email, password, name });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Signup failed. Please try again.');
      }

      // 2. Sign In on the client now that the account definitely exists
      await signInWithEmailAndPassword(auth, email, password);
      
      return true;
    } catch (err: any) {
      // Handle Firebase and API errors
      const message = err.response?.data?.error || err.message;
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const newUser: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Google User',
          email: firebaseUser.email || '',
          role: 'student',
          isVerified: true,
          onboardingCompleted: false,
          uniId: '',
          faculty: '',
          department: '',
          semester: '',
          courses: [],
        };
        await setDoc(userRef, {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isVerified: newUser.isVerified,
          onboardingCompleted: newUser.onboardingCompleted,
          uniId: newUser.uniId,
          faculty: newUser.faculty,
          department: newUser.department,
          semester: newUser.semester,
          courses: newUser.courses,
          createdAt: serverTimestamp()
        });
        setUser(newUser);
      } else {
        setUser({ uid: firebaseUser.uid, ...userDoc.data() } as User);
      }
      return true;
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      storeLogout();
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return false;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);
      setUser({ ...user, ...updates });
      return true;
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    if (!user) return false;
    setLoading(true);
    try {
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile({ photoURL: url });
      return url;
    } catch (err: any) {
      console.error('Failed to upload picture:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user || !auth.currentUser) return false;
    setLoading(true);
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      // Delete from Auth
      await firebaseDeleteUser(auth.currentUser);
      setUser(null);
      return true;
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const linkGoogleCalendar = async () => {
    if (!user || !auth.currentUser) return false;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      provider.setCustomParameters({ access_type: 'offline', prompt: 'consent' });

      const result = await linkWithPopup(auth.currentUser, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      // We only care about the refresh token for background serverless access
      // However, Firebase Client SDK's linkWithPopup might not return a stable refresh token for the credential, 
      // but it does store it in the user's providerData. Sometimes we need to get it from result.user.refreshToken 
      // or from credential.accessToken (though we really want refresh token).
      // For the sake of this implementation, we will store whatever token we get.
      // Firebase doesn't directly expose Google refresh tokens on the client side reliably without a custom backend flow,
      // but we will simulate it here.
      if (credential?.accessToken) {
        await updateProfile({ googleCalendarLinked: true, googleAccessToken: credential.accessToken });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to link Google Calendar:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isLoading,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile,
    uploadProfilePicture,
    deleteAccount,
    linkGoogleCalendar,
  };
};
