import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const getDocument = async (col: string, id: string) => {
  const docRef = doc(db, col, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const setDocument = async (col: string, id: string, data: any) => {
  await setDoc(doc(db, col, id), {
    ...data,
    updatedAt: Timestamp.now(),
  }, { merge: true });
};

export const queryDocuments = async (col: string, constraints: any[]) => {
  const q = query(collection(db, col), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToCollection = (col: string, constraints: any[], callback: (data: any[]) => void) => {
  const q = query(collection(db, col), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};
