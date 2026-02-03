import { useState, useEffect } from 'react';
import { Flame, Target, Clock, Trophy } from 'lucide-react';
import { getUserStats, getLast30DaysStats, UserStats, GraphData } from '@/lib/firebase';

const StreakCounter = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState({
    daysCompleted: 0,
    totalOvertime: 0,
    totalDistractions: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const userStats = await getUserStats();
        setStats(userStats);

        const last30Days = await getLast30DaysStats();
        const last7Days = last30Days.slice(-7);
        
        setWeeklyStats({
          daysCompleted: last7Days.filter(d => d.completionPercentage === 100).length,
          totalOvertime: last7Days.reduce((sum, d) => sum + (d.overtimeMinutes || 0), 0),
          totalDistractions: last7Days.reduce((sum, d) => sum + (d.distractionCount || 0), 0)
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Current Streak */}
      <div className="bg-black rounded-xl p-4 border border-orange-500/30">
        <Flame className="w-6 h-6 text-orange-400 mb-2" />
        <div className="text-2xl font-bold text-white">
          {stats?.streakCount || 0}
        </div>
        <div className="text-xs text-orange-300/70">Day Streak 🔥</div>
      </div>

      {/* Total Completed */}
      <div className="bg-black rounded-xl p-4 border border-green-500/30">
        <Trophy className="w-6 h-6 text-green-400 mb-2" />
        <div className="text-2xl font-bold text-white">
          {stats?.totalDaysCompleted || 0}
        </div>
        <div className="text-xs text-green-300/70">Days Complete</div>
      </div>

      {/* Longest Streak */}
      <div className="bg-black rounded-xl p-4 border border-purple-500/30">
        <Target className="w-6 h-6 text-purple-400 mb-2" />
        <div className="text-2xl font-bold text-white">
          {stats?.longestStreak || 0}
        </div>
        <div className="text-xs text-purple-300/70">Best Streak</div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-black rounded-xl p-4 border border-blue-500/30">
        <Clock className="w-6 h-6 text-blue-400 mb-2" />
        <div className="text-2xl font-bold text-white">
          {weeklyStats.daysCompleted}/7
        </div>
        <div className="text-xs text-blue-300/70">This Week</div>
      </div>
    </div>
  );
};

export default StreakCounter;
