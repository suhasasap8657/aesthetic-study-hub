import { useState, useEffect } from "react";
import { Clock, Utensils, BookOpen, Brain, Moon, Sun, Dumbbell, Check, FlaskConical, Leaf } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

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
  const [dailyProgress, setDailyProgress] = useLocalStorage<{ date: string; tasksCompleted: number }[]>("neet-daily-progress", []);
  const [calendarProgress, setCalendarProgress] = useLocalStorage<{ date: string; tasksCompleted: number; totalTasks: number }[]>("neet-calendar-progress", []);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const newCompleted = prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId];
      
      return newCompleted;
    });
  };

  // Update progress when tasks change
  useEffect(() => {
    const completedCount = completedTasks.length;
    
    // Update daily progress for graph
    setDailyProgress(prev => {
      const existing = prev.findIndex(p => p.date === today);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { date: today, tasksCompleted: completedCount };
        return updated;
      }
      return [...prev, { date: today, tasksCompleted: completedCount }];
    });

    // Update calendar progress
    setCalendarProgress(prev => {
      const existing = prev.findIndex(p => p.date === today);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { date: today, tasksCompleted: completedCount, totalTasks: routineData.length };
        return updated;
      }
      return [...prev, { date: today, tasksCompleted: completedCount, totalTasks: routineData.length }];
    });
  }, [completedTasks, today, setDailyProgress, setCalendarProgress]);

  const completionPercentage = Math.round((completedTasks.length / routineData.length) * 100);

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
      <div className="p-4 bg-gradient-pastel">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white drop-shadow-sm">Daily Routine Template</h3>
            <p className="text-white/80 text-sm">12-14 hrs study, strike off when done!</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{completionPercentage}%</div>
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/80 w-12">✓</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/80">Time</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/80">Activity</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/80 hidden md:table-cell">Details</th>
            </tr>
          </thead>
          <tbody>
            {routineData.map((item, index) => {
              const Icon = item.icon;
              const isCompleted = completedTasks.includes(item.id);
              
              return (
                <tr
                  key={item.id}
                  className={`border-b border-border/30 hover:bg-muted/10 transition-all animate-slide-in cursor-pointer ${
                    isCompleted ? 'opacity-60' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => toggleTask(item.id)}
                >
                  <td className="px-4 py-3">
                    <button
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-primary/50 hover:border-primary'
                      }`}
                    >
                      {isCompleted && <Check className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium text-primary whitespace-nowrap ${
                    isCompleted ? 'task-completed' : ''
                  }`}>
                    {item.time}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-pastel flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? 'opacity-50' : ''
                      }`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className={`font-medium text-sm ${isCompleted ? 'task-completed' : ''}`}>
                        {item.activity}
                      </span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm text-muted-foreground hidden md:table-cell ${
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
      <div className="p-4 bg-muted/10 border-t border-border/30">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-primary">Weekly Sunday:</span> Revision of entire week + NCERT
        </p>
      </div>
    </div>
  );
};

export default DailyRoutineTable;
