import { useState, useEffect, useRef, useCallback } from "react";
import { Clock, Utensils, BookOpen, Brain, Moon, Sun, Dumbbell, Check, FlaskConical, Leaf, PartyPopper } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import confetti from "canvas-confetti";

interface RoutineItem {
  time: string;
  activity: string;
  details: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
}

const routineData: RoutineItem[] = [
  { id: "r1", time: "4:44 AM - 5:00 AM", activity: "Wake up + Yoga", details: "Early rise, stretching, prepare mind for the day", icon: Sun },
  { id: "r2", time: "5:00 AM - 6:00 AM", activity: "Test (30 min) + Analysis", details: "1/2 hour test, analyze mistakes, note errors", icon: Brain },
  { id: "r3", time: "6:00 AM - 11:00 AM", activity: "PCM Study (5 hrs)", details: "Physics, Chemistry, Math main session", icon: BookOpen },
  { id: "r4", time: "11:00 AM - 12:00 PM", activity: "Lunch + Bath", details: "Break, refresh, relax", icon: Utensils },
  { id: "r5", time: "12:00 PM - 2:30 PM", activity: "Chemistry (2.5 hrs)", details: "60-70 QS daily from NEET/JEE/Exemplar", icon: FlaskConical },
  { id: "r6", time: "2:30 PM - 6:00 PM", activity: "Biology (3.5 hrs)", details: "80-90 QS daily, NCERT reading", icon: Leaf },
  { id: "r7", time: "6:00 PM - 8:00 PM", activity: "Break / Temple", details: "Evening break, temple visit, relax", icon: Moon },
  { id: "r8", time: "8:00 PM - 9:30 PM", activity: "Bio QS + NCERT", details: "Additional bio questions and NCERT reading", icon: BookOpen },
  { id: "r9", time: "9:30 PM - 10:00 PM", activity: "Doubts Clearing", details: "Clear any stuck concepts from the day", icon: Brain },
  { id: "r10", time: "10:00 PM - 10:30 PM", activity: "Revision", details: "Quick revision of day's topics, then sleep", icon: Moon },
];

const DailyRoutineTable = () => {
  const today = new Date().toISOString().split('T')[0];
  const [completedTasks, setCompletedTasks] = useLocalStorage<string[]>(`routine-${today}`, []);
  const [showCelebration, setShowCelebration] = useState(false);
  const hasShownCelebrationRef = useRef(false);

  const updateProgress = useCallback((completedCount: number) => {
    // Update daily progress for graph
    const dailyProgressKey = "neet-daily-progress";
    const dailyProgressRaw = localStorage.getItem(dailyProgressKey);
    const dailyProgress: { date: string; tasksCompleted: number }[] = dailyProgressRaw ? JSON.parse(dailyProgressRaw) : [];
    
    const existingDaily = dailyProgress.findIndex(p => p.date === today);
    if (existingDaily >= 0) {
      dailyProgress[existingDaily] = { date: today, tasksCompleted: completedCount };
    } else {
      dailyProgress.push({ date: today, tasksCompleted: completedCount });
    }
    localStorage.setItem(dailyProgressKey, JSON.stringify(dailyProgress));

    // Update calendar progress
    const calendarProgressKey = "neet-calendar-progress";
    const calendarProgressRaw = localStorage.getItem(calendarProgressKey);
    const calendarProgress: { date: string; tasksCompleted: number; totalTasks: number }[] = calendarProgressRaw ? JSON.parse(calendarProgressRaw) : [];
    
    const existingCalendar = calendarProgress.findIndex(p => p.date === today);
    if (existingCalendar >= 0) {
      calendarProgress[existingCalendar] = { date: today, tasksCompleted: completedCount, totalTasks: routineData.length };
    } else {
      calendarProgress.push({ date: today, tasksCompleted: completedCount, totalTasks: routineData.length });
    }
    localStorage.setItem(calendarProgressKey, JSON.stringify(calendarProgress));

    // Dispatch storage event for other components to update
    window.dispatchEvent(new Event('storage'));
  }, [today]);

  const triggerCelebration = useCallback(() => {
    setShowCelebration(true);
    
    // Fire confetti
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }
      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFB7C5', '#E8B4D9', '#B8A4E3', '#FFE4C9'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFB7C5', '#E8B4D9', '#B8A4E3', '#FFE4C9'],
      });
    }, 250);

    // Hide celebration after 5 seconds
    setTimeout(() => {
      setShowCelebration(false);
      hasShownCelebrationRef.current = true;
    }, 5000);
  }, []);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const newCompleted = prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId];
      
      // Update progress immediately
      updateProgress(newCompleted.length);
      
      // Check for all tasks completed (celebration)
      if (newCompleted.length === routineData.length && !hasShownCelebrationRef.current) {
        setTimeout(() => triggerCelebration(), 300);
      }
      
      return newCompleted;
    });
  };

  const completionPercentage = Math.round((completedTasks.length / routineData.length) * 100);

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in relative">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 mx-4 text-center max-w-sm animate-float">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-pastel flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-2">Well Done! 🎉</h2>
            <p className="text-base sm:text-lg text-foreground/90 leading-relaxed">
              aise hi padhti rahogi toh <span className="font-bold text-primary">BMCRI miljayega</span>! 💪
            </p>
            <p className="text-sm text-muted-foreground mt-3">Keep up the amazing work!</p>
          </div>
        </div>
      )}

      <div className="p-4 bg-gradient-pastel">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-sm">Daily Routine Template</h3>
            <p className="text-white/80 text-xs sm:text-sm">12-14 hrs study, strike off when done!</p>
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold text-white">{completionPercentage}%</div>
            <div className="text-white/80 text-xs">{completedTasks.length}/{routineData.length} done</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white/80 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/20">
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-foreground/80 w-10 sm:w-12">✓</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-foreground/80">Time</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-foreground/80">Activity</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-foreground/80 hidden md:table-cell">Details</th>
            </tr>
          </thead>
          <tbody>
            {routineData.map((item, index) => {
              const Icon = item.icon;
              const isCompleted = completedTasks.includes(item.id);
              
              return (
                <tr
                  key={item.id}
                  className={`border-b border-border/30 hover:bg-muted/10 transition-all animate-slide-in cursor-pointer active:bg-muted/20 ${
                    isCompleted ? 'opacity-60' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => toggleTask(item.id)}
                >
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <button
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-primary/50 hover:border-primary'
                      }`}
                    >
                      {isCompleted && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </button>
                  </td>
                  <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-primary whitespace-nowrap ${
                    isCompleted ? 'task-completed' : ''
                  }`}>
                    {item.time}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-pastel flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? 'opacity-50' : ''
                      }`}>
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <span className={`font-medium text-xs sm:text-sm ${isCompleted ? 'task-completed' : ''}`}>
                        {item.activity}
                      </span>
                    </div>
                  </td>
                  <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-muted-foreground hidden md:table-cell ${
                    isCompleted ? 'task-completed' : ''
                  }`}>
                    {item.details}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-3 sm:p-4 bg-muted/10 border-t border-border/30">
        <p className="text-xs sm:text-sm text-muted-foreground">
          <span className="font-semibold text-primary">Weekly Sunday:</span> Revision of entire week + NCERT
        </p>
      </div>
    </div>
  );
};

export default DailyRoutineTable;
