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
  where
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCAj23NPmCrVWzZFg9FwtBsm69HVpRqO18",
  authDomain: "air-100-972eb.firebaseapp.com",
  projectId: "air-100-972eb",
  storageBucket: "air-100-972eb.firebasestorage.app",
  messagingSenderId: "748658283943",
  appId: "1:748658283943:web:9e1c10bb833c05b953d282",
  measurementId: "G-28J4YJ4E8P"
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

// Types
export interface VideoProgress {
  id: string;
  title: string;
  completed: boolean;
  watchedDuration: number;
  totalDuration: number;
  completedAt?: string;
}

export interface DailySession {
  date: string;
  completed: boolean;
  videosWatched: VideoProgress[];
  targets: TargetProgress[];
  totalOvertime: number;
  distractionCount: number;
  completionTime?: string;
  sessionStarted?: string;
  sessionLocked?: boolean;
  aiTimeUsed?: number;
  pinAttempts?: number;
}

export interface TargetProgress {
  id: string;
  name: string;
  totalMinutes: number;
  minMinutes: number;
  status: 'locked' | 'ready' | 'in_progress' | 'done';
  timeSpent: number;
  overtime: number;
  completedAt?: string;
}

export interface UserStats {
  streakCount: number;
  lastCompletedDate: string;
  totalDaysCompleted: number;
  longestStreak: number;
}

export interface CalendarMark {
  date: string;
  status: 'green' | 'red' | 'pending';
}

export interface DailyPIN {
  pin: string;
  date: string;
  setAt: string;
}

export interface GraphData {
  date: string;
  completionPercentage: number;
  overtimeMinutes: number;
  distractionCount: number;
  aiTimeMinutes: number;
}

// Firebase helper functions
export const getTodayKey = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Daily PIN functions - fetch from Firebase
export const getDailyPINFromFirebase = async (date: string): Promise<DailyPIN | null> => {
  try {
    const docRef = doc(db, 'dailyPins', date);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as DailyPIN) : null;
  } catch (error) {
    console.error('Error fetching PIN:', error);
    return null;
  }
};

// Set daily PIN (for admin/manual use via Firebase console)
export const setDailyPIN = async (date: string, pin: string) => {
  const docRef = doc(db, 'dailyPins', date);
  await setDoc(docRef, {
    pin,
    date,
    setAt: new Date().toISOString()
  });
};

// Log PIN attempts
export const logPINAttempt = async (date: string, success: boolean, attempts: number) => {
  const docRef = doc(db, 'logs', `${date}-pin`);
  await setDoc(docRef, {
    date,
    success,
    attempts,
    timestamp: new Date().toISOString()
  }, { merge: true });
};

export const saveDailySession = async (session: DailySession) => {
  const docRef = doc(db, 'dailySessions', session.date);
  await setDoc(docRef, session, { merge: true });
};

export const getDailySession = async (date: string): Promise<DailySession | null> => {
  const docRef = doc(db, 'dailySessions', date);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as DailySession) : null;
};

export const updateUserStats = async (stats: UserStats) => {
  const docRef = doc(db, 'userStats', 'main');
  await setDoc(docRef, stats, { merge: true });
};

export const getUserStats = async (): Promise<UserStats | null> => {
  const docRef = doc(db, 'userStats', 'main');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as UserStats) : null;
};

export const getCalendarMarks = async (year: number, month: number): Promise<CalendarMark[]> => {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;
  
  const sessionsRef = collection(db, 'dailySessions');
  const q = query(sessionsRef, orderBy('date'), limit(100));
  const querySnapshot = await getDocs(q);
  
  const marks: CalendarMark[] = [];
  querySnapshot.forEach((doc) => {
    const session = doc.data() as DailySession;
    if (session.date >= startDate && session.date <= endDate) {
      marks.push({
        date: session.date,
        status: session.completed ? 'green' : 'red'
      });
    }
  });
  
  return marks;
};

export const getLast30DaysStats = async (): Promise<GraphData[]> => {
  const sessionsRef = collection(db, 'dailySessions');
  const q = query(sessionsRef, orderBy('date', 'desc'), limit(30));
  const querySnapshot = await getDocs(q);
  
  const stats: GraphData[] = [];
  querySnapshot.forEach((doc) => {
    const session = doc.data() as DailySession;
    const videosCompleted = session.videosWatched?.filter(v => v.completed).length || 0;
    const targetsCompleted = session.targets?.filter(t => t.status === 'done').length || 0;
    const totalItems = (session.videosWatched?.length || 3) + (session.targets?.length || 4);
    
    stats.push({
      date: session.date,
      completionPercentage: session.completed ? 100 : Math.round(((videosCompleted + targetsCompleted) / totalItems) * 100),
      overtimeMinutes: session.totalOvertime || 0,
      distractionCount: session.distractionCount || 0,
      aiTimeMinutes: session.aiTimeUsed || 0
    });
  });
  
  return stats.reverse();
};

// Update AI time used
export const updateAITimeUsed = async (date: string, minutes: number) => {
  const docRef = doc(db, 'dailySessions', date);
  const existing = await getDailySession(date);
  if (existing) {
    await updateDoc(docRef, {
      aiTimeUsed: (existing.aiTimeUsed || 0) + minutes
    });
  }
};

// Check if current time is within allowed window (8 AM - 10 PM)
export const isWithinTimeWindow = (): boolean => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 8 && hour < 22;
};

// Generate fallback PIN based on date (only used if no Firebase PIN set)
export const getFallbackPIN = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const pin = ((day * month * year + 1234) % 10000).toString().padStart(4, '0');
  return pin;
};
