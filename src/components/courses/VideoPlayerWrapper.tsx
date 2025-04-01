
import React from 'react';
import VideoPlayer from '../lessons/VideoPlayer';

interface VideoPlayerWrapperProps {
  videoUrl: string;
}

const VideoPlayerWrapper: React.FC<VideoPlayerWrapperProps> = ({ videoUrl }) => {
  // Pass videoUrl as a prop named 'src' to match VideoPlayer's expected props
  return <VideoPlayer src={videoUrl} />;
};

export default VideoPlayerWrapper;
