
import React from 'react';
import VideoPlayer from '../lessons/VideoPlayer';

interface VideoPlayerWrapperProps {
  videoUrl: string;
}

const VideoPlayerWrapper: React.FC<VideoPlayerWrapperProps> = ({ videoUrl }) => {
  // VideoPlayer only expects videoUrl, lessonId, courseId props according to its interface
  return <VideoPlayer videoUrl={videoUrl} lessonId="" courseId="" />;
};

export default VideoPlayerWrapper;
