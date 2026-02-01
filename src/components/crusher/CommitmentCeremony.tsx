import { useState } from 'react';
import { Lock, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { getDailyPIN, isWithinTimeWindow } from '@/lib/firebase';
import { CommitmentItem, DEFAULT_COMMITMENTS } from '@/types/studyCrusher';

interface CommitmentCeremonyProps {
  onStart: () => void;
  onLock: (reason: string) => void;
}

const CommitmentCeremony = ({ onStart, onLock }: CommitmentCeremonyProps) => {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [commitmentStatement, setCommitmentStatement] = useState('');
  const [commitments, setCommitments] = useState<CommitmentItem[]>(DEFAULT_COMMITMENTS);
  const [step, setStep] = useState<'pin' | 'commitment'>('pin');

  const handlePinSubmit = () => {
    // Check time window first
    if (!isWithinTimeWindow()) {
      onLock('Outside allowed time window (8 AM - 10 PM). Try again tomorrow.');
      return;
    }

    const correctPin = getDailyPIN(new Date());
    
    if (pin === correctPin) {
      setStep('commitment');
      setPinError('');
    } else {
      const newAttempts = pinAttempts + 1;
      setPinAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        onLock('Too many wrong PIN attempts. Ask for tomorrow\'s PIN.');
      } else {
        setPinError(`Wrong PIN. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  const toggleCommitment = (id: string) => {
    setCommitments(prev => prev.map(c => 
      c.id === id ? { ...c, checked: !c.checked } : c
    ));
  };

  const allCommitmentsMet = () => {
    return commitments.every(c => c.checked) && 
           commitmentStatement.toLowerCase().includes('today i will finish all targets');
  };

  const currentHour = new Date().getHours();
  const isValidTime = currentHour >= 8 && currentHour < 22;

  return (
    <div className="max-w-md mx-auto">
      {step === 'pin' && (
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Enter Daily PIN</h3>
            <p className="text-sm text-muted-foreground">
              Enter today's PIN to start your study session
            </p>
          </div>

          {!isValidTime && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Outside Study Hours</p>
                <p className="text-red-300/70 text-sm">Sessions only allowed 8 AM - 10 PM</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              className="text-center text-2xl tracking-[0.5em] font-mono bg-background/50"
            />
            
            {pinError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {pinError}
              </div>
            )}

            <Button
              onClick={handlePinSubmit}
              disabled={pin.length !== 4 || !isValidTime}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90"
            >
              Verify PIN
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>Hint: PIN changes daily based on the date</p>
          </div>
        </div>
      )}

      {step === 'commitment' && (
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Commitment Ceremony</h3>
            <p className="text-sm text-muted-foreground">
              Make your commitment before starting
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Type your commitment statement:
              </label>
              <Input
                placeholder="Today I will finish all targets without distractions"
                value={commitmentStatement}
                onChange={(e) => setCommitmentStatement(e.target.value)}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must include "Today I will finish all targets"
              </p>
            </div>

            <div className="space-y-3">
              {commitments.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background/30 hover:bg-background/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleCommitment(item.id)}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <span className={item.checked ? 'text-green-400' : 'text-foreground'}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>

            <Button
              onClick={onStart}
              disabled={!allCommitmentsMet()}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 disabled:opacity-50"
            >
              🚀 Start Session
            </Button>

            {!allCommitmentsMet() && (
              <p className="text-center text-xs text-muted-foreground">
                Complete all commitments to enable Start
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitmentCeremony;
