import { useEffect, useCallback, useState, useRef } from "react";
import DayAccordion from "./DayAccordion";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import confetti from "canvas-confetti";
import { PartyPopper } from "lucide-react";

interface DayPlan {
  date: string;
  day: string;
  tasks: { id: string; label: string; completed: boolean }[];
}

interface MonthPlanProps {
  month: string;
  focus: string;
  days: DayPlan[];
}

// Helper to convert "Jan 30" to "2026-01-30"
const dateStringToISO = (dateStr: string): string | null => {
  const months: Record<string, string> = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  const parts = dateStr.split(' ');
  if (parts.length === 2) {
    const month = months[parts[0]];
    const day = parts[1].padStart(2, '0');
    if (month && day) {
      return `2026-${month}-${day}`;
    }
  }
  return null;
};

const MonthPlan = ({ month, focus, days }: MonthPlanProps) => {
  // Create a unique storage key based on month name
  const storageKey = `neet-planner-${month.replace(/\s+/g, '-').toLowerCase()}`;
  
  const [dayPlans, setDayPlans] = useLocalStorage<DayPlan[]>(storageKey, days);
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationShownRef = useRef<Set<string>>(new Set());

  // Sync progress to calendar and graph
  const syncProgressToStorage = useCallback((updatedDays: DayPlan[]) => {
    const calendarProgressKey = "neet-calendar-progress";
    const dailyProgressKey = "neet-daily-progress";
    
    const calendarProgressRaw = localStorage.getItem(calendarProgressKey);
    const dailyProgressRaw = localStorage.getItem(dailyProgressKey);
    
    let calendarProgress: { date: string; tasksCompleted: number; totalTasks: number }[] = 
      calendarProgressRaw ? JSON.parse(calendarProgressRaw) : [];
    let dailyProgress: { date: string; tasksCompleted: number }[] = 
      dailyProgressRaw ? JSON.parse(dailyProgressRaw) : [];

    updatedDays.forEach(day => {
      const isoDate = dateStringToISO(day.date);
      if (!isoDate) return; // Skip date ranges like "Feb 15-23"
      
      const completedCount = day.tasks.filter(t => t.completed).length;
      const totalTasks = day.tasks.length;

      // Update calendar progress
      const existingCalendar = calendarProgress.findIndex(p => p.date === isoDate);
      if (existingCalendar >= 0) {
        calendarProgress[existingCalendar] = { date: isoDate, tasksCompleted: completedCount, totalTasks };
      } else {
        calendarProgress.push({ date: isoDate, tasksCompleted: completedCount, totalTasks });
      }

      // Update daily progress
      const existingDaily = dailyProgress.findIndex(p => p.date === isoDate);
      if (existingDaily >= 0) {
        dailyProgress[existingDaily] = { date: isoDate, tasksCompleted: completedCount };
      } else {
        dailyProgress.push({ date: isoDate, tasksCompleted: completedCount });
      }
    });

    localStorage.setItem(calendarProgressKey, JSON.stringify(calendarProgress));
    localStorage.setItem(dailyProgressKey, JSON.stringify(dailyProgress));
    
    // Dispatch storage event for other components to update immediately
    window.dispatchEvent(new Event('storage'));
  }, []);

  const triggerCelebration = useCallback((dayDate: string) => {
    if (celebrationShownRef.current.has(dayDate)) return;
    celebrationShownRef.current.add(dayDate);
    
    setShowCelebration(true);
    
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

    setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  }, []);

  // Update localStorage if initial days data structure changes (new tasks added)
  useEffect(() => {
    // Check if any new tasks were added to the plan
    const storedTaskIds = new Set(dayPlans.flatMap(d => d.tasks.map(t => t.id)));
    const newTaskIds = days.flatMap(d => d.tasks.map(t => t.id));
    const hasNewTasks = newTaskIds.some(id => !storedTaskIds.has(id));
    
    if (hasNewTasks) {
      // Merge: keep completed status from stored, add new tasks from days
      const merged = days.map(day => {
        const storedDay = dayPlans.find(d => d.date === day.date);
        if (storedDay) {
          return {
            ...day,
            tasks: day.tasks.map(task => {
              const storedTask = storedDay.tasks.find(t => t.id === task.id);
              return storedTask ? { ...task, completed: storedTask.completed } : task;
            })
          };
        }
        return day;
      });
      setDayPlans(merged);
      syncProgressToStorage(merged);
    }
  }, [days, syncProgressToStorage]);

  const toggleTask = (dayIndex: number, taskId: string) => {
    setDayPlans(prev => {
      const updated = prev.map((day, i) => 
        i === dayIndex
          ? {
              ...day,
              tasks: day.tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              )
            }
          : day
      );
      
      // Sync to storage immediately
      syncProgressToStorage(updated);
      
      // Check if all tasks for this day are completed
      const updatedDay = updated[dayIndex];
      if (updatedDay.tasks.every(t => t.completed)) {
        setTimeout(() => triggerCelebration(updatedDay.date), 300);
      }
      
      return updated;
    });
  };

  const totalTasks = dayPlans.reduce((sum, day) => sum + day.tasks.length, 0);
  const completedTasks = dayPlans.reduce(
    (sum, day) => sum + day.tasks.filter(t => t.completed).length,
    0
  );
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-4 animate-fade-in relative">
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

      {/* Month Header */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold gradient-text">{month}</h2>
            <p className="text-muted-foreground text-sm mt-1">{focus}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p>
              <p className="text-xs text-muted-foreground">{completedTasks}/{totalTasks} tasks</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 p-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${progress} 100`}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="50%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#fda4af" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-3">
        {dayPlans.map((day, index) => (
          <DayAccordion
            key={day.date}
            date={day.date}
            day={day.day}
            tasks={day.tasks}
            onToggleTask={(taskId) => toggleTask(index, taskId)}
          />
        ))}
      </div>
    </div>
  );
};

export default MonthPlan;
