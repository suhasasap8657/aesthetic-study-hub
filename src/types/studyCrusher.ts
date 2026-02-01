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
  videoCompleted: boolean;
  currentTargetIndex: number;
  targets: StudyTarget[];
  distractionCount: number;
  focusCheckIns: FocusCheckIn[];
  isLocked: boolean;
  lockReason?: string;
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

export const DEFAULT_TARGETS: StudyTarget[] = [
  {
    id: 'target-1',
    name: 'Math Exercises',
    totalMinutes: 180, // 3 hours
    minMinutes: 120, // 2 hours
    status: 'locked',
    timeSpent: 0,
    overtime: 0
  },
  {
    id: 'target-2',
    name: 'Physics Problems',
    totalMinutes: 150, // 2.5 hours
    minMinutes: 90, // 1.5 hours
    status: 'locked',
    timeSpent: 0,
    overtime: 0
  },
  {
    id: 'target-3',
    name: 'Chemistry Revision',
    totalMinutes: 120, // 2 hours
    minMinutes: 60, // 1 hour
    status: 'locked',
    timeSpent: 0,
    overtime: 0
  },
  {
    id: 'target-4',
    name: 'Biology NCERT',
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
