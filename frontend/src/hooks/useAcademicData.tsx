import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import unilorinData from '../data/unilorin.json';

export type UniDataMap = Record<string, Record<string, Record<string, Record<string, string[]>>>>;

interface CrowdsourcedEntry {
  type: 'faculty' | 'department' | 'semester' | 'course';
  university: string;
  faculty: string;
  department?: string;
  semester?: string;
  value: string;
}

export const useAcademicData = () => {
  const [data, setData] = useState<UniDataMap>(unilorinData as UniDataMap);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        // Create a deep copy of the static JSON data to avoid mutating the import
        const mergedData: UniDataMap = JSON.parse(JSON.stringify(unilorinData));

        // 1. Fetch Migrated Academic Data (The new master list)
        const academicSnapshot = await getDocs(collection(db, 'academic_data'));
        academicSnapshot.forEach((docSnap) => {
          const entry = docSnap.data() as CrowdsourcedEntry;
          const { type, university, faculty, department, semester, value } = entry;

          if (!mergedData[university]) mergedData[university] = {};

          if (type === 'faculty') {
            if (!mergedData[university][value]) mergedData[university][value] = {};
          } else if (type === 'department' && faculty) {
            if (!mergedData[university][faculty]) mergedData[university][faculty] = {};
            if (!mergedData[university][faculty][value]) {
              mergedData[university][faculty][value] = { "Harmattan (1st)": [], "Rain (2nd)": [] };
            }
          } else if (type === 'course' && faculty && department && semester) {
            if (!mergedData[university][faculty]) mergedData[university][faculty] = {};
            if (!mergedData[university][faculty][department]) {
              mergedData[university][faculty][department] = { "Harmattan (1st)": [], "Rain (2nd)": [] };
            }
            if (!mergedData[university][faculty][department][semester]) {
              mergedData[university][faculty][department][semester] = [];
            }
            if (!mergedData[university][faculty][department][semester].includes(value)) {
              mergedData[university][faculty][department][semester].push(value);
            }
          }
        });

        // 2. Fetch AI Corrections First (Renames)
        const correctionsSnapshot = await getDocs(collection(db, 'ai_corrections'));
        // Sort by timestamp so older corrections are applied first if there are chains
        const corrections = correctionsSnapshot.docs
          .map(d => d.data())
          .sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));

        for (const correction of corrections) {
          const { type, university, faculty, action, oldValue, newValue } = correction;
          if (!mergedData[university]) mergedData[university] = {};

          if (type === 'faculty') {
            if (action === 'rename' && oldValue && mergedData[university][oldValue]) {
              mergedData[university][newValue] = mergedData[university][oldValue];
              delete mergedData[university][oldValue];
            } else if (action === 'add_new' && !mergedData[university][newValue]) {
              mergedData[university][newValue] = {};
            }
          } else if (type === 'department' && faculty) {
            if (!mergedData[university][faculty]) mergedData[university][faculty] = {};
            if (action === 'rename' && oldValue && mergedData[university][faculty][oldValue]) {
              mergedData[university][faculty][newValue] = mergedData[university][faculty][oldValue];
              delete mergedData[university][faculty][oldValue];
            } else if (action === 'add_new' && !mergedData[university][faculty][newValue]) {
              mergedData[university][faculty][newValue] = { "Harmattan (1st)": [], "Rain (2nd)": [] };
            }
          }
        }

        // 2. Fetch basic crowdsourced additions (just new nodes)
        const querySnapshot = await getDocs(collection(db, 'crowdsourced_data'));
        querySnapshot.forEach((docSnap) => {
          const entry = docSnap.data() as CrowdsourcedEntry;
          const { type, university, faculty, department, semester, value } = entry;

          if (!mergedData[university]) {
            mergedData[university] = {};
          }

          if (type === 'faculty') {
            if (!mergedData[university][value]) {
              mergedData[university][value] = {};
            }
          } else if (type === 'department' && faculty) {
            if (!mergedData[university][faculty]) mergedData[university][faculty] = {};
            if (!mergedData[university][faculty][value]) {
              mergedData[university][faculty][value] = { "Harmattan (1st)": [], "Rain (2nd)": [] };
            }
          } else if (type === 'course' && faculty && department && semester) {
            if (!mergedData[university][faculty]) mergedData[university][faculty] = {};
            if (!mergedData[university][faculty][department]) {
              mergedData[university][faculty][department] = { "Harmattan (1st)": [], "Rain (2nd)": [] };
            }
            if (!mergedData[university][faculty][department][semester]) {
              mergedData[university][faculty][department][semester] = [];
            }
            if (!mergedData[university][faculty][department][semester].includes(value)) {
              mergedData[university][faculty][department][semester].push(value);
            }
          }
        });

        setData(mergedData);
      } catch (error) {
        console.error('Failed to fetch dynamic data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDynamicData();
  }, []);

  return { uniData: data, isLoadingData: isLoading };
};
