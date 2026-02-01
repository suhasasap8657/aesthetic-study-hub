import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
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
export interface DailySession {
  date: string;
  completed: boolean;
  videoWatched: boolean;
  targets: TargetProgress[];
  totalOvertime: number;
  distractionCount: number;
  completionTime?: string;
  sessionStarted?: string;
  sessionLocked?: boolean;
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

// Firebase helper functions
export const getTodayKey = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
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

export const getLast30DaysStats = async () => {
  const sessionsRef = collection(db, 'dailySessions');
  const q = query(sessionsRef, orderBy('date', 'desc'), limit(30));
  const querySnapshot = await getDocs(q);
  
  const stats: DailySession[] = [];
  querySnapshot.forEach((doc) => {
    stats.push(doc.data() as DailySession);
  });
  
  return stats.reverse();
};

// Generate daily PIN based on date
export const getDailyPIN = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  // Simple formula: last 4 digits of (day * month * year + 1234)
  const pin = ((day * month * year + 1234) % 10000).toString().padStart(4, '0');
  return pin;
};

// Check if current time is within allowed window (8 AM - 10 PM)
export const isWithinTimeWindow = (): boolean => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 8 && hour < 22;
};
