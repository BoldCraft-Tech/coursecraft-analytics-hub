
import React from 'react';
import VideoPlayer from '../lessons/VideoPlayer';

interface VideoPlayerWrapperProps {
  videoUrl: string;
}

const VideoPlayerWrapper: React.FC<VideoPlayerWrapperProps> = ({ videoUrl }) => {
  // VideoPlayer expects two types of props: either 'src' or 'videoUrl'
  // We're passing both to ensure compatibility
  return <VideoPlayer src={videoUrl} videoUrl={videoUrl} lessonId="" courseId="" />;
};

export default VideoPlayerWrapper;
