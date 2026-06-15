import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface SiteSettings {
  maintenanceMode: boolean;
  announcement: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    maintenanceMode: false,
    announcement: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site_config', 'settings'), 
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SiteSettings);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Site settings fetch failed:', err);
        setLoading(false); // Still stop loading so app can render defaults
      }
    );
    return () => unsub();
  }, []);

  return { settings, isLoadingSettings: loading };
};
