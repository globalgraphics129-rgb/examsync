import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'student' | 'classRep' | 'assistantRep' | 'lecturer' | 'admin';

export interface User {
  uid: string;
  matricNumber?: string;
  name: string;
  email: string;
  role: UserRole;
  faculty: string;
  department: string;
  level?: number;
  uniId: string;
  fcmToken?: string;
  semester?: string;
  courses?: string[];
  savedCourses?: string[];
  verified?: boolean;
  isVerified?: boolean;
  createdAt?: any;
  photoURL?: string;
  grades?: Record<string, { score: string; grade: string; unit: number }>;
  googleCalendarLinked?: boolean;
  googleAccessToken?: string;
  onboardingCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, isAuthenticated: false, error: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
