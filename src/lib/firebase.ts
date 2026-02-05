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
  getDocs
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
  watchedSeconds: number;
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
  totalVideoWatchTime?: number;
  status?: 'full' | 'partial' | 'missed';
  failures?: string[];
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
  status: 'full' | 'partial' | 'missed';
  targetsCompleted: number;
  totalTargets: number;
}

export interface GraphData {
  date: string;
  completionPercentage: number;
  targetsCompleted: number;
  totalTargets: number;
  overtimeMinutes: number;
  distractionCount: number;
}

// Firebase helper functions
export const getTodayKey = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export const getYesterdayKey = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
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
      const targetsCompleted = session.targets?.filter(t => t.status === 'done').length || 0;
      const totalTargets = session.targets?.length || 4;
      
      let status: 'full' | 'partial' | 'missed' = 'missed';
      if (session.completed) {
        status = 'full';
      } else if (targetsCompleted > 0) {
        status = 'partial';
      }
      
      marks.push({
        date: session.date,
        status,
        targetsCompleted,
        totalTargets
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
    const targetsCompleted = session.targets?.filter(t => t.status === 'done').length || 0;
    const totalTargets = session.targets?.length || 4;
    
    let completionPercentage = 0;
    if (session.completed) {
      completionPercentage = 100;
    } else if (targetsCompleted > 0) {
      completionPercentage = Math.round((targetsCompleted / totalTargets) * 100);
    }
    
    stats.push({
      date: session.date,
      completionPercentage,
      targetsCompleted,
      totalTargets,
      overtimeMinutes: session.totalOvertime || 0,
      distractionCount: session.distractionCount || 0
    });
  });
  
  return stats.reverse();
};

// Log failures
export const logFailure = async (date: string, reason: string) => {
  const session = await getDailySession(date);
  const failures = session?.failures || [];
  failures.push(`${new Date().toISOString()}: ${reason}`);
  
  await saveDailySession({
    ...session,
    date,
    completed: false,
    videosWatched: session?.videosWatched || [],
    targets: session?.targets || [],
    totalOvertime: session?.totalOvertime || 0,
    distractionCount: session?.distractionCount || 0,
    failures
  });
};

// Update video watch time
export const updateVideoWatchTime = async (date: string, seconds: number) => {
  const session = await getDailySession(date);
  if (session) {
    await saveDailySession({
      ...session,
      totalVideoWatchTime: (session.totalVideoWatchTime || 0) + seconds
    });
  }
};

// Check if yesterday was incomplete (for failure popup)
export const checkYesterdayStatus = async (): Promise<boolean> => {
  const yesterday = getYesterdayKey();
  const session = await getDailySession(yesterday);
  
  if (session && session.sessionStarted && !session.completed) {
    return true; // Yesterday was incomplete
  }
  return false;
};
