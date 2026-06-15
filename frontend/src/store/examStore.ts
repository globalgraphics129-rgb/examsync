import { create } from 'zustand';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ExamEntry } from '../types/exam.types';

interface ExamState {
  exams: ExamEntry[];
  isLoading: boolean;
  error: string | null;
  fetchExams: (filters: { dept?: string; level?: number; session?: string }) => Promise<void>;
  setExams: (exams: ExamEntry[]) => void;
  clearExams: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  exams: [],
  isLoading: false,
  error: null,
  setExams: (exams) => set({ exams }),
  clearExams: () => set({ exams: [] }),
  fetchExams: async (filters) => {
    // Skip if already loaded (cache)
    if (get().exams.length > 0) return;

    set({ isLoading: true, error: null });
    try {
      // Build Firestore query dynamically from filters
      const constraints: any[] = [];
      if (filters.dept) constraints.push(where('department', '==', filters.dept));
      if (filters.level) constraints.push(where('level', '==', filters.level));
      if (filters.session) constraints.push(where('session', '==', filters.session));

      const q = constraints.length > 0
        ? query(collection(db, 'timetable_entries'), ...constraints)
        : query(collection(db, 'timetable_entries'));

      const snapshot = await getDocs(q);
      const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ExamEntry[];

      set({ exams, isLoading: false });
    } catch (err: any) {
      console.error('fetchExams error:', err);
      // Don't block UI — just set empty
      set({ error: err.message, isLoading: false, exams: [] });
    }
  },
}));
