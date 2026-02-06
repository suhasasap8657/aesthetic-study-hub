import { useState, useEffect } from 'react';
import { Clock, Calendar, Target, BarChart3, Flame, Plus, X, Play, Pause, RotateCcw, ChevronRight, Check, AlertTriangle, XCircle, Video, FileQuestion, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import confetti from 'canvas-confetti';
import RealTimeClock from '@/components/dashboard/RealTimeClock';
import ExamTracker from '@/components/dashboard/ExamTracker';
import StreakDisplay from '@/components/dashboard/StreakDisplay';
import ProgressCalendar from '@/components/dashboard/ProgressCalendar';
import AnalysisCharts from '@/components/dashboard/AnalysisCharts';
import MonthlyTargets from '@/components/dashboard/MonthlyTargets';
import SessionMode from '@/components/dashboard/SessionMode';
import { getStreak, StreakData, calculateRank, saveStreak, getAllDailyProgress, DailyProgress } from '@/lib/firebase';
import { getTodaySchedule, DayTarget, isBreakDay } from '@/data/studySchedule';
import { getTodayKey } from '@/lib/firebase';

const Index = () => {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: '',
    rank: 'none'
  });
  const [todaySchedule, setTodaySchedule] = useState<DayTarget | null>(null);
  const [showRankModal, setShowRankModal] = useState(false);
  const [newRank, setNewRank] = useState<string>('');
  const [activeSession, setActiveSession] = useState<{ type: 'video' | 'qs'; targetId: string; videoUrl?: string } | null>(null);
  const [dailyProgress, setDailyProgress] = useState<Record<string, DailyProgress>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const streakData = await getStreak();
    setStreak(streakData);
    
    const schedule = getTodaySchedule();
    setTodaySchedule(schedule);
    
    const progress = await getAllDailyProgress();
    setDailyProgress(progress);
  };

  const handleStreakUpdate = async (newStreak: number) => {
    const oldRank = streak.rank;
    const newRankValue = calculateRank(newStreak);
    
    const updatedStreak: StreakData = {
      ...streak,
      currentStreak: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      lastCompletedDate: getTodayKey(),
      rank: newRankValue
    };
    
    setStreak(updatedStreak);
    await saveStreak(updatedStreak);
    
    // Check for rank promotion
    if (newRankValue !== oldRank && newRankValue !== 'none') {
      setNewRank(newRankValue);
      setShowRankModal(true);
      triggerConfetti(newRankValue);
    }
  };

  const triggerConfetti = (rank: string) => {
    const colors = {
      bronze: ['#CD7F32', '#B87333', '#8B4513'],
      silver: ['#C0C0C0', '#A8A8A8', '#808080'],
      gold: ['#FFD700', '#FFA500', '#DAA520'],
      diamond: ['#B9F2FF', '#87CEEB', '#00CED1']
    };
    
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors[rank as keyof typeof colors] || ['#22c55e']
    });
  };

  const getRankMessage = (rank: string) => {
    const messages = {
      bronze: "Congrats! You are now a Bronze rank.",
      silver: "Congrats! You are promoted to Silver level. C'mon get that Diamond level then BMCRI is all yours.",
      gold: "Congrats! You are just one rank away from BMCRI. Go push your level now!!!!",
      diamond: "Congrats! You are here finally. Go rock the paper, BMCRI is all yours! You did it!!!!!"
    };
    return messages[rank as keyof typeof messages] || '';
  };

  const startSession = (type: 'video' | 'qs', targetId: string, videoUrl?: string) => {
    setActiveSession({ type, targetId, videoUrl });
  };

  const endSession = () => {
    setActiveSession(null);
    loadData(); // Refresh data
  };

  if (activeSession) {
    return (
      <SessionMode 
        type={activeSession.type}
        targetId={activeSession.targetId}
        videoUrl={activeSession.videoUrl}
        onComplete={endSession}
        onExit={endSession}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">BMCRI Study Tracker</h1>
                <p className="text-xs text-zinc-500">NEET 2026 Mission</p>
              </div>
            </div>
            <StreakDisplay streak={streak} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Clock & Date */}
        <RealTimeClock />
        
        {/* Exam Countdown */}
        <ExamTracker />

        {/* Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="w-full bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="today" className="flex-1 data-[state=active]:bg-zinc-800">
              <Target className="w-4 h-4 mr-2" />
              Today
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex-1 data-[state=active]:bg-zinc-800">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex-1 data-[state=active]:bg-zinc-800">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4">
            {todaySchedule ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    {todaySchedule.day} {todaySchedule.month} - Today's Targets
                  </h2>
                  {todaySchedule.isBreak && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                      Break Day
                    </span>
                  )}
                </div>
                
                <div className="space-y-3">
                  {todaySchedule.targets.map((target, idx) => (
                    <Card key={target.id} className="bg-zinc-900 border-zinc-800 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {target.type === 'video' && <Video className="w-5 h-5 text-purple-400" />}
                          {target.type === 'qs' && <FileQuestion className="w-5 h-5 text-blue-400" />}
                          {target.type === 'normal' && <BookOpen className="w-5 h-5 text-green-400" />}
                          <div>
                            <p className="font-medium">{target.text}</p>
                            {target.type === 'video' && (
                              <p className="text-xs text-zinc-500">Min 2 hours required</p>
                            )}
                          </div>
                        </div>
                        
                        {target.type === 'video' ? (
                          <Button
                            onClick={() => startSession('video', target.id, target.videoUrl)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                        ) : target.type === 'qs' ? (
                          <Button
                            onClick={() => startSession('qs', target.id)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="border-zinc-700 hover:bg-zinc-800"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Done
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
                <p className="text-zinc-400">No schedule for today</p>
                <p className="text-sm text-zinc-600 mt-2">Check the Schedule tab for upcoming targets</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="mt-4">
            <MonthlyTargets onStartSession={startSession} />
          </TabsContent>

          <TabsContent value="progress" className="mt-4 space-y-6">
            <ProgressCalendar dailyProgress={dailyProgress} />
            <AnalysisCharts />
          </TabsContent>
        </Tabs>
      </main>

      {/* Rank Promotion Modal */}
      <Dialog open={showRankModal} onOpenChange={setShowRankModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🎉 Rank Promotion! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="text-6xl mb-4">
              {newRank === 'bronze' && '🥉'}
              {newRank === 'silver' && '🥈'}
              {newRank === 'gold' && '🥇'}
              {newRank === 'diamond' && '💎'}
            </div>
            <h3 className="text-xl font-bold capitalize mb-4">{newRank} Rank!</h3>
            <p className="text-zinc-300">{getRankMessage(newRank)}</p>
          </div>
          <Button 
            onClick={() => setShowRankModal(false)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Continue Crushing It!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
