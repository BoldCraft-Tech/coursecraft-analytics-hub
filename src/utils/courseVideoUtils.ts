
import { supabase } from '@/integrations/supabase/client';

// Updated interface to include video_url
interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  order_index: number;
  course_id: string;
  created_at: string;
  updated_at: string;
  video_url?: string;
}

/**
 * Fetches lessons with video URLs for a given course
 */
export const fetchLessonsWithVideos = async (courseId: string): Promise<Lesson[]> => {
  try {
    console.log('Fetching lessons for course ID:', courseId);
    
    // First, fetch all lessons for this course
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
      
    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      throw lessonsError;
    }
    
    if (!lessons || lessons.length === 0) {
      console.log('No lessons found for course:', courseId);
      return [];
    }
    
    console.log(`Found ${lessons.length} lessons`);
    
    // Fetch video URLs from videos table if they exist
    // This is an example - adjust according to your actual database structure
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('lesson_id, url')
      .in('lesson_id', lessons.map(lesson => lesson.id));
      
    if (videosError) {
      console.error('Error fetching videos:', videosError);
      // We continue without videos if there's an error fetching them
    }
    
    // Create a map of lesson IDs to video URLs
    const videoMap = videos 
      ? videos.reduce((map: Record<string, string>, video) => {
          map[video.lesson_id] = video.url;
          return map;
        }, {})
      : {};
    
    // Combine lessons with video URLs
    const lessonsWithVideos = lessons.map(lesson => ({
      ...lesson,
      video_url: videoMap[lesson.id] || null
    }));
    
    console.log('Returning lessons with videos:', lessonsWithVideos);
    return lessonsWithVideos;
  } catch (error) {
    console.error('Error in fetchLessonsWithVideos:', error);
    throw error;
  }
};
