import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

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
      const { data } = await axios.post(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-recommendations`,
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
    const response = await api.patch(`/lessons/${lessonId}/progress`, { 
      userId, 
      completed 
    });
    return response.data;
  },
  
  getLessonProgress: async (userId: string, courseId: string) => {
    const response = await api.get(`/lessons/progress/${userId}/course/${courseId}`);
    return response.data;
  }
};

// API services for certificates
export const certificateService = {
  generate: async (userId: string, courseId: string) => {
    const response = await api.post('/certificates/generate', { userId, courseId });
    return response.data;
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
