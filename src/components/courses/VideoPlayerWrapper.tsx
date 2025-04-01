
import React from 'react';
import VideoPlayer from '../lessons/VideoPlayer';

interface VideoPlayerWrapperProps {
  videoUrl: string;
}

const VideoPlayerWrapper: React.FC<VideoPlayerWrapperProps> = ({ videoUrl }) => {
  return <VideoPlayer url={videoUrl} />;
};

export default VideoPlayerWrapper;
