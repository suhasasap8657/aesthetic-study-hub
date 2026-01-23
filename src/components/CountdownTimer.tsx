import { useState, useEffect } from "react";
import { Timer, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface CountdownData {
  title: string;
  targetDate: string;
  targetTime: string;
}

const CountdownTimer = () => {
  const [countdowns, setCountdowns] = useLocalStorage<CountdownData[]>("neet-countdowns", [
    { title: "NEET 2026", targetDate: "2026-05-04", targetTime: "14:00" }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("09:00");
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: { days: number; hours: number; minutes: number; seconds: number } }>({});

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: typeof timeLeft = {};
      
      countdowns.forEach((countdown, index) => {
        const target = new Date(`${countdown.targetDate}T${countdown.targetTime}`);
        const now = new Date();
        const difference = target.getTime() - now.getTime();

        if (difference > 0) {
          newTimeLeft[index] = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          };
        } else {
          newTimeLeft[index] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
      });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdowns]);

  const addCountdown = () => {
    if (newTitle && newDate) {
      setCountdowns([...countdowns, { title: newTitle, targetDate: newDate, targetTime: newTime }]);
      setNewTitle("");
      setNewDate("");
      setNewTime("09:00");
      setShowAddForm(false);
    }
  };

  const removeCountdown = (index: number) => {
    setCountdowns(countdowns.filter((_, i) => i !== index));
  };

  return (
    <div className="glass-card rounded-2xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-pastel flex items-center justify-center">
            <Timer className="w-4 h-4 text-white" />
          </span>
          Countdown Timers
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-primary hover:bg-primary/20"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-3 bg-muted/30 rounded-xl space-y-2 animate-fade-in">
          <Input
            placeholder="Timer title (e.g., Mock Test)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="bg-background/50 border-border"
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="bg-background/50 border-border flex-1"
            />
            <Input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-background/50 border-border w-28"
            />
          </div>
          <Button onClick={addCountdown} className="w-full bg-gradient-pastel text-white">
            Add Timer
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {countdowns.map((countdown, index) => (
          <div
            key={index}
            className="relative p-4 bg-muted/20 rounded-xl border border-border/50 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <button
              onClick={() => removeCountdown(index)}
              className="absolute top-2 right-2 p-1 hover:bg-destructive/20 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
            <p className="text-sm font-medium text-primary mb-2">{countdown.title}</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {timeLeft[index] && (
                <>
                  <div className="bg-midnight/50 rounded-lg p-2">
                    <span className="text-xl font-bold text-sakura">{timeLeft[index].days}</span>
                    <p className="text-[10px] text-muted-foreground">DAYS</p>
                  </div>
                  <div className="bg-midnight/50 rounded-lg p-2">
                    <span className="text-xl font-bold text-lavender">{timeLeft[index].hours}</span>
                    <p className="text-[10px] text-muted-foreground">HRS</p>
                  </div>
                  <div className="bg-midnight/50 rounded-lg p-2">
                    <span className="text-xl font-bold text-peach">{timeLeft[index].minutes}</span>
                    <p className="text-[10px] text-muted-foreground">MIN</p>
                  </div>
                  <div className="bg-midnight/50 rounded-lg p-2">
                    <span className="text-xl font-bold text-secondary">{timeLeft[index].seconds}</span>
                    <p className="text-[10px] text-muted-foreground">SEC</p>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
