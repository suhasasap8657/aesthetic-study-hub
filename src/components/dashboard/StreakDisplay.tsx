import { Flame } from 'lucide-react';
import { StreakData } from '@/lib/firebase';

interface StreakDisplayProps {
  streak: StreakData;
}

const StreakDisplay = ({ streak }: StreakDisplayProps) => {
  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'bronze': return 'from-amber-700 to-amber-500';
      case 'silver': return 'from-gray-400 to-gray-300';
      case 'gold': return 'from-yellow-500 to-yellow-300';
      case 'diamond': return 'from-cyan-400 to-blue-300';
      default: return 'from-zinc-600 to-zinc-500';
    }
  };

  const getRankEmoji = (rank: string) => {
    switch (rank) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'diamond': return '💎';
      default: return '';
    }
  };

  const getNextRankInfo = (currentStreak: number) => {
    if (currentStreak < 13) return { next: 'Bronze', remaining: 13 - currentStreak };
    if (currentStreak < 33) return { next: 'Silver', remaining: 33 - currentStreak };
    if (currentStreak < 54) return { next: 'Gold', remaining: 54 - currentStreak };
    if (currentStreak < 74) return { next: 'Diamond', remaining: 74 - currentStreak };
    return null;
  };

  const nextRank = getNextRankInfo(streak.currentStreak);

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getRankColor(streak.rank)}`}>
        <Flame className="w-5 h-5 text-white" />
        <span className="font-bold text-white text-lg">{streak.currentStreak}</span>
        {streak.rank !== 'none' && (
          <span className="text-lg">{getRankEmoji(streak.rank)}</span>
        )}
      </div>
      
      {nextRank && (
        <div className="text-xs text-zinc-500 hidden sm:block">
          {nextRank.remaining} to {nextRank.next}
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;
