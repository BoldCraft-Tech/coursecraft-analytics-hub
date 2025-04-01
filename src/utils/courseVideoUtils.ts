
import { supabase } from '@/integrations/supabase/client';

// Define interface for lesson with video support
export interface LessonWithVideo {
  id: string;
  title: string;
  content: string;
  order_index: number;
  course_id: string;
  duration: number;
  videoUrl?: string; // Make this optional
}

// Function to fetch lessons with videos for a course
export const fetchLessonsWithVideos = async (courseId: string): Promise<LessonWithVideo[]> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');
    
    if (error) throw error;
    
    // Transform the data to include video URLs
    const lessonsWithVideos = data.map(lesson => ({
      ...lesson,
      videoUrl: undefined // Set undefined as default since video_url doesn't exist yet
    }));
    
    return lessonsWithVideos;
  } catch (error) {
    console.error('Error fetching lessons with videos:', error);
    throw error;
  }
};

// Function to update a user's progress after watching a video lesson
export const updateLessonProgress = async (
  userId: string,
  courseId: string,
  lessonId: string,
  progressPercentage: number
): Promise<void> => {
  try {
    // First, check if a progress record already exists
    const { data: existingProgress } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (existingProgress) {
      // Update existing progress record
      await supabase
        .from('user_lesson_progress')
        .update({ completed: progressPercentage >= 90, last_accessed: new Date().toISOString() })
        .eq('id', existingProgress.id);
    } else {
      // Create new progress record
      await supabase
        .from('user_lesson_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          completed: progressPercentage >= 90,
          last_accessed: new Date().toISOString()
        });
    }

    // Also update overall course progress
    await updateCourseProgress(userId, courseId);
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
};

// Function to update overall course progress
export const updateCourseProgress = async (userId: string, courseId: string): Promise<void> => {
  try {
    // Get all lessons for the course
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId);
    
    if (lessonsError) throw lessonsError;
    
    // Get progress for all lessons in this course
    const { data: progress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', 'in', `(${lessons.map(l => l.id).join(',')})`);
    
    if (progressError) throw progressError;
    
    // Calculate overall progress
    const totalLessons = lessons.length;
    const completedLessons = progress.filter(p => p.completed).length;
    const progressPercentage = totalLessons > 0 ? Math.floor((completedLessons / totalLessons) * 100) : 0;
    
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
  } catch (error) {
    console.error('Error updating course progress:', error);
    throw error;
  }
};
