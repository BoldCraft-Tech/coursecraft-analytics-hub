
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
    
    // Process and format video URLs if needed (YouTube or direct links)
    const lessonsWithVideos = lessons.map(lesson => ({
      ...lesson,
      // Safely access video_url or set to null if it doesn't exist
      video_url: (lesson as any).video_url || null
    }));
    
    console.log('Returning lessons with videos:', lessonsWithVideos);
    return lessonsWithVideos;
  } catch (error) {
    console.error('Error in fetchLessonsWithVideos:', error);
    throw error;
  }
};

/**
 * Get YouTube video ID from URL
 */
export const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Match YouTube URL patterns
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Generate embeddable YouTube URL
 */
export const getEmbeddableYouTubeUrl = (url: string): string | null => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

/**
 * Updates a user's lesson progress
 */
export const updateLessonProgress = async (
  userId: string, 
  courseId: string, 
  lessonId: string, 
  progressPercentage: number
): Promise<void> => {
  try {
    console.log(`Updating progress for user ${userId}, lesson ${lessonId} to ${progressPercentage}%`);
    
    const completed = progressPercentage >= 90; // Mark as completed if progress is at least 90%
    
    // First check if a record already exists
    const { data: existingProgress } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();
      
    if (existingProgress) {
      // Update the existing record
      const { error } = await supabase
        .from('user_lesson_progress')
        .update({
          completed,
          last_accessed: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);
        
      if (error) {
        console.error('Error updating lesson progress:', error);
        throw error;
      }
    } else {
      // Insert a new record
      const { error } = await supabase
        .from('user_lesson_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          completed,
          last_accessed: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error inserting lesson progress:', error);
        throw error;
      }
    }
    
    console.log(`Progress updated successfully. Completed: ${completed}`);
    
    // Update the course enrollment progress if needed
    if (completed) {
      await updateCourseProgress(userId, courseId);
    }
  } catch (error) {
    console.error('Error in updateLessonProgress:', error);
    throw error;
  }
};

/**
 * Search YouTube videos using API
 */
export const searchYouTubeVideos = async (
  query: string, 
  apiKey: string, 
  maxResults: number = 5
): Promise<any[]> => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    throw error;
  }
};

/**
 * Helper function to update overall course progress
 */
const updateCourseProgress = async (userId: string, courseId: string): Promise<void> => {
  try {
    // Get total lessons for this course
    const { data: totalLessonsData, error: totalError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId);
      
    if (totalError) throw totalError;
    
    const totalLessons = totalLessonsData?.length || 0;
    
    if (totalLessons === 0) return; // No lessons to track
    
    // Get completed lessons for this user and course
    const { data: completedLessonsData, error: completedError } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('completed', true)
      .in('lesson_id', totalLessonsData.map(lesson => lesson.id));
      
    if (completedError) throw completedError;
    
    const completedLessons = completedLessonsData?.length || 0;
    
    // Calculate progress percentage
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
    
    // Update enrollment record
    const { error: updateError } = await supabase
      .from('enrollments')
      .update({ 
        progress: progressPercentage,
        completed: progressPercentage === 100,
        last_accessed: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);
      
    if (updateError) throw updateError;
    
    console.log(`Course progress updated to ${progressPercentage}%`);
  } catch (error) {
    console.error('Error updating course progress:', error);
    throw error;
  }
};
