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

export interface VideoSlot {
  id: string;
  title: string;
  src: string;
  thumbnail: string;
  status: 'locked' | 'ready' | 'playing' | 'completed';
  watchedDuration: number;
  totalDuration: number;
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
  videos: VideoSlot[];
  currentTargetIndex: number;
  targets: StudyTarget[];
  distractionCount: number;
  focusCheckIns: FocusCheckIn[];
  isLocked: boolean;
  lockReason?: string;
  aiTimeUsed: number;
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

// Default video slots - Sources can be edited to point to /public folder MP4s
export const DEFAULT_VIDEOS: VideoSlot[] = [
  {
    id: 'video-1',
    title: 'Lecture Video 1',
    src: '/placeholder-video1.mp4', // Edit this to your video: e.g., '/lecture1.mp4'
    thumbnail: '/video-placeholder.svg',
    status: 'locked',
    watchedDuration: 0,
    totalDuration: 0
  },
  {
    id: 'video-2',
    title: 'Lecture Video 2',
    src: '/placeholder-video2.mp4', // Edit this to your video: e.g., '/lecture2.mp4'
    thumbnail: '/video-placeholder.svg',
    status: 'locked',
    watchedDuration: 0,
    totalDuration: 0
  },
  {
    id: 'video-3',
    title: 'Lecture Video 3',
    src: '/placeholder-video3.mp4', // Edit this to your video: e.g., '/lecture3.mp4'
    thumbnail: '/video-placeholder.svg',
    status: 'locked',
    watchedDuration: 0,
    totalDuration: 0
  }
];

export const DEFAULT_TARGETS: StudyTarget[] = [
  {
    id: 'target-1',
    name: 'Chemistry Questions',
    totalMinutes: 180, // 3 hours
    minMinutes: 120, // 2 hours
    status: 'locked',
    timeSpent: 0,
    overtime: 0
  },
  {
    id: 'target-2',
    name: 'Biology NCERT Reading',
    totalMinutes: 150, // 2.5 hours
    minMinutes: 90, // 1.5 hours
    status: 'locked',
    timeSpent: 0,
    overtime: 0
  },
  {
    id: 'target-3',
    name: 'Physics Problems',
    totalMinutes: 120, // 2 hours
    minMinutes: 60, // 1 hour
    status: 'locked',
    timeSpent: 0,
    overtime: 0
  },
  {
    id: 'target-4',
    name: 'Revision + Doubts',
    totalMinutes: 90, // 1.5 hours
    minMinutes: 45, // 45 min
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
