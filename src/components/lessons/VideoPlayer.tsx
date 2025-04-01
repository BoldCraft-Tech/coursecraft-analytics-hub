
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { updateLessonProgress, getYouTubeVideoId, getEmbeddableYouTubeUrl } from '@/utils/courseVideoUtils';
import { useAuth } from '@/hooks/useAuth';
import { Play, Pause, Volume2, VolumeX, Maximize, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoPlayerProps {
  videoUrl: string;
  lessonId: string;
  courseId: string;
}

const VideoPlayer = ({ videoUrl, lessonId, courseId }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const youtubeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progressReported, setProgressReported] = useState<Record<number, boolean>>({});
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if the video is a YouTube video
  useEffect(() => {
    if (!videoUrl) return;
    
    const youtubeId = getYouTubeVideoId(videoUrl);
    setIsYouTubeVideo(!!youtubeId);
    
    if (youtubeId) {
      const embedUrl = getEmbeddableYouTubeUrl(videoUrl);
      setYoutubeEmbedUrl(embedUrl);
      setLoading(false);
      
      // Report 25% progress initially for YouTube videos
      // since we can't easily track progress
      if (user) {
        const timer = setTimeout(() => {
          updateLessonProgress(user.id, courseId, lessonId, 25)
            .then(() => {
              console.log('Initial progress reported for YouTube video');
            })
            .catch(error => {
              console.error('Error updating lesson progress:', error);
            });
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [videoUrl, user, courseId, lessonId]);

  // Initialize video player when component mounts (for direct videos)
  useEffect(() => {
    if (isYouTubeVideo || !videoUrl) return;
    
    const video = videoRef.current;
    if (!video) return;

    const updateVideoStatus = () => {
      setIsPlaying(!video.paused);
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
      
      const progressPercentage = video.duration 
        ? Math.floor((video.currentTime / video.duration) * 100) 
        : 0;
      
      setProgress(progressPercentage);
      
      // Report progress at specific intervals
      reportProgressAtIntervals(progressPercentage);
    };

    // Report progress at 25%, 50%, 75% and 95% intervals
    const reportProgressAtIntervals = (currentProgress: number) => {
      if (!user) return;
      
      const intervals = [25, 50, 75, 90, 95];
      
      for (const interval of intervals) {
        if (currentProgress >= interval && !progressReported[interval]) {
          console.log(`Reporting progress at ${interval}%`);
          updateLessonProgress(user.id, courseId, lessonId, interval)
            .then(() => {
              setProgressReported(prev => ({ ...prev, [interval]: true }));
              if (interval === 90) {
                toast({
                  title: 'Lesson almost completed',
                  description: 'You\'re almost done with this lesson!',
                });
              }
            })
            .catch(error => {
              console.error('Error updating lesson progress:', error);
            });
        }
      }
    };

    const handleTimeUpdate = () => {
      updateVideoStatus();
    };

    const handleLoadedMetadata = () => {
      updateVideoStatus();
      setLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (user) {
        updateLessonProgress(user.id, courseId, lessonId, 100)
          .then(() => {
            toast({
              title: 'Lesson completed',
              description: 'Great job! You\'ve completed this lesson.',
            });
          })
          .catch(error => {
            console.error('Error updating lesson progress:', error);
          });
      }
    };

    // Add event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', updateVideoStatus);
    video.addEventListener('pause', updateVideoStatus);

    // Remove event listeners on cleanup
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', updateVideoStatus);
      video.removeEventListener('pause', updateVideoStatus);
    };
  }, [user, lessonId, courseId, toast, isYouTubeVideo, videoUrl, progressReported]);

  // Handle marking YouTube video as completed
  const handleYouTubeCompleted = () => {
    if (!user) return;
    
    updateLessonProgress(user.id, courseId, lessonId, 100)
      .then(() => {
        toast({
          title: 'Lesson completed',
          description: 'Great job! You\'ve marked this YouTube lesson as complete!',
        });
      })
      .catch(error => {
        console.error('Error updating lesson progress:', error);
      });
  };

  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Handle seeking
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = e.currentTarget;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickPositionRatio = (e.clientX - rect.left) / rect.width;
    const newTime = video.duration * clickPositionRatio;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      player.requestFullscreen();
    }
  };

  return (
    <div 
      ref={playerRef}
      className="relative rounded-lg overflow-hidden bg-black w-full"
    >
      {loading && !isYouTubeVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
          <Skeleton className="h-full w-full" />
          <div className="absolute">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          </div>
        </div>
      )}
      
      {isYouTubeVideo ? (
        <div className="aspect-video w-full">
          {youtubeEmbedUrl ? (
            <>
              <iframe
                ref={youtubeRef}
                src={`${youtubeEmbedUrl}?autoplay=0&controls=1&rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full aspect-video"
              ></iframe>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleYouTubeCompleted}>
                  Mark as Completed
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <p>Invalid YouTube URL</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full aspect-video"
            playsInline
            preload="metadata"
          />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            {/* Progress bar */}
            <div 
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-2 relative overflow-hidden"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-primary rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                
                <div className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 hover:text-white"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
