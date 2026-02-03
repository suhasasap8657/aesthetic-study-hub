import { useState, useEffect, useCallback } from 'react';
import { 
  DailySession, 
  getTodayKey, 
  getDailySession, 
  saveDailySession, 
  getUserStats, 
  updateUserStats,
  UserStats,
  VideoProgress
} from '@/lib/firebase';
import { StudyTarget, VideoSlot, DEFAULT_TARGETS, DEFAULT_VIDEOS, SessionState } from '@/types/studyCrusher';

export const useStudySession = () => {
  const [session, setSession] = useState<SessionState>({
    isActive: false,
    startTime: null,
    videosCompleted: 0,
    currentVideoIndex: -1,
    videos: DEFAULT_VIDEOS.map((v, i) => ({ ...v, status: i === 0 ? 'locked' : 'locked' })),
    currentTargetIndex: -1,
    targets: DEFAULT_TARGETS,
    distractionCount: 0,
    focusCheckIns: [],
    isLocked: false,
    aiTimeUsed: 0
  });
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailySession, setDailySession] = useState<DailySession | null>(null);

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const today = getTodayKey();
      const existingSession = await getDailySession(today);
      const userStats = await getUserStats();
      
      setStats(userStats);
      setDailySession(existingSession);
      
      if (existingSession) {
        // Check if session was incomplete
        if (existingSession.sessionStarted && !existingSession.completed) {
          // Session was started but not completed - reset
          setSession(prev => ({
            ...prev,
            isLocked: false,
            videos: DEFAULT_VIDEOS.map((v, i) => ({ ...v, status: i === 0 ? 'locked' : 'locked' })),
            targets: DEFAULT_TARGETS.map(t => ({ ...t, status: 'locked' as const }))
          }));
        } else if (existingSession.completed) {
          // Session already completed today
          const videosFromSession = existingSession.videosWatched?.map((v, i) => ({
            ...DEFAULT_VIDEOS[i],
            ...v,
            status: 'completed' as const
          })) || DEFAULT_VIDEOS;
          
          setSession(prev => ({
            ...prev,
            isActive: false,
            videosCompleted: 3,
            videos: videosFromSession,
            targets: existingSession.targets as StudyTarget[]
          }));
        } else if (existingSession.sessionLocked) {
          setSession(prev => ({
            ...prev,
            isLocked: true,
            lockReason: 'Wrong PIN or outside time window'
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
    const initialVideos: VideoProgress[] = DEFAULT_VIDEOS.map(v => ({
      id: v.id,
      title: v.title,
      completed: false,
      watchedDuration: 0,
      totalDuration: 0
    }));
    
    const newSession: DailySession = {
      date: today,
      completed: false,
      videosWatched: initialVideos,
      targets: session.targets.map(t => ({
        ...t,
        status: 'locked' as const
      })),
      totalOvertime: 0,
      distractionCount: 0,
      sessionStarted: new Date().toISOString(),
      aiTimeUsed: 0
    };
    
    await saveDailySession(newSession);
    setDailySession(newSession);
    
    setSession(prev => ({
      ...prev,
      isActive: true,
      startTime: new Date().toISOString(),
      videos: prev.videos.map((v, i) => ({
        ...v,
        status: i === 0 ? 'ready' : 'locked'
      })),
      targets: prev.targets.map(t => ({
        ...t,
        status: 'locked'
      }))
    }));
  }, [session.targets]);

  const completeVideo = useCallback(async (videoIndex: number) => {
    const videosCompleted = videoIndex + 1;
    const allVideosCompleted = videosCompleted >= 3;
    
    setSession(prev => ({
      ...prev,
      videosCompleted,
      currentVideoIndex: -1,
      videos: prev.videos.map((v, i) => {
        if (i === videoIndex) {
          return { ...v, status: 'completed' as const };
        }
        if (i === videoIndex + 1 && i < 3) {
          return { ...v, status: 'ready' as const };
        }
        return v;
      }),
      targets: allVideosCompleted 
        ? prev.targets.map((t, i) => ({
            ...t,
            status: i === 0 ? 'ready' : 'locked'
          }))
        : prev.targets
    }));
    
    if (dailySession) {
      const updatedVideos = dailySession.videosWatched?.map((v, i) => {
        if (i === videoIndex) {
          return { ...v, completed: true, completedAt: new Date().toISOString() };
        }
        return v;
      }) || [];
      
      await saveDailySession({
        ...dailySession,
        videosWatched: updatedVideos
      });
    }
    
    return allVideosCompleted;
  }, [dailySession]);

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

    // Check if all targets are done
    const allDone = updatedTargets.every(t => t.status === 'done');
    
    if (dailySession) {
      const totalOvertime = updatedTargets.reduce((sum, t) => sum + t.overtime, 0);
      
      await saveDailySession({
        ...dailySession,
        targets: updatedTargets,
        totalOvertime,
        completed: allDone,
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

    let newStreak = 1;
    if (currentStats.lastCompletedDate === yesterdayKey) {
      newStreak = currentStats.streakCount + 1;
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

    // Too many distractions = session reset
    if (newCount >= 3) {
      return true; // Signal reset needed
    }
    return false;
  }, [session.distractionCount, dailySession]);

  const lockSession = useCallback(async (reason: string) => {
    setSession(prev => ({
      ...prev,
      isLocked: true,
      lockReason: reason
    }));

    const today = getTodayKey();
    await saveDailySession({
      date: today,
      completed: false,
      videosWatched: [],
      targets: [],
      totalOvertime: 0,
      distractionCount: 0,
      sessionLocked: true
    });
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

  return {
    session,
    stats,
    loading,
    dailySession,
    startSession,
    completeVideo,
    startTarget,
    completeTarget,
    addDistraction,
    lockSession,
    updateAITime,
    refreshSession: loadSession
  };
};
