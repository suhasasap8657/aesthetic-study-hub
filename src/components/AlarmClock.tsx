import { useState, useEffect, useRef } from "react";
import { Bell, BellOff, Plus, X, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/hooks/use-toast";

interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
}

const AlarmClock = () => {
  const [alarms, setAlarms] = useLocalStorage<Alarm[]>("neet-alarms", [
    { id: "1", time: "04:44", label: "Wake up & Yoga", enabled: true },
    { id: "2", time: "05:00", label: "Test Time", enabled: true },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTime, setNewTime] = useState("06:00");
  const [newLabel, setNewLabel] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ringingAlarm, setRingingAlarm] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate beep sound using Web Audio API
  const playBeepSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playBeep = (frequency: number, startTime: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = "square";
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    };

    // Play a pattern of beeps
    const now = audioContext.currentTime;
    for (let i = 0; i < 3; i++) {
      playBeep(880, now + i * 0.4);
      playBeep(1100, now + i * 0.4 + 0.15);
    }

    return audioContext;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const currentTimeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      alarms.forEach((alarm) => {
        if (alarm.enabled && alarm.time === currentTimeStr && !ringingAlarm) {
          setRingingAlarm(alarm.id);
          playBeepSound();
          toast({
            title: `⏰ ${alarm.label}`,
            description: `Alarm for ${alarm.time}`,
          });
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [alarms, ringingAlarm]);

  // Auto-dismiss alarm after 30 seconds
  useEffect(() => {
    if (ringingAlarm) {
      const timeout = setTimeout(() => {
        setRingingAlarm(null);
      }, 30000);
      return () => clearTimeout(timeout);
    }
  }, [ringingAlarm]);

  const addAlarm = () => {
    if (newTime) {
      setAlarms([
        ...alarms,
        {
          id: Date.now().toString(),
          time: newTime,
          label: newLabel || "Alarm",
          enabled: true,
        },
      ]);
      setNewTime("06:00");
      setNewLabel("");
      setShowAddForm(false);
    }
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  };

  const removeAlarm = (id: string) => {
    setAlarms(alarms.filter((a) => a.id !== id));
  };

  const dismissAlarm = () => {
    setRingingAlarm(null);
  };

  const testAlarm = () => {
    playBeepSound();
    toast({
      title: "🔔 Test Alarm",
      description: "This is how your alarm will sound!",
    });
  };

  return (
    <div className="glass-card rounded-2xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-pastel flex items-center justify-center">
            <Bell className="w-4 h-4 text-white" />
          </span>
          Alarm Clock
        </h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={testAlarm}
            className="text-secondary hover:bg-secondary/20"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-primary hover:bg-primary/20"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Current Time Display */}
      <div className="text-center mb-4 p-3 bg-muted/20 rounded-xl">
        <p className="text-3xl font-bold text-primary">
          {currentTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
        </p>
      </div>

      {/* Ringing Alert */}
      {ringingAlarm && (
        <div className="mb-4 p-4 bg-destructive/20 border border-destructive/50 rounded-xl animate-glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-destructive animate-pulse" />
              <span className="font-medium">
                {alarms.find((a) => a.id === ringingAlarm)?.label}
              </span>
            </div>
            <Button
              onClick={dismissAlarm}
              className="bg-destructive text-destructive-foreground"
              size="sm"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="mb-4 p-3 bg-muted/30 rounded-xl space-y-2 animate-fade-in">
          <Input
            placeholder="Alarm label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="bg-background/50 border-border"
          />
          <Input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="bg-background/50 border-border"
          />
          <Button onClick={addAlarm} className="w-full bg-gradient-pastel text-white">
            Add Alarm
          </Button>
        </div>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              alarm.enabled ? "bg-muted/20" : "bg-muted/10 opacity-50"
            } ${ringingAlarm === alarm.id ? "ring-2 ring-destructive animate-pulse" : ""}`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleAlarm(alarm.id)}
                className={`p-2 rounded-lg transition-colors ${
                  alarm.enabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {alarm.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              <div>
                <p className="font-bold text-lg">{alarm.time}</p>
                <p className="text-xs text-muted-foreground">{alarm.label}</p>
              </div>
            </div>
            <button
              onClick={() => removeAlarm(alarm.id)}
              className="p-1 hover:bg-destructive/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlarmClock;
