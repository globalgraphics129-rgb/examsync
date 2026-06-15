export type ExamType = 'CBT' | 'Written';
export type ConfidenceLevel = 'high' | 'low';

export interface ExamEntry {
  id: string;
  courseCode: string;
  courseTitle: string;
  faculty: string;
  department: string;
  level: number;
  date: string; // ISO format: YYYY-MM-DD
  time: string; // 24hr format: HH:MM
  venue: string;
  examType: ExamType;
  duration: number; // in minutes
  aiConfidence: ConfidenceLevel;
  manuallyVerified: boolean;
  conflictFlagged: boolean;
  updatedAt: any; // Firestore Timestamp
}

export interface TimetableSession {
  id: string;
  uniId: string;
  session: string; // e.g. "2025/2026"
  faculty: string;
  department: string | null;
  level: number | null;
  type: 'CBT' | 'Departmental' | 'Faculty';
  uploadedBy: string; // userId
  sourceFileUrl: string;
  publishedAt: any;
  updatedAt: any;
}
