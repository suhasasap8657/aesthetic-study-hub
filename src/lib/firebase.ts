import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  Timestamp
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDKl-g9e7KOqtfswrMMmiPaM7FrGYFRfKg",
  authDomain: "bmcri-96a6e.firebaseapp.com",
  projectId: "bmcri-96a6e",
  storageBucket: "bmcri-96a6e.firebasestorage.app",
  messagingSenderId: "372865523114",
  appId: "1:372865523114:web:69623c886f7ac6984b1fd3",
  measurementId: "G-XNE6W45Q6F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Analytics only in browser
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Helper functions
export const getTodayKey = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export const formatDateKey = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Types
export interface ExamDate {
  id: string;
  name: string;
  date: string;
  createdAt: string;
}

export interface DailyProgress {
  date: string;
  targetsCompleted: string[];
  totalTargets: number;
  videoTime: number;
  qsTime: number;
  isComplete: boolean;
}

export interface SessionData {
  type: 'video' | 'qs';
  date: string;
  duration: number;
  startTime: string;
  endTime: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  rank: 'none' | 'bronze' | 'silver' | 'gold' | 'diamond';
}

export interface UserData {
  exams: ExamDate[];
  dailyProgress: Record<string, DailyProgress>;
  sessions: SessionData[];
  streak: StreakData;
}

// Firebase operations
export const saveExams = async (exams: ExamDate[]) => {
  const docRef = doc(db, 'userData', 'exams');
  await setDoc(docRef, { exams }, { merge: true });
  localStorage.setItem('exams', JSON.stringify(exams));
};

export const getExams = async (): Promise<ExamDate[]> => {
  try {
    const docRef = doc(db, 'userData', 'exams');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      localStorage.setItem('exams', JSON.stringify(data.exams || []));
      return data.exams || [];
    }
  } catch (error) {
    console.error('Firebase error, using localStorage:', error);
  }
  const local = localStorage.getItem('exams');
  return local ? JSON.parse(local) : [];
};

export const saveDailyProgress = async (progress: DailyProgress) => {
  const docRef = doc(db, 'dailyProgress', progress.date);
  await setDoc(docRef, progress, { merge: true });
  
  // Also save to localStorage
  const allProgress = JSON.parse(localStorage.getItem('dailyProgress') || '{}');
  allProgress[progress.date] = progress;
  localStorage.setItem('dailyProgress', JSON.stringify(allProgress));
};

export const getDailyProgress = async (date: string): Promise<DailyProgress | null> => {
  try {
    const docRef = doc(db, 'dailyProgress', date);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as DailyProgress;
    }
  } catch (error) {
    console.error('Firebase error:', error);
  }
  
  const allProgress = JSON.parse(localStorage.getItem('dailyProgress') || '{}');
  return allProgress[date] || null;
};

export const getAllDailyProgress = async (): Promise<Record<string, DailyProgress>> => {
  const progressMap: Record<string, DailyProgress> = {};
  
  try {
    const progressRef = collection(db, 'dailyProgress');
    const q = query(progressRef, orderBy('date', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      progressMap[doc.id] = doc.data() as DailyProgress;
    });
    
    localStorage.setItem('dailyProgress', JSON.stringify(progressMap));
  } catch (error) {
    console.error('Firebase error, using localStorage:', error);
    return JSON.parse(localStorage.getItem('dailyProgress') || '{}');
  }
  
  return progressMap;
};

export const saveSession = async (session: SessionData) => {
  const docRef = doc(db, 'sessions', `${session.date}-${session.type}-${Date.now()}`);
  await setDoc(docRef, session);
  
  // Also save to localStorage
  const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
  sessions.push(session);
  localStorage.setItem('sessions', JSON.stringify(sessions));
};

export const getSessions = async (): Promise<SessionData[]> => {
  try {
    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, orderBy('date', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);
    
    const sessions: SessionData[] = [];
    querySnapshot.forEach((doc) => {
      sessions.push(doc.data() as SessionData);
    });
    
    localStorage.setItem('sessions', JSON.stringify(sessions));
    return sessions;
  } catch (error) {
    console.error('Firebase error:', error);
    return JSON.parse(localStorage.getItem('sessions') || '[]');
  }
};

export const saveStreak = async (streak: StreakData) => {
  const docRef = doc(db, 'userData', 'streak');
  await setDoc(docRef, streak, { merge: true });
  localStorage.setItem('streak', JSON.stringify(streak));
};

export const getStreak = async (): Promise<StreakData> => {
  const defaultStreak: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: '',
    rank: 'none'
  };
  
  try {
    const docRef = doc(db, 'userData', 'streak');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as StreakData;
      localStorage.setItem('streak', JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.error('Firebase error:', error);
  }
  
  const local = localStorage.getItem('streak');
  return local ? JSON.parse(local) : defaultStreak;
};

// Calculate rank based on streak
export const calculateRank = (streak: number): 'none' | 'bronze' | 'silver' | 'gold' | 'diamond' => {
  if (streak >= 74) return 'diamond';
  if (streak >= 54) return 'gold';
  if (streak >= 33) return 'silver';
  if (streak >= 13) return 'bronze';
  return 'none';
};

// Listen for real-time updates
export const subscribeToProgress = (callback: (data: Record<string, DailyProgress>) => void) => {
  const progressRef = collection(db, 'dailyProgress');
  return onSnapshot(progressRef, (snapshot) => {
    const progressMap: Record<string, DailyProgress> = {};
    snapshot.forEach((doc) => {
      progressMap[doc.id] = doc.data() as DailyProgress;
    });
    callback(progressMap);
  });
};
