import { useState } from 'react';
import { Check, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DEFAULT_COMMITMENTS, COMMITMENT_PHRASE, CommitmentItem } from '@/types/studyCrusher';

interface CommitmentCeremonyProps {
  onStart: () => void;
  onLock: (reason: string) => void;
}

const CommitmentCeremony = ({ onStart, onLock }: CommitmentCeremonyProps) => {
  const [typedPhrase, setTypedPhrase] = useState('');
  const [commitments, setCommitments] = useState<CommitmentItem[]>(DEFAULT_COMMITMENTS);
  const [attempts, setAttempts] = useState(0);

  const phraseMatches = typedPhrase.toLowerCase().trim() === COMMITMENT_PHRASE.toLowerCase();
  const allChecked = commitments.every(c => c.checked);
  const canStart = phraseMatches && allChecked;

  const handleCheckChange = (id: string, checked: boolean) => {
    setCommitments(prev =>
      prev.map(c => (c.id === id ? { ...c, checked } : c))
    );
  };

  const handlePhraseChange = (value: string) => {
    setTypedPhrase(value);
    
    // Count wrong attempts
    if (value.length >= COMMITMENT_PHRASE.length && value.toLowerCase().trim() !== COMMITMENT_PHRASE.toLowerCase()) {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        onLock('Too many wrong attempts in commitment ceremony');
      }
    }
  };

  return (
    <div className="bg-black rounded-2xl p-6 border border-zinc-800 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <Keyboard className="w-8 h-8 text-pink-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Commitment Ceremony</h2>
        <p className="text-zinc-400">Type the exact phrase and check all boxes to start</p>
      </div>

      {/* Phrase to type */}
      <div className="mb-6">
        <label className="block text-sm text-zinc-400 mb-2">Type this exactly:</label>
        <div className="bg-zinc-900 rounded-xl p-4 mb-3 border border-zinc-700">
          <p className="text-lg text-pink-400 font-medium">"{COMMITMENT_PHRASE}"</p>
        </div>
        <Input
          value={typedPhrase}
          onChange={(e) => handlePhraseChange(e.target.value)}
          placeholder="Type the phrase here..."
          className="bg-zinc-900 border-zinc-700 text-white text-lg h-14"
        />
        {typedPhrase && !phraseMatches && typedPhrase.length > 10 && (
          <p className="text-red-400 text-sm mt-2">Phrase doesn't match. Type exactly as shown.</p>
        )}
        {phraseMatches && (
          <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
            <Check className="w-4 h-4" /> Phrase matches!
          </p>
        )}
      </div>

      {/* Checkboxes */}
      <div className="space-y-3 mb-6">
        {commitments.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
          >
            <Checkbox
              checked={item.checked}
              onCheckedChange={(checked) => handleCheckChange(item.id, checked as boolean)}
              className="border-zinc-600"
            />
            <span className={item.checked ? 'text-white' : 'text-zinc-400'}>{item.text}</span>
          </label>
        ))}
      </div>

      {/* Start button */}
      <Button
        onClick={onStart}
        disabled={!canStart}
        className={`w-full h-14 text-lg transition-all ${
          canStart
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90'
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
        }`}
      >
        {canStart ? 'Start Study Session 🔥' : 'Complete all requirements above'}
      </Button>

      {attempts > 0 && (
        <p className="text-center text-orange-400 text-sm mt-4">
          Wrong attempts: {attempts}/3
        </p>
      )}
    </div>
  );
};

export default CommitmentCeremony;
