
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Create a base axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API services for courses
export const courseService = {
  getAllCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },
  
  getCourseById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  
  getRecommendations: async (interests?: string, level?: string) => {
    const params = new URLSearchParams();
    if (interests) params.append('interests', interests);
    if (level) params.append('level', level);
    
    const response = await api.get(`/courses/recommendations?${params.toString()}`);
    return response.data;
  },
  
  getAIRecommendations: async (interests?: string, level?: string, userPreferences?: any) => {
    try {
      // Try getting recommendations from Supabase Edge Function
      // Make sure to use the full URL including the Supabase project ID
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lmizrylbhbapimyuyajc.supabase.co';
      const { data } = await axios.post(
        `${supabaseUrl}/functions/v1/ai-recommendations`,
        { interests, level, userPreferences },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );
      return data;
    } catch (error) {
      console.error('Error fetching from Supabase AI recommendations:', error);
      try {
        // Fallback to NestJS backend
        const response = await api.post('/courses/ai-recommendations', { 
          interests, 
          level, 
          userPreferences 
        });
        return response.data;
      } catch (nestError) {
        console.error('Error fetching from NestJS AI recommendations:', nestError);
        // Final fallback to regular recommendations
        return courseService.getRecommendations(interests, level);
      }
    }
  },
  
  seedLessons: async (courseId: string, numLessons: number) => {
    const response = await api.post(`/courses/${courseId}/seed-lessons`, { numLessons });
    return response.data;
  },
  
  addVideoLessons: async (courseId: string) => {
    const response = await api.post(`/courses/${courseId}/add-video-lessons`);
    return response.data;
  }
};

// API services for enrollments
export const enrollmentService = {
  create: async (userId: string, courseId: string) => {
    const response = await api.post('/enrollments', { user_id: userId, course_id: courseId });
    return response.data;
  },
  
  findByUserId: async (userId: string) => {
    const response = await api.get(`/enrollments/user/${userId}`);
    return response.data;
  },
  
  delete: async (userId: string, courseId: string) => {
    const response = await api.delete(`/enrollments/user/${userId}/course/${courseId}`);
    return response.data;
  }
};

// API services for user progress
export const lessonProgressService = {
  updateProgress: async (lessonId: string, userId: string, completed: boolean) => {
    try {
      console.log(`Updating lesson progress for lesson ${lessonId}, user ${userId}, completed: ${completed}`);
      
      // Check if progress record exists
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      let response;
      
      if (existingProgress) {
        // Update existing progress
        const { data, error } = await supabase
          .from('user_lesson_progress')
          .update({ 
            completed,
            last_accessed: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('lesson_id', lessonId);
          
        if (error) throw error;
        response = data;
      } else {
        // Create new progress
        const { data, error } = await supabase
          .from('user_lesson_progress')
          .insert({ 
            user_id: userId,
            lesson_id: lessonId,
            completed,
            last_accessed: new Date().toISOString()
          });
          
        if (error) throw error;
        response = data;
      }
      
      // Also update the course enrollment progress
      await updateCourseProgress(lessonId, userId);
      
      return response;
    } catch (error) {
      console.error('Error in updateProgress:', error);
      throw error;
    }
  },
  
  getLessonProgress: async (userId: string, courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false });
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in getLessonProgress:', error);
      throw error;
    }
  }
};

// Helper function to update course progress
async function updateCourseProgress(lessonId: string, userId: string) {
  try {
    // First get the course_id of the lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('course_id')
      .eq('id', lessonId)
      .single();
      
    if (lessonError) throw lessonError;
    
    // Count total lessons in course
    const { count: totalLessons, error: countError } = await supabase
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', lesson.course_id);
      
    if (countError) throw countError;
    
    // Get lesson IDs for this course
    const { data: lessonIds, error: lessonIdsError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', lesson.course_id);
      
    if (lessonIdsError) throw lessonIdsError;
    
    // Count completed lessons by user - explicitly reference tables to avoid ambiguity
    const { count: completedLessons, error: completedError } = await supabase
      .from('user_lesson_progress')
      .select('user_lesson_progress.lesson_id', { count: 'exact', head: true })
      .eq('user_lesson_progress.user_id', userId)
      .eq('user_lesson_progress.completed', true)
      .in('user_lesson_progress.lesson_id', lessonIds.map(l => l.id));
      
    if (completedError) throw completedError;
    
    // Calculate progress
    const progressPercentage = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const isCompleted = progressPercentage === 100;
    
    // Update enrollment
    const { error: updateError } = await supabase
      .from('enrollments')
      .update({
        progress: progressPercentage,
        completed: isCompleted,
        last_accessed: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', lesson.course_id);
      
    if (updateError) throw updateError;
    
    return { progressPercentage, isCompleted };
  } catch (error) {
    console.error('Error updating course progress:', error);
    throw error;
  }
}

// API services for certificates
export const certificateService = {
  generate: async (userId: string, courseId: string) => {
    try {
      console.log(`Generating certificate for user ${userId}, course ${courseId}`);
      
      // First, verify all lessons are completed
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId);
        
      if (lessonsError) throw lessonsError;
      
      const lessonIds = lessons.map(lesson => lesson.id);
      
      // Get completed lessons count with explicit table reference
      const { count: completedCount, error: countError } = await supabase
        .from('user_lesson_progress')
        .select('user_lesson_progress.id', { count: 'exact', head: true })
        .eq('user_lesson_progress.user_id', userId)
        .eq('user_lesson_progress.completed', true)
        .in('user_lesson_progress.lesson_id', lessonIds);
        
      if (countError) throw countError;
      
      // Check if all lessons are completed
      if (completedCount !== lessons.length) {
        throw new Error(`Not all lessons completed (${completedCount}/${lessons.length})`);
      }
      
      // Generate certificate - this calls the RPC function in Supabase
      // The function uses auth.uid() internally, so we need to ensure the user is logged in
      const { data, error } = await supabase.rpc(
        'generate_certificate',
        { course_id: courseId }
      );
      
      if (error) {
        console.error('Error in generate_certificate RPC call:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  },
  
  findByUserId: async (userId: string) => {
    const response = await api.get(`/certificates/user/${userId}`);
    return response.data;
  }
};

// API services for authentication
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('authToken', response.data.access_token);
    return response.data;
  },
  
  register: async (fullName: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { full_name: fullName, email, password });
    localStorage.setItem('authToken', response.data.access_token);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

export default api;
