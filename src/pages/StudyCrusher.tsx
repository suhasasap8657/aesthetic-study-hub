import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Target, Play, Lock, Image, MessageSquare, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudySession } from '@/hooks/useStudySession';
import CommitmentCeremony from '@/components/crusher/CommitmentCeremony';
import CustomVideoPlayer from '@/components/crusher/CustomVideoPlayer';
import TargetCard from '@/components/crusher/TargetCard';
import FocusMode from '@/components/crusher/FocusMode';
import RewardScreen from '@/components/crusher/RewardScreen';
import CrusherCalendar from '@/components/crusher/CrusherCalendar';
import StatsGraph from '@/components/crusher/StatsGraph';
import StreakCounter from '@/components/crusher/StreakCounter';

// Placeholder video URL - can be changed
const DEFAULT_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

// Goal image and message - editable
const GOAL_IMAGE = '/placeholder.svg';
const GOAL_MESSAGE = 'AIR under 1000 - BMCRI or nothing! 💪';

const StudyCrusher = () => {
  const navigate = useNavigate();
  const {
    session,
    stats,
    loading,
    dailySession,
    startSession,
    completeVideo,
    startTarget,
    completeTarget,
    addDistraction,
    lockSession
  } = useStudySession();

  const [showCeremony, setShowCeremony] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [activeTargetIndex, setActiveTargetIndex] = useState(-1);
  const [showReward, setShowReward] = useState(false);
  const [showWeeklyOverview, setShowWeeklyOverview] = useState(false);
  const [distractionWarning, setDistractionWarning] = useState('');

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Check for incomplete previous session
  useEffect(() => {
    if (!loading && dailySession?.sessionStarted && !dailySession?.completed) {
      // Previous session was incomplete
      setDistractionWarning('Previous session incomplete — starting over');
    }
  }, [loading, dailySession]);

  // Warn on page close
  useEffect(() => {
    if (session.isActive) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Your study session is in progress. Are you sure you want to leave?';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [session.isActive]);

  const handleStartSession = async () => {
    await startSession();
    setShowCeremony(false);
  };

  const handleVideoComplete = async () => {
    await completeVideo();
  };

  const handleStartTarget = (index: number) => {
    startTarget(index);
    setActiveTargetIndex(index);
    setShowFocusMode(true);
  };

  const handleTargetComplete = async (timeSpent: number, overtime: number) => {
    setShowFocusMode(false);
    const allDone = await completeTarget(activeTargetIndex, timeSpent, overtime);
    setActiveTargetIndex(-1);
    
    if (allDone) {
      setShowReward(true);
    }
  };

  const handleDistraction = async () => {
    const shouldReset = await addDistraction();
    if (shouldReset) {
      setShowFocusMode(false);
      setDistractionWarning('Too many distractions! Session reset. Try again tomorrow.');
      lockSession('Too many distractions');
    } else {
      setDistractionWarning(`Distraction detected! (${session.distractionCount + 1}/3)`);
      setTimeout(() => setDistractionWarning(''), 3000);
    }
  };

  const handleLock = (reason: string) => {
    lockSession(reason);
  };

  // Calculate overall progress
  const completedTargets = session.targets.filter(t => t.status === 'done').length;
  const totalTargets = session.targets.length;
  const progressPercentage = session.videoCompleted 
    ? ((completedTargets + 1) / (totalTargets + 1)) * 100 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 text-lg">Loading...</div>
      </div>
    );
  }

  // Show lock screen
  if (session.isLocked) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Session Locked</h1>
          <p className="text-zinc-400 mb-6">{session.lockReason || 'Ask for tomorrow\'s PIN'}</p>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-zinc-700"
          >
            Back to Planner
          </Button>
        </div>
      </div>
    );
  }

  // Focus mode overlay
  if (showFocusMode && activeTargetIndex >= 0) {
    return (
      <FocusMode
        target={session.targets[activeTargetIndex]}
        onComplete={handleTargetComplete}
        onDistraction={handleDistraction}
      />
    );
  }

  // Reward screen
  if (showReward) {
    return (
      <RewardScreen
        targets={session.targets}
        totalOvertime={session.targets.reduce((sum, t) => sum + t.overtime, 0)}
        distractionCount={session.distractionCount}
        streakCount={stats?.streakCount || 1}
        onClose={() => {
          setShowReward(false);
          navigate('/');
        }}
      />
    );
  }

  // Weekly overview modal
  if (showWeeklyOverview) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Weekly Overview</h1>
            <Button
              variant="ghost"
              onClick={() => setShowWeeklyOverview(false)}
              className="text-zinc-400"
            >
              Back
            </Button>
          </div>
          
          <div className="space-y-6">
            <StreakCounter />
            <StatsGraph />
            <CrusherCalendar />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top progress bar */}
      {session.isActive && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-800 z-50">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* Distraction warning */}
      {distractionWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium animate-bounce">
          ⚠️ {distractionWarning}
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4 pb-20">
        {/* Header with date */}
        <header className="text-center py-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
            {dateString}
          </h1>
          <p className="text-zinc-500 mt-2">Study Crusher Mode</p>
        </header>

        {/* Goal section */}
        {!session.isActive && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shrink-0">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{GOAL_MESSAGE}</h3>
                  <p className="text-sm text-zinc-400 mt-1">Focus. Execute. Repeat.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Streak counter */}
        {!session.isActive && (
          <div className="mb-8">
            <StreakCounter />
          </div>
        )}

        {/* Calendar preview */}
        {!session.isActive && (
          <div className="mb-8">
            <CrusherCalendar />
          </div>
        )}

        {/* Start button / Commitment ceremony */}
        {!session.isActive && !showCeremony && (
          <div className="text-center mb-8">
            <Button
              onClick={() => setShowCeremony(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-lg px-8 py-6"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Today's Session
            </Button>
            
            <div className="mt-4">
              <Button
                variant="ghost"
                onClick={() => setShowWeeklyOverview(true)}
                className="text-zinc-400"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Weekly Overview
              </Button>
            </div>
          </div>
        )}

        {showCeremony && !session.isActive && (
          <CommitmentCeremony onStart={handleStartSession} onLock={handleLock} />
        )}

        {/* Active session: Video + Targets */}
        {session.isActive && (
          <div className="space-y-6">
            {/* Video section */}
            {!session.videoCompleted && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Play className="w-5 h-5 text-pink-400" />
                  Today's Lecture
                </h3>
                <CustomVideoPlayer
                  videoUrl={DEFAULT_VIDEO_URL}
                  onComplete={handleVideoComplete}
                />
                <p className="text-center text-sm text-zinc-500 mt-3">
                  Complete the video to unlock targets
                </p>
              </div>
            )}

            {/* Targets list */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Today's Targets
                <span className="text-sm text-zinc-500 font-normal">
                  ({completedTargets}/{totalTargets} done)
                </span>
              </h3>
              <div className="space-y-3">
                {session.targets.map((target, index) => (
                  <TargetCard
                    key={target.id}
                    target={target}
                    index={index}
                    onStart={() => handleStartTarget(index)}
                    isCurrentlyActive={activeTargetIndex === index}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Back to planner button */}
        {!session.isActive && (
          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-zinc-500 hover:text-zinc-300"
            >
              ← Back to NEET Planner
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyCrusher;
