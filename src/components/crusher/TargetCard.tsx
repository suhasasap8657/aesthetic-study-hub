import { Clock, Lock, Play, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudyTarget } from '@/types/studyCrusher';
import { cn } from '@/lib/utils';

interface TargetCardProps {
  target: StudyTarget;
  index: number;
  onStart: () => void;
  isCurrentlyActive: boolean;
}

const TargetCard = ({ target, index, onStart, isCurrentlyActive }: TargetCardProps) => {
  const formatMinutes = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  const getStatusColor = () => {
    switch (target.status) {
      case 'locked': return 'bg-black border-zinc-800';
      case 'ready': return 'bg-black border-yellow-500/50';
      case 'in_progress': return 'bg-black border-blue-500/50 animate-pulse';
      case 'done': return 'bg-black border-green-500/50';
      default: return 'bg-black border-zinc-800';
    }
  };

  const getStatusIcon = () => {
    switch (target.status) {
      case 'locked': return <Lock className="w-5 h-5 text-zinc-600" />;
      case 'ready': return <Play className="w-5 h-5 text-yellow-400" />;
      case 'in_progress': return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'done': return <Check className="w-5 h-5 text-green-400" />;
    }
  };

  return (
    <div className={cn(
      "rounded-xl p-4 border-2 transition-all duration-300",
      getStatusColor()
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            target.status === 'locked' ? 'bg-zinc-900' : 
            target.status === 'ready' ? 'bg-yellow-500/20' :
            target.status === 'in_progress' ? 'bg-blue-500/20' :
            'bg-green-500/20'
          )}>
            {getStatusIcon()}
          </div>
          <div>
            <h4 className={cn(
              "font-bold text-lg",
              target.status === 'locked' ? 'text-zinc-600' : 'text-white'
            )}>
              {target.name}
            </h4>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatMinutes(target.totalMinutes)} total</span>
              <span className="text-zinc-700">•</span>
              <span className="text-orange-400">Min: {formatMinutes(target.minMinutes)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {target.status === 'ready' && (
            <Button
              onClick={onStart}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-black font-bold"
              size="sm"
            >
              Start Target
            </Button>
          )}
          
          {target.status === 'done' && (
            <div className="text-right">
              <div className="text-green-400 font-bold text-sm">Done ✓</div>
              {target.overtime > 0 && (
                <div className="text-xs text-orange-400">
                  +{formatMinutes(target.overtime)} overtime
                </div>
              )}
            </div>
          )}

          {target.status === 'in_progress' && (
            <div className="text-blue-400 text-sm font-medium animate-pulse">
              In Progress...
            </div>
          )}

          {target.status === 'locked' && (
            <div className="text-zinc-700 text-sm">
              Locked
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TargetCard;
