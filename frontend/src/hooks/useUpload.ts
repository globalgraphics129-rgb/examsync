import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import api from '../lib/api';
import type { ExamEntry } from '../types/exam.types';

export const useUpload = () => {
  const [isParsing, setIsParsing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [extractedEntries, setExtractedEntries] = useState<ExamEntry[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const parsePDF = async (file: File) => {
    setIsParsing(true);
    setError(null);
    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const pdfBase64 = await base64Promise;
      
      const response = await api.post<any>('/parse', {
        pdfBase64,
        metadata: { fileName: file.name },
      });

      // Map backend confidence to frontend type if needed
      setExtractedEntries(response.data.entries as any);
      setMetadata({
        totalFound: response.data.totalFound,
        sessionDetected: response.data.sessionDetected,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to parse PDF');
    } finally {
      setIsParsing(false);
    }
  };

  const publish = async (sessionMetadata: any) => {
    setIsPublishing(true);
    setError(null);
    try {
      const promises = extractedEntries.map(entry =>
        addDoc(collection(db, 'timetable_entries'), {
          ...entry,
          ...sessionMetadata,
          publishedAt: serverTimestamp(),
        })
      );
      await Promise.all(promises);
      setExtractedEntries([]);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to publish timetable');
      return false;
    } finally {
      setIsPublishing(false);
    }
  };

  const updateEntry = (index: number, updates: Partial<ExamEntry>) => {
    const newEntries = [...extractedEntries];
    newEntries[index] = { ...newEntries[index], ...updates };
    setExtractedEntries(newEntries);
  };

  return {
    isParsing,
    isPublishing,
    extractedEntries,
    metadata,
    error,
    parsePDF,
    publish,
    updateEntry,
  };
};
