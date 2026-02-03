import { useState, useEffect } from 'react';
import { Lock, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  getDailyPINFromFirebase, 
  getFallbackPIN, 
  isWithinTimeWindow, 
  logPINAttempt, 
  getTodayKey 
} from '@/lib/firebase';

interface PINModalProps {
  onSuccess: () => void;
  onLock: (reason: string) => void;
}

const PINModal = ({ onSuccess, onLock }: PINModalProps) => {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [correctPIN, setCorrectPIN] = useState<string | null>(null);
  const [noPinSet, setNoPinSet] = useState(false);
  const [outsideTimeWindow, setOutsideTimeWindow] = useState(false);

  const MAX_ATTEMPTS = 5;

  useEffect(() => {
    const checkAccess = async () => {
      setLoading(true);
      
      // Check time window first
      if (!isWithinTimeWindow()) {
        setOutsideTimeWindow(true);
        setLoading(false);
        return;
      }

      // Fetch PIN from Firebase
      const today = getTodayKey();
      const firebasePIN = await getDailyPINFromFirebase(today);
      
      if (firebasePIN?.pin) {
        setCorrectPIN(firebasePIN.pin);
      } else {
        // No PIN set in Firebase - use fallback or lock
        // For strictness, we lock if no PIN is set
        // To use fallback instead, uncomment: setCorrectPIN(getFallbackPIN(new Date()));
        setNoPinSet(true);
      }
      
      setLoading(false);
    };

    checkAccess();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin === correctPIN) {
      await logPINAttempt(getTodayKey(), true, attempts + 1);
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin('');
      
      if (newAttempts >= MAX_ATTEMPTS) {
        await logPINAttempt(getTodayKey(), false, newAttempts);
        onLock('Too many wrong PIN attempts. Ask for tomorrow\'s PIN.');
      } else {
        setError(`Wrong PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (outsideTimeWindow) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Outside Study Hours</h1>
          <p className="text-zinc-400 text-lg mb-6">
            Study sessions are only available between <span className="text-orange-400 font-bold">8:00 AM</span> and <span className="text-orange-400 font-bold">10:00 PM</span>.
          </p>
          <p className="text-zinc-500">Come back during study hours to start your session.</p>
        </div>
      </div>
    );
  }

  if (noPinSet) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">No PIN Set Today</h1>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-300 text-lg">Session Locked</p>
          </div>
          <p className="text-zinc-400 text-lg mb-4">
            The daily PIN has not been set in Firebase.
          </p>
          <div className="bg-zinc-900 rounded-xl p-4 text-left text-sm text-zinc-400">
            <p className="font-medium text-zinc-300 mb-2">To set PIN:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to Firebase Console → Firestore</li>
              <li>Collection: <code className="text-pink-400">dailyPins</code></li>
              <li>Document: <code className="text-pink-400">{getTodayKey()}</code></li>
              <li>Add field: <code className="text-pink-400">pin: "XXXX"</code></li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-pink-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Enter Daily PIN</h1>
          <p className="text-zinc-400">Enter your 4-digit access code to start studying</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setPin(value);
                setError('');
              }}
              className="text-center text-4xl tracking-[1em] h-20 bg-zinc-900 border-zinc-700 text-white font-mono"
              placeholder="••••"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={pin.length !== 4}
            className="w-full h-14 text-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 disabled:opacity-50"
          >
            Unlock Session
          </Button>

          <p className="text-center text-zinc-500 text-sm">
            Attempts: {attempts}/{MAX_ATTEMPTS}
          </p>
        </form>
      </div>
    </div>
  );
};

export default PINModal;
