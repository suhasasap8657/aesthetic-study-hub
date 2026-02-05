import { useState, useEffect, useCallback } from 'react';
import { 
  DailySession, 
  getTodayKey, 
  getDailySession, 
  saveDailySession, 
  getUserStats, 
  updateUserStats,
  UserStats,
  VideoProgress,
  checkYesterdayStatus,
  logFailure
} from '@/lib/firebase';
import { 
  StudyTarget, 
  YouTubeVideoSlot, 
  DEFAULT_TARGETS, 
  DEFAULT_YOUTUBE_VIDEOS, 
  SessionState,
  getTodayTargets,
  REQUIRED_VIDEO_WATCH_TIME
} from '@/types/studyCrusher';

export const useStudySession = () => {
  const [session, setSession] = useState<SessionState>({
    isActive: false,
    startTime: null,
    videosCompleted: 0,
    currentVideoIndex: -1,
    videos: DEFAULT_YOUTUBE_VIDEOS.map((v, i) => ({ ...v, status: i === 0 ? 'locked' : 'locked' as const })),
    currentTargetIndex: -1,
    targets: getTodayTargets(),
    distractionCount: 0,
    focusCheckIns: [],
    isLocked: false,
    aiTimeUsed: 0,
    totalVideoWatchTime: 0
  });
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailySession, setDailySession] = useState<DailySession | null>(null);
  const [showFailurePopup, setShowFailurePopup] = useState(false);

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const today = getTodayKey();
      const existingSession = await getDailySession(today);
      const userStats = await getUserStats();
      
      // Check if yesterday was incomplete
      const yesterdayIncomplete = await checkYesterdayStatus();
      if (yesterdayIncomplete) {
        setShowFailurePopup(true);
      }
      
      setStats(userStats);
      setDailySession(existingSession);
      
      if (existingSession) {
        if (existingSession.sessionStarted && !existingSession.completed) {
          // Session was started but not completed - reset
          setSession(prev => ({
            ...prev,
            isLocked: false,
            videos: DEFAULT_YOUTUBE_VIDEOS.map((v, i) => ({ ...v, status: i === 0 ? 'locked' : 'locked' as const })),
            targets: getTodayTargets().map(t => ({ ...t, status: 'locked' as const })),
            totalVideoWatchTime: 0
          }));
        } else if (existingSession.completed) {
          // Session already completed today
          setSession(prev => ({
            ...prev,
            isActive: false,
            videosCompleted: 2,
            videos: DEFAULT_YOUTUBE_VIDEOS.map(v => ({ ...v, status: 'completed' as const })),
            targets: existingSession.targets as StudyTarget[],
            totalVideoWatchTime: existingSession.totalVideoWatchTime || 0
          }));
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const startSession = useCallback(async () => {
    const today = getTodayKey();
    const todayTargets = getTodayTargets();
    
    const initialVideos: VideoProgress[] = DEFAULT_YOUTUBE_VIDEOS.map(v => ({
      id: v.id,
      title: v.title,
      completed: false,
      watchedSeconds: 0
    }));
    
    const newSession: DailySession = {
      date: today,
      completed: false,
      videosWatched: initialVideos,
      targets: todayTargets.map(t => ({
        ...t,
        status: 'locked' as const
      })),
      totalOvertime: 0,
      distractionCount: 0,
      sessionStarted: new Date().toISOString(),
      aiTimeUsed: 0,
      totalVideoWatchTime: 0
    };
    
    await saveDailySession(newSession);
    setDailySession(newSession);
    
    setSession(prev => ({
      ...prev,
      isActive: true,
      startTime: new Date().toISOString(),
      videos: DEFAULT_YOUTUBE_VIDEOS.map((v, i) => ({
        ...v,
        status: i === 0 ? 'ready' : 'locked' as const
      })),
      targets: todayTargets.map(t => ({
        ...t,
        status: 'locked' as const
      })),
      totalVideoWatchTime: 0
    }));
  }, []);

  const updateVideoWatchTime = useCallback(async (seconds: number) => {
    setSession(prev => ({
      ...prev,
      totalVideoWatchTime: prev.totalVideoWatchTime + seconds
    }));
    
    if (dailySession) {
      await saveDailySession({
        ...dailySession,
        totalVideoWatchTime: (dailySession.totalVideoWatchTime || 0) + seconds
      });
    }
  }, [dailySession]);

  const completeVideo = useCallback(async (videoIndex: number) => {
    const videosCompleted = videoIndex + 1;
    const allVideosCompleted = videosCompleted >= 2;
    const totalWatchTime = session.totalVideoWatchTime;
    const hasEnoughWatchTime = totalWatchTime >= REQUIRED_VIDEO_WATCH_TIME;
    
    // Only unlock targets if watched 1 hour total
    const canUnlockTargets = allVideosCompleted && hasEnoughWatchTime;
    
    setSession(prev => ({
      ...prev,
      videosCompleted,
      currentVideoIndex: -1,
      videos: prev.videos.map((v, i) => {
        if (i === videoIndex) {
          return { ...v, status: 'completed' as const };
        }
        if (i === videoIndex + 1 && i < 2) {
          return { ...v, status: 'ready' as const };
        }
        return v;
      }),
      targets: canUnlockTargets 
        ? prev.targets.map((t, i) => ({
            ...t,
            status: i === 0 ? 'ready' : 'locked' as const
          }))
        : prev.targets
    }));
    
    if (dailySession) {
      const updatedVideos = dailySession.videosWatched?.map((v, i) => {
        if (i === videoIndex) {
          return { ...v, completed: true };
        }
        return v;
      }) || [];
      
      await saveDailySession({
        ...dailySession,
        videosWatched: updatedVideos
      });
    }
    
    return canUnlockTargets;
  }, [dailySession, session.totalVideoWatchTime]);

  const startTarget = useCallback((targetIndex: number) => {
    setSession(prev => ({
      ...prev,
      currentTargetIndex: targetIndex,
      targets: prev.targets.map((t, i) => ({
        ...t,
        status: i === targetIndex ? 'in_progress' : t.status
      }))
    }));
  }, []);

  const completeTarget = useCallback(async (targetIndex: number, timeSpent: number, overtime: number) => {
    const updatedTargets = session.targets.map((t, i) => {
      if (i === targetIndex) {
        return {
          ...t,
          status: 'done' as const,
          timeSpent,
          overtime,
          completedAt: new Date().toISOString()
        };
      }
      if (i === targetIndex + 1) {
        return { ...t, status: 'ready' as const };
      }
      return t;
    });

    setSession(prev => ({
      ...prev,
      currentTargetIndex: -1,
      targets: updatedTargets
    }));

    const allDone = updatedTargets.every(t => t.status === 'done');
    
    if (dailySession) {
      const totalOvertime = updatedTargets.reduce((sum, t) => sum + t.overtime, 0);
      
      await saveDailySession({
        ...dailySession,
        targets: updatedTargets,
        totalOvertime,
        completed: allDone,
        status: allDone ? 'full' : 'partial',
        completionTime: allDone ? new Date().toISOString() : undefined
      });

      if (allDone) {
        await updateStreak();
      }
    }

    return allDone;
  }, [session.targets, dailySession]);

  const updateStreak = useCallback(async () => {
    const today = getTodayKey();
    const currentStats = stats || {
      streakCount: 0,
      lastCompletedDate: '',
      totalDaysCompleted: 0,
      longestStreak: 0
    };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    // Check if yesterday was fully completed
    const yesterdaySession = await getDailySession(yesterdayKey);
    let newStreak = 1;
    
    if (currentStats.lastCompletedDate === yesterdayKey && yesterdaySession?.completed) {
      newStreak = currentStats.streakCount + 1;
    } else if (currentStats.lastCompletedDate !== yesterdayKey) {
      // Streak broken
      newStreak = 1;
    }

    const updatedStats: UserStats = {
      streakCount: newStreak,
      lastCompletedDate: today,
      totalDaysCompleted: currentStats.totalDaysCompleted + 1,
      longestStreak: Math.max(currentStats.longestStreak, newStreak)
    };

    await updateUserStats(updatedStats);
    setStats(updatedStats);
  }, [stats]);

  const addDistraction = useCallback(async () => {
    const newCount = session.distractionCount + 1;
    setSession(prev => ({
      ...prev,
      distractionCount: newCount
    }));

    if (dailySession) {
      await saveDailySession({
        ...dailySession,
        distractionCount: newCount
      });
    }

    if (newCount >= 3) {
      await logFailure(getTodayKey(), 'Too many distractions');
      return true;
    }
    return false;
  }, [session.distractionCount, dailySession]);

  const lockSession = useCallback(async (reason: string) => {
    setSession(prev => ({
      ...prev,
      isLocked: true,
      lockReason: reason
    }));

    await logFailure(getTodayKey(), reason);
  }, []);

  const updateAITime = useCallback(async (minutes: number) => {
    setSession(prev => ({
      ...prev,
      aiTimeUsed: prev.aiTimeUsed + minutes
    }));
    
    if (dailySession) {
      await saveDailySession({
        ...dailySession,
        aiTimeUsed: (dailySession.aiTimeUsed || 0) + minutes
      });
    }
  }, [dailySession]);

  const dismissFailurePopup = useCallback(() => {
    setShowFailurePopup(false);
  }, []);

  return {
    session,
    stats,
    loading,
    dailySession,
    showFailurePopup,
    startSession,
    completeVideo,
    startTarget,
    completeTarget,
    addDistraction,
    lockSession,
    updateAITime,
    updateVideoWatchTime,
    dismissFailurePopup,
    refreshSession: loadSession
  };
};
