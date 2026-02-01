import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCalendarMarks, CalendarMark } from '@/lib/firebase';

const CrusherCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [marks, setMarks] = useState<CalendarMark[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMarks = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const fetchedMarks = await getCalendarMarks(year, month);
      setMarks(fetchedMarks);
    } catch (error) {
      console.error('Error loading calendar marks:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadMarks();
  }, [loadMarks]);

  const monthDays = (() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  })();

  const getMarkForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return marks.find(m => m.date === dateStr);
  };

  const getDayStatus = (date: Date) => {
    const mark = getMarkForDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate > today) return 'future';
    if (!mark) return 'no-data';
    return mark.status;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-5 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-semibold text-lg">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-zinc-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
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
                aspect-square rounded-lg flex flex-col items-center justify-center text-sm
                transition-all duration-200 relative
                ${isToday ? 'ring-2 ring-pink-500' : ''}
                ${status === 'future' ? 'bg-zinc-800/30 text-zinc-600' : ''}
                ${status === 'no-data' ? 'bg-zinc-800/50 text-zinc-500' : ''}
                ${status === 'green' ? 'bg-green-500/20 text-green-400' : ''}
                ${status === 'red' ? 'bg-red-500/20 text-red-400' : ''}
                ${status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}
              `}
            >
              <span className="font-medium text-xs">{date.getDate()}</span>
              {status === 'green' && <Check className="w-3 h-3 mt-0.5" />}
              {status === 'red' && <X className="w-3 h-3 mt-0.5" />}
              {status === 'no-data' && !isToday && date < new Date() && (
                <Minus className="w-3 h-3 mt-0.5 text-zinc-600" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500/30 flex items-center justify-center">
            <Check className="w-2 h-2 text-green-400" />
          </div>
          <span className="text-zinc-400">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/30 flex items-center justify-center">
            <X className="w-2 h-2 text-red-400" />
          </div>
          <span className="text-zinc-400">Missed/Incomplete</span>
        </div>
      </div>
    </div>
  );
};

export default CrusherCalendar;
