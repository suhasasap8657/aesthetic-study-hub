import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Gauge, Lock, Check, AlertCircle, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface YouTubeVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  status: 'locked' | 'ready' | 'playing' | 'completed';
  watchedSeconds: number;
}

interface YouTubeVideoCardProps {
  video: YouTubeVideo;
  index: number;
  totalVideos: number;
  onWatchTimeUpdate: (seconds: number) => void;
  onComplete: () => void;
}

// Editable YouTube URLs - paste your links here
export const DEFAULT_YOUTUBE_VIDEOS: YouTubeVideo[] = [
  {
    id: 'video-1',
    title: 'Lecture Video 1',
    youtubeUrl: '', // Paste YouTube URL: e.g., 'https://www.youtube.com/watch?v=VIDEO_ID'
    status: 'locked',
    watchedSeconds: 0
  },
  {
    id: 'video-2',
    title: 'Lecture Video 2',
    youtubeUrl: '', // Paste YouTube URL: e.g., 'https://www.youtube.com/watch?v=VIDEO_ID'
    status: 'locked',
    watchedSeconds: 0
  }
];

const REQUIRED_WATCH_TIME = 3600; // 1 hour in seconds

const YouTubeVideoCard = ({ video, index, totalVideos, onWatchTimeUpdate, onComplete }: YouTubeVideoCardProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedTime, setWatchedTime] = useState(video.watchedSeconds);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showPlayer, setShowPlayer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(video.youtubeUrl);

  // Track real watch time (only counts when actually playing)
  useEffect(() => {
    if (isPlaying && playbackRate === 1) {
      watchTimerRef.current = setInterval(() => {
        setWatchedTime(prev => {
          const newTime = prev + 1;
          // Throttle updates to Firebase
          if (newTime - lastUpdateRef.current >= 10) {
            onWatchTimeUpdate(10);
            lastUpdateRef.current = newTime;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current);
      }
    }

    return () => {
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current);
      }
    };
  }, [isPlaying, playbackRate, onWatchTimeUpdate]);

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.log('Fullscreen not available');
    }
  };

  const handleStartVideo = async () => {
    if (!videoId) {
      setError('No YouTube link configured. Edit youtubeUrl in code.');
      return;
    }
    setShowPlayer(true);
    await requestFullscreen();
  };

  const handleComplete = () => {
    onComplete();
  };

  const isLocked = video.status === 'locked';
  const isReady = video.status === 'ready';
  const isCompleted = video.status === 'completed';

  return (
    <div className={cn(
      "bg-black rounded-2xl overflow-hidden border-2 transition-all duration-300",
      isLocked && "border-zinc-800 opacity-60",
      isReady && "border-yellow-500/50 shadow-lg shadow-yellow-500/10",
      isCompleted && "border-green-500/50 shadow-lg shadow-green-500/10",
      !isLocked && !isCompleted && showPlayer && "border-pink-500/50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            isLocked && "bg-zinc-800",
            isReady && "bg-yellow-500/20",
            isCompleted && "bg-green-500/20"
          )}>
            {isLocked && <Lock className="w-6 h-6 text-zinc-500" />}
            {isReady && <Play className="w-6 h-6 text-yellow-400" />}
            {isCompleted && <Check className="w-6 h-6 text-green-400" />}
          </div>
          <div>
            <h3 className={cn(
              "font-bold text-xl",
              isLocked ? "text-zinc-500" : "text-white"
            )}>
              {video.title}
            </h3>
            <p className="text-sm text-zinc-500">Video {index + 1} of {totalVideos}</p>
          </div>
        </div>
        
        {isCompleted && (
          <div className="text-green-400 text-sm font-bold flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full">
            <Check className="w-4 h-4" /> Done
          </div>
        )}
      </div>

      {/* Video Area */}
      <div className="relative aspect-video bg-black">
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-20 h-20 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-xl font-medium">Complete previous video first</p>
            </div>
          </div>
        )}

        {isReady && !showPlayer && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer group" onClick={handleStartVideo}>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-all group-hover:scale-110">
                <Play className="w-12 h-12 text-white ml-2" />
              </div>
              <p className="text-white text-xl font-bold">Click to Play</p>
              <p className="text-zinc-400 text-sm mt-2">No skipping allowed • 1x speed only counts</p>
            </div>
          </div>
        )}

        {showPlayer && !error && videoId && (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0&controls=0&disablekb=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <AlertCircle className="w-20 h-20 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-xl">{error}</p>
              <p className="text-zinc-500 text-sm mt-4 max-w-xs mx-auto">
                To add YouTube link: Edit the youtubeUrl in YouTubeVideoCard.tsx
              </p>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-7xl mb-4">✅</div>
              <p className="text-green-400 font-bold text-3xl">Video Complete!</p>
              {index < totalVideos - 1 && (
                <p className="text-green-300 text-lg mt-2">Next video unlocked</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Watch Time Counter */}
      {(showPlayer || isCompleted) && (
        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-lg font-mono text-white">
              <span className="text-zinc-400">Watch time: </span>
              <span className={watchedTime >= REQUIRED_WATCH_TIME / 2 ? "text-green-400" : "text-yellow-400"}>
                {formatTime(watchedTime)}
              </span>
              <span className="text-zinc-500"> / {formatTime(REQUIRED_WATCH_TIME)}</span>
            </div>
            
            {!isCompleted && watchedTime >= 1800 && ( // 30 min per video minimum
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
              >
                <Check className="w-4 h-4 mr-2" /> Mark Complete
              </Button>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
              style={{ width: `${Math.min((watchedTime / (REQUIRED_WATCH_TIME / 2)) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeVideoCard;
