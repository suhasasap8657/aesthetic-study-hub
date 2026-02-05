export interface StudyTarget {
  id: string;
  name: string;
  totalMinutes: number;
  minMinutes: number;
  status: 'locked' | 'ready' | 'in_progress' | 'done';
  timeSpent: number;
  overtime: number;
  completedAt?: string;
}

export interface YouTubeVideoSlot {
  id: string;
  title: string;
  youtubeUrl: string;
  status: 'locked' | 'ready' | 'playing' | 'completed';
  watchedSeconds: number;
}

export interface CommitmentItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface FocusCheckIn {
  timestamp: number;
  responded: boolean;
  responseTime?: number;
}

export interface SessionState {
  isActive: boolean;
  startTime: string | null;
  videosCompleted: number;
  currentVideoIndex: number;
  videos: YouTubeVideoSlot[];
  currentTargetIndex: number;
  targets: StudyTarget[];
  distractionCount: number;
  focusCheckIns: FocusCheckIn[];
  isLocked: boolean;
  lockReason?: string;
  aiTimeUsed: number;
  totalVideoWatchTime: number;
}

export interface DayStats {
  date: string;
  completed: boolean;
  completionPercentage: number;
  totalOvertime: number;
  distractionCount: number;
  targetsCompleted: number;
  totalTargets: number;
}

// Monthly targets data structure - EDIT THIS ARRAY TO SET YOUR TARGETS
export interface MonthlyTarget {
  month: string; // e.g., "February 2026"
  days: DayTarget[];
}

export interface DayTarget {
  day: number;
  targets: TargetConfig[];
}

export interface TargetConfig {
  name: string;
  totalMinutes: number;
  minMinutes: number;
}

// EDIT THIS: Set your monthly study plan here
export const MONTHLY_TARGETS: MonthlyTarget[] = [
  {
    month: "February 2026",
    days: [
      { day: 1, targets: [
        { name: "Chemistry - Alcohols & Phenols", totalMinutes: 180, minMinutes: 120 },
        { name: "Biology - Human Reproduction", totalMinutes: 150, minMinutes: 90 },
        { name: "Physics - Current Electricity", totalMinutes: 120, minMinutes: 60 },
        { name: "Revision + Doubts", totalMinutes: 90, minMinutes: 45 }
      ]},
      { day: 2, targets: [
        { name: "Chemistry - Ethers", totalMinutes: 180, minMinutes: 120 },
        { name: "Biology - Reproductive Health", totalMinutes: 150, minMinutes: 90 },
        { name: "Physics - Moving Charges", totalMinutes: 120, minMinutes: 60 },
        { name: "Revision + Doubts", totalMinutes: 90, minMinutes: 45 }
      ]},
      { day: 3, targets: [
        { name: "Chemistry - Aldehydes & Ketones", totalMinutes: 180, minMinutes: 120 },
        { name: "Biology - Genetics", totalMinutes: 150, minMinutes: 90 },
        { name: "Physics - Magnetism", totalMinutes: 120, minMinutes: 60 },
        { name: "Revision + Doubts", totalMinutes: 90, minMinutes: 45 }
      ]},
      { day: 4, targets: [
        { name: "Chemistry - Carboxylic Acids", totalMinutes: 180, minMinutes: 120 },
        { name: "Biology - Molecular Basis of Inheritance", totalMinutes: 150, minMinutes: 90 },
        { name: "Physics - EMI", totalMinutes: 120, minMinutes: 60 },
        { name: "Revision + Doubts", totalMinutes: 90, minMinutes: 45 }
      ]},
      { day: 5, targets: [
        { name: "Chemistry - Amines", totalMinutes: 180, minMinutes: 120 },
        { name: "Biology - Evolution", totalMinutes: 150, minMinutes: 90 },
        { name: "Physics - AC", totalMinutes: 120, minMinutes: 60 },
        { name: "Revision + Doubts", totalMinutes: 90, minMinutes: 45 }
      ]}
      // Add more days as needed...
    ]
  }
];

// Default YouTube videos - EDIT URLS HERE
export const DEFAULT_YOUTUBE_VIDEOS: YouTubeVideoSlot[] = [
  {
    id: 'video-1',
    title: 'Lecture Video 1',
    youtubeUrl: '', // PASTE YOUR YOUTUBE URL HERE
    status: 'locked',
    watchedSeconds: 0
  },
  {
    id: 'video-2',
    title: 'Lecture Video 2',
    youtubeUrl: '', // PASTE YOUR YOUTUBE URL HERE
    status: 'locked',
    watchedSeconds: 0
  }
];

// Default targets (used when no monthly plan exists for today)
export const DEFAULT_TARGETS: StudyTarget[] = [
  {
    id: 'target-1',
    name: 'Chemistry Practice',
    totalMinutes: 180,
    minMinutes: 120,
    status: 'locked',
    timeSpent: 0,
    overtime: 0
  },
  {
    id: 'target-2',
    name: 'Biology NCERT',
    totalMinutes: 150,
    minMinutes: 90,
    status: 'locked',
    timeSpent: 0,
    overtime: 0
  },
  {
    id: 'target-3',
    name: 'Physics Problems',
    totalMinutes: 120,
    minMinutes: 60,
    status: 'locked',
    timeSpent: 0,
    overtime: 0
  },
  {
    id: 'target-4',
    name: 'Revision + Doubts',
    totalMinutes: 90,
    minMinutes: 45,
    status: 'locked',
    timeSpent: 0,
    overtime: 0
  }
];

export const DEFAULT_COMMITMENTS: CommitmentItem[] = [
  { id: 'commit-1', text: 'Phone on Do Not Disturb', checked: false },
  { id: 'commit-2', text: 'No snacks until done', checked: false },
  { id: 'commit-3', text: 'No social media breaks', checked: false },
  { id: 'commit-4', text: 'Complete focus for each target', checked: false }
];

export const COMMITMENT_PHRASE = "Today I will finish all targets without distractions";

// Get today's targets from monthly plan
export const getTodayTargets = (): StudyTarget[] => {
  const today = new Date();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayOfMonth = today.getDate();
  
  const monthPlan = MONTHLY_TARGETS.find(m => m.month === monthName);
  if (!monthPlan) return DEFAULT_TARGETS;
  
  const dayPlan = monthPlan.days.find(d => d.day === dayOfMonth);
  if (!dayPlan) return DEFAULT_TARGETS;
  
  return dayPlan.targets.map((t, i) => ({
    id: `target-${i + 1}`,
    name: t.name,
    totalMinutes: t.totalMinutes,
    minMinutes: t.minMinutes,
    status: 'locked' as const,
    timeSpent: 0,
    overtime: 0
  }));
};

export const REQUIRED_VIDEO_WATCH_TIME = 3600; // 1 hour total in seconds
