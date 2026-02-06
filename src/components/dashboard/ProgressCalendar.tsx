import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DailyProgress } from '@/lib/firebase';

interface ProgressCalendarProps {
  dailyProgress: Record<string, DailyProgress>;
}

const ProgressCalendar = ({ dailyProgress }: ProgressCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDateKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getDayStatus = (day: number): 'full' | 'partial' | 'missed' | 'future' | 'none' => {
    const dateKey = getDateKey(day);
    const today = new Date();
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (checkDate > today) return 'future';
    
    const progress = dailyProgress[dateKey];
    if (!progress) return 'none';
    
    if (progress.isComplete) return 'full';
    if (progress.targetsCompleted.length > 0) return 'partial';
    return 'missed';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'full':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'partial':
        return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      case 'missed':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'full':
        return 'bg-green-500/20 border-green-500/30';
      case 'partial':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'missed':
        return 'bg-red-500/20 border-red-500/30';
      case 'future':
        return 'bg-zinc-800/50 border-zinc-700';
      default:
        return 'bg-zinc-900 border-zinc-800';
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-zinc-800">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="font-bold text-lg">{monthName}</h3>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-zinc-800">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs text-zinc-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before first of month */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const status = getDayStatus(day);
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
          
          return (
            <div
              key={day}
              className={`aspect-square rounded-lg border flex flex-col items-center justify-center text-sm ${getStatusBg(status)} ${isToday ? 'ring-2 ring-purple-500' : ''}`}
            >
              <span className={`text-xs ${isToday ? 'font-bold text-purple-400' : 'text-zinc-400'}`}>
                {day}
              </span>
              {getStatusIcon(status)}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
          <span>Complete</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30" />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
          <span>Missed</span>
        </div>
      </div>
    </Card>
  );
};

export default ProgressCalendar;
