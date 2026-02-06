import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm">{getDayName(time)}</p>
          <p className="text-2xl font-bold text-white">{formatDate(time)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-purple-400" />
          <span className="text-4xl font-mono font-bold text-white tracking-wider">
            {formatTime(time)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default RealTimeClock;
