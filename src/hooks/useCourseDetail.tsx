import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { fetchLessonsWithVideos } from '@/utils/courseVideoUtils';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  students: number;
  lessons: number;
  image?: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  order_index: number;
  completed?: boolean;
  videoUrl?: string;
}

interface Enrollment {
  id: string;
  progress: number;
  completed: boolean;
}

const useCourseDetail = (courseId: string | undefined) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingCertificate, setLoadingCertificate] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        console.log('Fetching course details for ID:', courseId);
        
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
          
        if (courseError) throw courseError;
        
        console.log('Course data retrieved:', courseData);
        setCourse(courseData);
        
        const lessonsData = await fetchLessonsWithVideos(courseId);
        
        console.log('Lessons with videos retrieved:', lessonsData);
        console.log('Number of lessons found:', lessonsData?.length || 0);
        
        if (user) {
          const { data: enrollmentData, error: enrollmentError } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle();
            
          if (enrollmentError) throw enrollmentError;
          
          setEnrollment(enrollmentData);
          
          const { data: progressData, error: progressError } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id);
            
          if (progressError) throw progressError;
          
          const completionMap = progressData.reduce((map: Record<string, boolean>, item) => {
            map[item.lesson_id] = item.completed;
            return map;
          }, {});
          
          const lessonsWithProgress = lessonsData.map(lesson => ({
            ...lesson,
            completed: completionMap[lesson.id] || false
          }));
          
          setLessons(lessonsWithProgress);
          
          const completed = progressData.filter(p => p.completed).length;
          setCompletedLessons(completed);
          
          const { data: certificateData, error: certificateError } = await supabase
            .from('certificates')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle();
            
          if (certificateError) throw certificateError;
          
          if (certificateData) {
            setCertificateId(certificateData.id);
          }
        } else {
          setLessons(lessonsData);
        }
      } catch (error: any) {
        console.error('Error fetching course details:', error);
        toast({
          title: 'Error loading course',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, user, toast]);

  const handleEnrollmentChange = async (enrolled: boolean) => {
    if (enrolled && !enrollment) {
      try {
        if (user && courseId) {
          console.log('Creating new enrollment for user:', user.id, 'course:', courseId);
          
          const { data, error } = await supabase
            .from('enrollments')
            .insert({
              user_id: user.id,
              course_id: courseId,
              progress: 0,
              completed: false
            })
            .select();
            
          if (error) throw error;
          
          if (data && data[0]) {
            setEnrollment({
              id: data[0].id,
              progress: 0,
              completed: false
            });
            
            toast({
              title: 'Successfully enrolled',
              description: 'You are now enrolled in this course',
            });
          }
        }
      } catch (error: any) {
        console.error('Error enrolling in course:', error);
        toast({
          title: 'Enrollment failed',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      }
    } else if (!enrolled && enrollment) {
      try {
        if (user && courseId) {
          console.log('Deleting enrollment for user:', user.id, 'course:', courseId);
          
          const { data: enrollmentData, error: findError } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .single();
            
          if (findError) throw findError;
          
          const { error: deleteError } = await supabase
            .from('enrollments')
            .delete()
            .eq('id', enrollmentData.id);
            
          if (deleteError) throw deleteError;
          
          setEnrollment(null);
          setCompletedLessons(0);
          
          setLessons(prev => prev.map(lesson => ({
            ...lesson,
            completed: false
          })));
          
          toast({
            title: 'Unenrolled successfully',
            description: 'You have been unenrolled from this course',
          });
        }
      } catch (error: any) {
        console.error('Error unenrolling from course:', error);
        toast({
          title: 'Unenrollment failed',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      }
    }
  };

  const handleLessonComplete = async (lessonId: string, completed: boolean) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === lessonId 
        ? { ...lesson, completed } 
        : lesson
    ));
    
    const newCompletedCount = completed 
      ? completedLessons + 1 
      : Math.max(0, completedLessons - 1);
    
    setCompletedLessons(newCompletedCount);
    
    if (lessons.length > 0) {
      const progressPercentage = Math.round((newCompletedCount / lessons.length) * 100);
      
      if (enrollment) {
        setEnrollment(prev => prev ? {
          ...prev,
          progress: progressPercentage,
          completed: progressPercentage === 100
        } : null);
        
        if (!user || !courseId) return;
        
        try {
          await supabase
            .from('enrollments')
            .update({ 
              progress: progressPercentage,
              completed: progressPercentage === 100,
              last_accessed: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('course_id', courseId);
            
          if (progressPercentage === 100 && !certificateId) {
            await generateCertificate();
          }
        } catch (error) {
          console.error("Failed to update enrollment:", error);
        }
      }
    }
  };

  const generateCertificate = async () => {
    if (!user || !courseId) return;
    
    setLoadingCertificate(true);
    
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId);
        
      if (lessonError) throw lessonError;
      
      const lessonIds = lessonData.map(lesson => lesson.id);
      
      if (lessonIds.length === 0) {
        toast({
          title: 'Cannot generate certificate',
          description: 'This course has no lessons yet.',
          variant: 'destructive',
        });
        setLoadingCertificate(false);
        return;
      }
      
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('lesson_id', lessonIds);
        
      if (progressError) throw progressError;
      
      const completedLessonIds = progressData.map(progress => progress.lesson_id);
      
      console.log('Certificate generation check:', {
        lessonIds,
        completedLessonIds,
        allLessonsExist: lessonIds.length > 0,
        allCompleted: lessonIds.every(id => completedLessonIds.includes(id))
      });
      
      const incompleteCount = lessonIds.length - completedLessonIds.length;
      if (incompleteCount > 0) {
        toast({
          title: 'Cannot generate certificate',
          description: `Please complete all lessons first. You still have ${incompleteCount} lessons to complete.`,
          variant: 'destructive',
        });
        setLoadingCertificate(false);
        return;
      }
      
      for (const lessonId of lessonIds) {
        await supabase
          .from('user_lesson_progress')
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            last_accessed: new Date().toISOString()
          }, { onConflict: 'user_id,lesson_id' });
      }
      
      await supabase
        .from('enrollments')
        .update({ 
          progress: 100,
          completed: true,
          last_accessed: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('course_id', courseId);
      
      const { data, error } = await supabase.rpc(
        'generate_certificate',
        { course_id: courseId }
      );
      
      if (error) throw error;
      
      if (data) {
        setCertificateId(data);
        toast({
          title: 'Certificate generated!',
          description: 'Congratulations on completing this course',
        });
      } else {
        toast({
          title: 'Error generating certificate',
          description: 'Please try again later',
        });
      }
    } catch (error: any) {
      console.error('Error generating certificate:', error);
      toast({
        title: 'Error generating certificate',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoadingCertificate(false);
    }
  };

  const getProgressPercentage = (): number => {
    if (!lessons.length) return 0;
    return Math.round((completedLessons / lessons.length) * 100);
  };

  return {
    course,
    lessons,
    enrollment,
    completedLessons,
    loading,
    loadingCertificate,
    certificateId,
    handleEnrollmentChange,
    handleLessonComplete,
    generateCertificate,
    getProgressPercentage
  };
};

export default useCourseDetail;
