import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TargetCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
}

const TargetCompletionModal = ({ isOpen, onClose, targetName }: TargetCompletionModalProps) => {
  useEffect(() => {
    if (isOpen) {
      // Small confetti burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#10b981', '#34d399']
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-zinc-900 border border-green-500/30 rounded-2xl p-6 text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>
        
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{targetName} Done! ✅</h3>
        
        <p className="text-zinc-300 text-lg leading-relaxed mb-6">
          "Good, you are doing well! Keep up, BMCRI keliye mehnat karti rahooo." 💪
        </p>
        
        <Button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default TargetCompletionModal;
