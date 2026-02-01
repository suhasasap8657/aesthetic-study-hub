import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, AlertTriangle, Flame, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudyTarget } from '@/types/studyCrusher';

interface RewardScreenProps {
  targets: StudyTarget[];
  totalOvertime: number;
  distractionCount: number;
  streakCount: number;
  onClose: () => void;
}

const RewardScreen = ({ targets, totalOvertime, distractionCount, streakCount, onClose }: RewardScreenProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Massive confetti celebration
    const duration = 5000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff6b9d', '#c084fc', '#fbbf24', '#34d399']
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff6b9d', '#c084fc', '#fbbf24', '#34d399']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Show content after initial confetti
    setTimeout(() => setShowContent(true), 500);
  }, []);

  const formatMinutes = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  const totalTimeSpent = targets.reduce((sum, t) => sum + t.timeSpent, 0);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 flex items-center justify-center p-4 overflow-y-auto">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 text-white/50 hover:text-white"
      >
        <X className="w-6 h-6" />
      </Button>

      {showContent && (
        <div className="max-w-lg w-full text-center space-y-8 animate-fade-in py-8">
          {/* Trophy */}
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center animate-bounce">
              <Trophy className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 left-1/2 transform translate-x-8">
              <span className="text-6xl">🎉</span>
            </div>
          </div>

          {/* Main message */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              CRUSHED IT! 💪
            </h1>
            <p className="text-xl text-pink-200">
              You completed today's entire study session!
            </p>
          </div>

          {/* Personalized message */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <p className="text-2xl text-white font-medium leading-relaxed">
              "aise hi padhti rahogi toh BMCRI miljayega! 🔥"
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{formatMinutes(totalTimeSpent)}</div>
              <div className="text-sm text-blue-200">Total Study Time</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{streakCount} days</div>
              <div className="text-sm text-orange-200">Current Streak</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{targets.length}/{targets.length}</div>
              <div className="text-sm text-green-200">Targets Complete</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{distractionCount}</div>
              <div className="text-sm text-yellow-200">Distractions</div>
            </div>
          </div>

          {/* Overtime breakdown */}
          {totalOvertime > 0 && (
            <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
              <p className="text-orange-300">
                Total Overtime: <span className="font-bold text-orange-100">+{formatMinutes(totalOvertime)}</span>
              </p>
            </div>
          )}

          {/* Targets breakdown */}
          <div className="space-y-2">
            {targets.map((target) => (
              <div
                key={target.id}
                className="flex items-center justify-between bg-white/5 rounded-lg p-3 text-sm"
              >
                <span className="text-white/80">{target.name}</span>
                <span className="text-green-400 font-mono">
                  {formatMinutes(target.timeSpent)}
                  {target.overtime > 0 && (
                    <span className="text-orange-400 ml-2">(+{formatMinutes(target.overtime)})</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-lg px-8 py-6"
          >
            Continue to Home
          </Button>
        </div>
      )}
    </div>
  );
};

export default RewardScreen;
