import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomVideoPlayerProps {
  videoUrl: string;
  onComplete: () => void;
}

const CustomVideoPlayer = ({ videoUrl, onComplete }: CustomVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasEnded, setHasEnded] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
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

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
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

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-black/50 backdrop-blur-xl border border-white/10">
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          playsInline
          controlsList="nodownload nofullscreen"
          disablePictureInPicture
        />
        
        {hasEnded && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-green-400 font-bold text-xl">Video Complete!</p>
              <p className="text-green-300 text-sm">Targets unlocked</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar (read-only) */}
      <div className="h-1 bg-white/10 relative">
        <div 
          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={rewind15}
            className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={cycleSpeed}
            className="px-3 h-10 rounded-full bg-white/10 hover:bg-white/20 font-mono"
          >
            <Gauge className="w-4 h-4 mr-1" />
            {playbackRate}x
          </Button>
        </div>

        <div className="text-sm font-mono text-white/70">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
