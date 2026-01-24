import { useState, useEffect, useRef } from "react";
import { Bell, BellOff, Plus, X, Volume2, Upload } from "lucide-react";
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
  const [customTone, setCustomTone] = useLocalStorage<string | null>("neet-alarm-tone", null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTime, setNewTime] = useState("06:00");
  const [newLabel, setNewLabel] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ringingAlarm, setRingingAlarm] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const beepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop all alarm sounds
  const stopAlarmSound = () => {
    // Stop custom audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Stop Web Audio API beeps
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
    
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
      oscillatorRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  // Play continuous beep sound using Web Audio API
  const playContinuousBeep = () => {
    stopAlarmSound();
    
    const playBeepPattern = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const playBeep = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = "square";
        
        gainNode.gain.setValueAtTime(0.4, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Play an energetic beep pattern
      const now = audioContext.currentTime;
      for (let i = 0; i < 6; i++) {
        playBeep(880, now + i * 0.2, 0.15);
        playBeep(1100, now + i * 0.2 + 0.1, 0.08);
      }
    };

    // Play immediately and then repeat every 1.5 seconds
    playBeepPattern();
    beepIntervalRef.current = setInterval(playBeepPattern, 1500);
  };

  // Play custom audio continuously
  const playCustomAudio = () => {
    stopAlarmSound();
    
    if (customTone && audioRef.current) {
      audioRef.current.src = customTone;
      audioRef.current.loop = true;
      audioRef.current.volume = 1.0;
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        // Fallback to beep if custom audio fails
        playContinuousBeep();
      });
    } else {
      playContinuousBeep();
    }
  };

  // Handle file upload for custom tone
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("audio/") || file.name.endsWith(".mp3")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setCustomTone(result);
          toast({
            title: "🎵 Custom Tone Uploaded",
            description: `"${file.name}" set as your alarm tone!`,
          });
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "❌ Invalid File",
          description: "Please upload an MP3 or audio file.",
          variant: "destructive",
        });
      }
    }
  };

  // Check alarms every second
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
          playCustomAudio();
          toast({
            title: `⏰ ${alarm.label}`,
            description: `Alarm for ${alarm.time}`,
          });
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [alarms, ringingAlarm, customTone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlarmSound();
    };
  }, []);

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
    stopAlarmSound();
    setRingingAlarm(null);
  };

  const testAlarm = () => {
    playCustomAudio();
    setTimeout(() => {
      stopAlarmSound();
    }, 3000);
    toast({
      title: "🔔 Test Alarm",
      description: "Playing for 3 seconds...",
    });
  };

  const removeCustomTone = () => {
    setCustomTone(null);
    toast({
      title: "🎵 Custom Tone Removed",
      description: "Using default beep sound.",
    });
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 animate-fade-in">
      {/* Hidden audio element for custom tones */}
      <audio ref={audioRef} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/*,.mp3"
        className="hidden"
      />

      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-pastel flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </span>
          Alarm
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-peach hover:bg-peach/20 h-8 w-8 p-0"
            title="Upload custom alarm tone"
          >
            <Upload className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={testAlarm}
            className="text-secondary hover:bg-secondary/20 h-8 w-8 p-0"
            title="Test alarm sound"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-primary hover:bg-primary/20 h-8 w-8 p-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Custom Tone Indicator */}
      {customTone && (
        <div className="mb-2 sm:mb-3 p-2 bg-peach/20 rounded-lg flex items-center justify-between text-xs">
          <span className="text-peach font-medium">🎵 Custom tone</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeCustomTone}
            className="h-5 px-2 text-[10px] text-muted-foreground hover:text-destructive"
          >
            Remove
          </Button>
        </div>
      )}

      {/* Current Time Display */}
      <div className="text-center mb-3 sm:mb-4 p-2.5 sm:p-3 bg-muted/20 rounded-xl">
        <p className="text-2xl sm:text-3xl font-bold text-primary">
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
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-destructive/20 border border-destructive/50 rounded-xl animate-glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-destructive animate-pulse" />
              <span className="font-medium text-sm sm:text-base">
                {alarms.find((a) => a.id === ringingAlarm)?.label}
              </span>
            </div>
            <Button
              onClick={dismissAlarm}
              className="bg-destructive text-destructive-foreground text-xs sm:text-sm"
              size="sm"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-muted/30 rounded-xl space-y-2 animate-fade-in">
          <Input
            placeholder="Alarm label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="bg-background/50 border-border text-sm"
          />
          <Input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="bg-background/50 border-border text-sm"
          />
          <Button onClick={addAlarm} className="w-full bg-gradient-pastel text-white text-sm">
            Add Alarm
          </Button>
        </div>
      )}

      <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-all ${
              alarm.enabled ? "bg-muted/20" : "bg-muted/10 opacity-50"
            } ${ringingAlarm === alarm.id ? "ring-2 ring-destructive animate-pulse" : ""}`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => toggleAlarm(alarm.id)}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  alarm.enabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {alarm.enabled ? <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <BellOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
              <div>
                <p className="font-bold text-base sm:text-lg">{alarm.time}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{alarm.label}</p>
              </div>
            </div>
            <button
              onClick={() => removeAlarm(alarm.id)}
              className="p-1 hover:bg-destructive/20 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlarmClock;
