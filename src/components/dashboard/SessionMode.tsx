import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, X, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { saveSession, saveDailyProgress, getDailyProgress, getTodayKey, DailyProgress } from '@/lib/firebase';
import confetti from 'canvas-confetti';

interface SessionModeProps {
  type: 'video' | 'qs';
  targetId: string;
  videoUrl?: string;
  onComplete: () => void;
  onExit: () => void;
}

const SessionMode = ({ type, targetId, videoUrl, onComplete, onExit }: SessionModeProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLIFrameElement>(null);

  const requiredSeconds = type === 'video' ? 7200 : 0; // 2 hours for video

  useEffect(() => {
    enterFullscreen();
    
    // Track visibility changes
    const handleVisibility = () => {
      if (document.hidden && isPlaying) {
        setIsPlaying(false);
        setShowWarning(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const enterFullscreen = async () => {
    try {
      if (containerRef.current && !document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.log('Fullscreen not supported');
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Exit fullscreen error');
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleComplete = async () => {
    // Save session to Firebase
    await saveSession({
      type,
      date: getTodayKey(),
      duration: elapsed,
      startTime: new Date(Date.now() - elapsed * 1000).toISOString(),
      endTime: new Date().toISOString()
    });

    // Update daily progress
    const todayProgress = await getDailyProgress(getTodayKey());
    const updatedProgress: DailyProgress = {
      date: getTodayKey(),
      targetsCompleted: [...(todayProgress?.targetsCompleted || []), targetId],
      totalTargets: todayProgress?.totalTargets || 4,
      videoTime: (todayProgress?.videoTime || 0) + (type === 'video' ? elapsed : 0),
      qsTime: (todayProgress?.qsTime || 0) + (type === 'qs' ? elapsed : 0),
      isComplete: false
    };
    
    await saveDailyProgress(updatedProgress);

    // Confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    exitFullscreen();
    onComplete();
  };

  const handleExit = () => {
    if (type === 'video' && elapsed < requiredSeconds) {
      setShowWarning(true);
      return;
    }
    exitFullscreen();
    onExit();
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&modestbranding=1&rel=0&disablekb=1`;
    }
    return url;
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    setPlaybackSpeed(speeds[(currentIndex + 1) % speeds.length]);
  };

  const rewind15 = () => {
    setElapsed(prev => Math.max(0, prev - 15));
  };

  const canComplete = type === 'qs' || elapsed >= requiredSeconds;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Warning Modal */}
      {showWarning && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <Card className="bg-red-950 border-red-800 p-6 max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-400 mb-2">Focus Broken!</h3>
            <p className="text-zinc-300 mb-4">
              {type === 'video' 
                ? `You need to watch for at least 2 hours. Current: ${formatTime(elapsed)}`
                : 'You left the session. Stay focused!'}
            </p>
            <Button 
              onClick={() => setShowWarning(false)}
              className="bg-red-600 hover:bg-red-700"
            >
              Continue Session
            </Button>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-zinc-950">
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg ${type === 'video' ? 'bg-purple-600' : 'bg-blue-600'}`}>
            {type === 'video' ? '📹 Video Session' : '📝 QS Practice'}
          </div>
          
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-2xl text-white">{formatTime(elapsed)}</span>
            {type === 'video' && (
              <span className="text-sm">/ {formatTime(requiredSeconds)} required</span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={handleExit}
          className="text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress bar for video */}
      {type === 'video' && (
        <div className="h-2 bg-zinc-800">
          <div 
            className={`h-full transition-all ${elapsed >= requiredSeconds ? 'bg-green-500' : 'bg-purple-500'}`}
            style={{ width: `${Math.min(100, (elapsed / requiredSeconds) * 100)}%` }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {type === 'video' && videoUrl ? (
          <div className="w-full max-w-5xl aspect-video bg-zinc-900 rounded-lg overflow-hidden relative">
            <iframe
              ref={videoRef}
              src={getYouTubeEmbedUrl(videoUrl)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            {/* Custom overlay controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={rewind15}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-purple-600 hover:bg-purple-700 rounded-full w-14 h-14"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </Button>
                <Button
                  variant="ghost"
                  onClick={toggleSpeed}
                  className="text-white hover:bg-white/20 font-bold"
                >
                  {playbackSpeed}x
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-8xl font-mono font-bold text-white mb-8">
              {formatTime(elapsed)}
            </div>
            <p className="text-xl text-zinc-400 mb-8">
              {type === 'video' ? 'No video URL provided' : 'Solve questions - Timer is running'}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`${isPlaying ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} rounded-full w-20 h-20`}
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-zinc-950 flex justify-center">
        <Button
          size="lg"
          onClick={handleComplete}
          disabled={!canComplete}
          className={`px-8 ${canComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-zinc-700 cursor-not-allowed'}`}
        >
          {canComplete ? '✅ Complete Session' : `Watch ${formatTime(requiredSeconds - elapsed)} more`}
        </Button>
      </div>
    </div>
  );
};

export default SessionMode;
