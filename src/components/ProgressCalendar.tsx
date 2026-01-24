import { useState, useMemo, useEffect, useCallback } from "react";
import { CalendarDays, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyProgress {
  date: string;
  tasksCompleted: number;
  totalTasks: number;
}

const ProgressCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [progressData, setProgressData] = useState<DailyProgress[]>([]);

  const loadProgressData = useCallback(() => {
    const stored = localStorage.getItem("neet-calendar-progress");
    if (stored) {
      setProgressData(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    loadProgressData();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadProgressData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadProgressData]);

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty days for alignment
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentMonth]);

  const getProgressForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return progressData.find((p) => p.date === dateStr);
  };

  const getDayStatus = (date: Date) => {
    const progress = getProgressForDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate > today) return "future";
    if (!progress) return "no-data";
    if (progress.tasksCompleted === progress.totalTasks && progress.totalTasks > 0) return "complete";
    if (progress.tasksCompleted > 0) return "partial";
    return "incomplete";
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const weekDaysFull = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-pastel flex items-center justify-center">
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </span>
          Progress Calendar
        </h3>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <Button variant="ghost" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-medium text-sm sm:text-base">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
        <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center text-[10px] sm:text-xs text-muted-foreground py-1">
            <span className="sm:hidden">{day}</span>
            <span className="hidden sm:inline">{weekDaysFull[i]}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {monthDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const status = getDayStatus(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={date.toISOString()}
              className={`
                aspect-square rounded-md sm:rounded-lg flex flex-col items-center justify-center text-[10px] sm:text-xs
                transition-all duration-200 relative
                ${isToday ? "ring-2 ring-primary" : ""}
                ${status === "future" ? "bg-muted/10 text-muted-foreground" : ""}
                ${status === "no-data" ? "bg-muted/20 text-muted-foreground" : ""}
                ${status === "complete" ? "bg-green-500/20 text-green-400" : ""}
                ${status === "partial" ? "bg-yellow-500/20 text-yellow-400" : ""}
                ${status === "incomplete" ? "bg-red-500/20 text-red-400" : ""}
              `}
            >
              <span className="font-medium">{date.getDate()}</span>
              {status === "complete" && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5" />}
              {status === "incomplete" && <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5" />}
              {status === "partial" && (
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-yellow-400 mt-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-green-500/20 flex items-center justify-center">
            <Check className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-green-400" />
          </div>
          <span className="text-muted-foreground">Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-yellow-500/20 flex items-center justify-center">
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-yellow-400" />
          </div>
          <span className="text-muted-foreground">Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-500/20 flex items-center justify-center">
            <X className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-red-400" />
          </div>
          <span className="text-muted-foreground">Missed</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCalendar;
