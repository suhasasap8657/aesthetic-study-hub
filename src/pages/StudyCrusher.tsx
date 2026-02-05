import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Play, Lock, BarChart3, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudySession } from '@/hooks/useStudySession';
import CommitmentCeremony from '@/components/crusher/CommitmentCeremony';
import YouTubeVideoCard from '@/components/crusher/YouTubeVideoCard';
import TargetCard from '@/components/crusher/TargetCard';
import FocusMode from '@/components/crusher/FocusMode';
import RewardScreen from '@/components/crusher/RewardScreen';
import CrusherCalendar from '@/components/crusher/CrusherCalendar';
import StatsGraph from '@/components/crusher/StatsGraph';
import StreakCounter from '@/components/crusher/StreakCounter';
import AIDoubtSolver from '@/components/crusher/AIDoubtSolver';
import FailureModal from '@/components/crusher/FailureModal';
import TargetCompletionModal from '@/components/crusher/TargetCompletionModal';
import { REQUIRED_VIDEO_WATCH_TIME } from '@/types/studyCrusher';

// Goal image and message - editable
const GOAL_MESSAGE = 'AIR under 1000 - BMCRI or nothing! 💪';

const StudyCrusher = () => {
  const navigate = useNavigate();
  const {
    session,
    stats,
    loading,
    showFailurePopup,
    startSession,
    completeVideo,
    startTarget,
    completeTarget,
    addDistraction,
    lockSession,
    updateAITime,
    updateVideoWatchTime,
    dismissFailurePopup
  } = useStudySession();

  const [showCeremony, setShowCeremony] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [activeTargetIndex, setActiveTargetIndex] = useState(-1);
  const [showReward, setShowReward] = useState(false);
  const [showWeeklyOverview, setShowWeeklyOverview] = useState(false);
  const [distractionWarning, setDistractionWarning] = useState('');
  const [completedTargetName, setCompletedTargetName] = useState('');
  const [showTargetCompletion, setShowTargetCompletion] = useState(false);

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Warn on page close during active session
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

  const handleVideoWatchTimeUpdate = useCallback((seconds: number) => {
    updateVideoWatchTime(seconds);
  }, [updateVideoWatchTime]);

  const handleVideoComplete = async (videoIndex: number) => {
    await completeVideo(videoIndex);
  };

  const handleStartTarget = (index: number) => {
    startTarget(index);
    setActiveTargetIndex(index);
    setShowFocusMode(true);
  };

  const handleTargetComplete = async (timeSpent: number, overtime: number) => {
    setShowFocusMode(false);
    const targetName = session.targets[activeTargetIndex]?.name || 'Target';
    const allDone = await completeTarget(activeTargetIndex, timeSpent, overtime);
    
    // Show individual target completion modal
    setCompletedTargetName(targetName);
    setShowTargetCompletion(true);
    
    setActiveTargetIndex(-1);
    
    if (allDone) {
      setTimeout(() => {
        setShowTargetCompletion(false);
        setShowReward(true);
      }, 2000);
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
  const completedVideos = session.videos.filter(v => v.status === 'completed').length;
  const completedTargets = session.targets.filter(t => t.status === 'done').length;
  const totalItems = session.videos.length + session.targets.length;
  const progressPercentage = ((completedVideos + completedTargets) / totalItems) * 100;

  const allVideosCompleted = session.videosCompleted >= 2;
  const hasEnoughWatchTime = session.totalVideoWatchTime >= REQUIRED_VIDEO_WATCH_TIME;
  const targetsUnlocked = allVideosCompleted && hasEnoughWatchTime;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  // Failure modal for incomplete yesterday
  if (showFailurePopup) {
    return <FailureModal isOpen={showFailurePopup} onClose={dismissFailurePopup} />;
  }

  // Show lock screen
  if (session.isLocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Session Locked</h1>
          <p className="text-zinc-400 mb-6">{session.lockReason || 'Session has been locked'}</p>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-zinc-700 text-white hover:bg-zinc-900"
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
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Weekly Overview</h1>
            <Button
              variant="ghost"
              onClick={() => setShowWeeklyOverview(false)}
              className="text-zinc-400 hover:text-white"
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
    <div className="min-h-screen bg-black text-white">
      {/* Target completion modal */}
      <TargetCompletionModal
        isOpen={showTargetCompletion}
        onClose={() => setShowTargetCompletion(false)}
        targetName={completedTargetName}
      />

      {/* Top progress bar */}
      {session.isActive && (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-zinc-900 z-50">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
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

      <div className="max-w-3xl mx-auto p-4 pb-24">
        {/* Header with date */}
        <header className="text-center py-8">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
            {dateString}
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">Study Crusher Mode</p>
        </header>

        {/* Goal section */}
        {!session.isActive && (
          <div className="mb-8">
            <div className="bg-black rounded-2xl p-6 border border-pink-500/30">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shrink-0">
                  <Image className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">{GOAL_MESSAGE}</h3>
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
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-lg px-8 py-6 h-auto"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Today's Session
            </Button>
            
            <div className="mt-4">
              <Button
                variant="ghost"
                onClick={() => setShowWeeklyOverview(true)}
                className="text-zinc-400 hover:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Weekly Overview
              </Button>
            </div>
          </div>
        )}

        {showCeremony && !session.isActive && (
          <CommitmentCeremony 
            onStart={handleStartSession} 
            onLock={handleLock}
          />
        )}

        {/* Active session: Videos + Targets */}
        {session.isActive && (
          <div className="space-y-6">
            {/* Videos section */}
            <div>
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-pink-400" />
                Today's Lectures
                <span className="text-sm text-zinc-500 font-normal">
                  ({completedVideos}/2 done)
                </span>
              </h3>
              <div className="space-y-4">
                {session.videos.map((video, index) => (
                  <YouTubeVideoCard
                    key={video.id}
                    video={video}
                    index={index}
                    totalVideos={2}
                    onWatchTimeUpdate={handleVideoWatchTimeUpdate}
                    onComplete={() => handleVideoComplete(index)}
                  />
                ))}
              </div>
              
              {/* Watch time requirement message */}
              {!targetsUnlocked && (
                <div className="mt-4 p-4 bg-zinc-900 rounded-xl border border-yellow-500/30 text-center">
                  <p className="text-yellow-400 font-medium">
                    Watch at least 1 hour total to unlock targets
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Current: {Math.floor(session.totalVideoWatchTime / 60)} min / 60 min required
                  </p>
                </div>
              )}
            </div>

            {/* Targets list */}
            <div>
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Today's Targets
                <span className="text-sm text-zinc-500 font-normal">
                  ({completedTargets}/{session.targets.length} done)
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

      {/* AI Doubt Solver - Only show after first video */}
      {session.isActive && completedVideos >= 1 && (
        <AIDoubtSolver 
          onTimeUpdate={updateAITime}
          totalTimeUsed={session.aiTimeUsed}
        />
      )}
    </div>
  );
};

export default StudyCrusher;
