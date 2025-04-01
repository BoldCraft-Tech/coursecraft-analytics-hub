
import { supabase } from '@/integrations/supabase/client';

// Public course video APIs
const PUBLIC_APIS = {
  YOUTUBE: 'https://www.googleapis.com/youtube/v3/search',
  PEXELS: 'https://api.pexels.com/videos/search',
  // You can add more APIs here
};

// Function to add a video URL to a lesson
export const addVideoUrlToLesson = async (lessonId: string, videoUrl: string) => {
  try {
    const { error } = await supabase
      .from('lessons')
      .update({ video_url: videoUrl })
      .eq('id', lessonId);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error adding video URL:', error);
    return { success: false, error };
  }
};

// Function to fetch public educational videos
export const fetchPublicVideos = async (query: string, limit: number = 5) => {
  // This is a placeholder function - you would need to implement actual API calls
  // using your own API keys for YouTube, Pexels, etc.
  
  // Example implementation for demonstration purposes:
  try {
    // Mock response with sample video URLs
    return {
      success: true,
      videos: [
        {
          id: '1',
          title: 'Introduction to Agriculture',
          thumbnail: 'https://picsum.photos/300/200',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '10:15',
          source: 'YouTube'
        },
        {
          id: '2',
          title: 'Sustainable Farming Techniques',
          thumbnail: 'https://picsum.photos/300/201',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '15:30',
          source: 'YouTube'
        },
        {
          id: '3',
          title: 'Water Conservation Methods',
          thumbnail: 'https://picsum.photos/300/202',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '8:45',
          source: 'Pexels'
        },
        {
          id: '4',
          title: 'Rural Development Programs',
          thumbnail: 'https://picsum.photos/300/203',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '12:20',
          source: 'YouTube'
        },
        {
          id: '5',
          title: 'Modern Rural Healthcare',
          thumbnail: 'https://picsum.photos/300/204',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '20:05',
          source: 'Pexels'
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching public videos:', error);
    return { success: false, error, videos: [] };
  }
};

// Function to extract video ID from YouTube URL
export const extractYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Function to get YouTube embed URL from video ID
export const getYouTubeEmbedUrl = (videoId: string) => {
  return `https://www.youtube.com/embed/${videoId}`;
};

// Function to check if a URL is a valid video URL
export const isValidVideoUrl = (url: string) => {
  // This is a basic validation - you might want to expand it
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+$/;
  const mp4Regex = /\.(mp4|webm|ogg)$/i;
  
  return youtubeRegex.test(url) || vimeoRegex.test(url) || mp4Regex.test(url);
};
