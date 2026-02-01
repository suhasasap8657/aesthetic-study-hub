import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudyTarget } from '@/types/studyCrusher';

interface FocusModeProps {
  target: StudyTarget;
  onComplete: (timeSpent: number, overtime: number) => void;
  onDistraction: () => void;
}

const FocusMode = ({ target, onComplete, onDistraction }: FocusModeProps) => {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(target.totalMinutes * 60);
  const [overtime, setOvertime] = useState(0);
  const [isOvertime, setIsOvertime] = useState(false);
  const [canStop, setCanStop] = useState(false);
  const [showFocusCheck, setShowFocusCheck] = useState(false);
  const [focusCheckTimer, setFocusCheckTimer] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const startTimeRef = useRef(Date.now());
  const minTimeRef = useRef(target.minMinutes * 60 * 1000);
  const focusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.log('Fullscreen not available');
      }
    };
    enterFullscreen();

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Main countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const totalSeconds = target.totalMinutes * 60;
      const remaining = totalSeconds - Math.floor(elapsed / 1000);

      if (remaining <= 0) {
        setIsOvertime(true);
        setTimeRemaining(0);
        setOvertime(Math.abs(remaining));
      } else {
        setTimeRemaining(remaining);
      }

      // Check if minimum time passed
      if (elapsed >= minTimeRef.current) {
        setCanStop(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [target.totalMinutes]);

  // Random focus check-ins every 30-45 minutes
  useEffect(() => {
    const scheduleNextCheck = () => {
      const delay = (30 + Math.random() * 15) * 60 * 1000; // 30-45 minutes
      return setTimeout(() => {
        setShowFocusCheck(true);
        setFocusCheckTimer(10);
      }, delay);
    };

    focusCheckIntervalRef.current = scheduleNextCheck();

    return () => {
      if (focusCheckIntervalRef.current) {
        clearTimeout(focusCheckIntervalRef.current);
      }
    };
  }, []);

  // Focus check countdown
  useEffect(() => {
    if (!showFocusCheck) return;

    const interval = setInterval(() => {
      setFocusCheckTimer(prev => {
        if (prev <= 1) {
          setShowFocusCheck(false);
          onDistraction();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showFocusCheck, onDistraction]);

  // Visibility change detection (tab switch / minimize)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onDistraction();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [onDistraction]);

  const handleFocusCheckResponse = () => {
    setShowFocusCheck(false);
    // Schedule next check
    if (focusCheckIntervalRef.current) {
      clearTimeout(focusCheckIntervalRef.current);
    }
    const delay = (30 + Math.random() * 15) * 60 * 1000;
    focusCheckIntervalRef.current = setTimeout(() => {
      setShowFocusCheck(true);
      setFocusCheckTimer(10);
    }, delay);
  };

  const handleStop = () => {
    const elapsed = Date.now() - startTimeRef.current;
    const timeSpentMinutes = Math.floor(elapsed / 60000);
    const overtimeMinutes = isOvertime ? Math.floor(overtime / 60) : 0;
    onComplete(timeSpentMinutes, overtimeMinutes);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-1000 ${isOvertime ? 'bg-red-950' : 'bg-black'}`}>
      {/* Focus Check Popup */}
      {showFocusCheck && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-60">
          <div className="bg-zinc-900 rounded-2xl p-8 border-2 border-yellow-500 text-center max-w-sm mx-4 animate-bounce">
            <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Still Focused?</h3>
            <p className="text-zinc-400 mb-4">Click YES within {focusCheckTimer} seconds</p>
            <Button
              onClick={handleFocusCheckResponse}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white font-bold text-lg px-8 py-6"
            >
              YES, I'm Focused!
            </Button>
          </div>
        </div>
      )}

      {/* Target name */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-zinc-500 text-lg font-medium">
        {target.name}
      </div>

      {/* Main timer */}
      <div className="text-center">
        {isOvertime ? (
          <>
            <div className="text-red-400 text-2xl mb-2 flex items-center justify-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              OVERTIME
            </div>
            <div className="text-8xl md:text-[12rem] font-mono font-bold text-red-500 tracking-wider">
              +{formatTime(overtime)}
            </div>
          </>
        ) : (
          <div className="text-8xl md:text-[12rem] font-mono font-bold text-white tracking-wider">
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Minimum time indicator */}
      {!canStop && (
        <div className="mt-8 text-zinc-600 text-center">
          <p>Minimum time: {target.minMinutes} minutes</p>
          <p className="text-sm">Stop button appears after minimum time</p>
        </div>
      )}

      {/* Stop button */}
      {canStop && (
        <Button
          onClick={handleStop}
          variant="outline"
          className="mt-12 border-2 border-zinc-700 bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white px-8 py-6 text-lg transition-all duration-300"
        >
          <X className="w-5 h-5 mr-2" />
          Stop Target
        </Button>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-8 text-center text-zinc-700 text-sm">
        <p>Stay focused. No distractions allowed.</p>
        <p className="text-zinc-800">Switching tabs or minimizing will be detected</p>
      </div>
    </div>
  );
};

export default FocusMode;
