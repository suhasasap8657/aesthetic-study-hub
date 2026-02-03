import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Gauge, Lock, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoSlot } from '@/types/studyCrusher';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: VideoSlot;
  index: number;
  onComplete: () => void;
  onStart?: () => void;
}

const VideoCard = ({ video, index, onComplete, onStart }: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasEnded, setHasEnded] = useState(video.status === 'completed');
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          setError('Unable to play video. Please check the video source.');
          console.error('Play error:', err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const rewind15 = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 15);
    }
  }, []);

  const cycleSpeed = useCallback(() => {
    const speeds = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  }, [playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => {
      setHasEnded(true);
      setIsPlaying(false);
      onComplete();
    };
    const handleError = () => {
      setError('No video assigned for this slot. Upload an MP4 to /public folder.');
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onComplete]);

  // Prevent seeking forward
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let lastTime = 0;
    const handleSeeking = () => {
      if (video.currentTime > lastTime + 1) {
        video.currentTime = lastTime;
      }
    };

    const handleTimeUpdateForSeek = () => {
      if (!video.seeking) {
        lastTime = video.currentTime;
      }
    };

    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('timeupdate', handleTimeUpdateForSeek);

    return () => {
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('timeupdate', handleTimeUpdateForSeek);
    };
  }, []);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleStartVideo = () => {
    setShowPlayer(true);
    onStart?.();
  };

  const isLocked = video.status === 'locked';
  const isReady = video.status === 'ready';
  const isCompleted = video.status === 'completed' || hasEnded;

  return (
    <div className={cn(
      "bg-black rounded-2xl overflow-hidden border-2 transition-all duration-300",
      isLocked && "border-zinc-800 opacity-60",
      isReady && "border-yellow-500/50",
      isCompleted && "border-green-500/50",
      !isLocked && !isCompleted && "border-zinc-700"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isLocked && "bg-zinc-800",
            isReady && "bg-yellow-500/20",
            isCompleted && "bg-green-500/20"
          )}>
            {isLocked && <Lock className="w-5 h-5 text-zinc-500" />}
            {isReady && <Play className="w-5 h-5 text-yellow-400" />}
            {isCompleted && <Check className="w-5 h-5 text-green-400" />}
          </div>
          <div>
            <h3 className={cn(
              "font-bold text-lg",
              isLocked ? "text-zinc-500" : "text-white"
            )}>
              {video.title}
            </h3>
            <p className="text-xs text-zinc-500">Video {index + 1} of 3</p>
          </div>
        </div>
        
        {isCompleted && (
          <div className="text-green-400 text-sm font-medium flex items-center gap-1">
            <Check className="w-4 h-4" /> Completed
          </div>
        )}
      </div>

      {/* Video Area */}
      <div className="relative aspect-video bg-black">
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-lg">Complete previous video to unlock</p>
            </div>
          </div>
        )}

        {isReady && !showPlayer && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={handleStartVideo}>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 hover:bg-white/20 transition-colors">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
              <p className="text-white text-lg font-medium">Click to Play</p>
              <p className="text-zinc-400 text-sm mt-1">No skipping allowed</p>
            </div>
          </div>
        )}

        {(showPlayer || (isReady && showPlayer) || isCompleted) && (
          <>
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6">
                  <AlertCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400 text-lg">{error}</p>
                  <p className="text-zinc-500 text-sm mt-2">
                    To add video: Upload MP4 to /public folder, then edit src in code
                  </p>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={video.src}
                className="w-full h-full object-contain"
                playsInline
                controlsList="nodownload nofullscreen"
                disablePictureInPicture
              />
            )}
            
            {hasEnded && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-6xl mb-3">✅</div>
                  <p className="text-green-400 font-bold text-2xl">Video Complete!</p>
                  {index < 2 && (
                    <p className="text-green-300 text-sm mt-2">Next video unlocked</p>
                  )}
                  {index === 2 && (
                    <p className="text-green-300 text-sm mt-2">All videos done! Targets unlocked</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Progress bar */}
      {showPlayer && !error && (
        <div className="h-1.5 bg-zinc-800">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* Controls */}
      {showPlayer && !error && !hasEnded && (
        <div className="p-4 flex items-center justify-between gap-4 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={rewind15}
              className="h-12 w-12 rounded-full bg-zinc-800 hover:bg-zinc-700"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-14 w-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={cycleSpeed}
              className="px-4 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 font-mono text-lg"
            >
              <Gauge className="w-5 h-5 mr-2" />
              {playbackRate}x
            </Button>
          </div>

          <div className="text-lg font-mono text-white">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;
