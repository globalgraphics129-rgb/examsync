export type UserRole = 'student' | 'classRep' | 'assistantRep' | 'lecturer' | 'admin';

export interface User {
  uid: string;
  matricNumber?: string;
  name: string;
  email: string;
  role: UserRole;
  faculty: string;
  department: string;
  semester: string;
  level?: number;
  uniId: string;
  fcmToken?: string;
  courses: string[];
  savedCourses?: string[]; // Legacy/retained for class reps
  verified?: boolean;
  isVerified?: boolean;
  createdAt: any;
  photoURL?: string;
  grades?: Record<string, { score: string; grade: string; unit: number }>;
  googleCalendarLinked?: boolean;
  googleAccessToken?: string;
}
