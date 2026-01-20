import { useState } from "react";
import DayAccordion from "./DayAccordion";

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

const MonthPlan = ({ month, focus, days }: MonthPlanProps) => {
  const [dayPlans, setDayPlans] = useState(days);

  const toggleTask = (dayIndex: number, taskId: string) => {
    setDayPlans(prev => 
      prev.map((day, i) => 
        i === dayIndex
          ? {
              ...day,
              tasks: day.tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              )
            }
          : day
      )
    );
  };

  const totalTasks = dayPlans.reduce((sum, day) => sum + day.tasks.length, 0);
  const completedTasks = dayPlans.reduce(
    (sum, day) => sum + day.tasks.filter(t => t.completed).length,
    0
  );
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-4 animate-fade-in">
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
