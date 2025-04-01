
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ChevronLeft, ChevronRight, Play, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  order_index: number;
  completed?: boolean;
}

const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [prevLesson, setPrevLesson] = useState<Lesson | null>(null);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!courseId || !lessonId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course data
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, title')
          .eq('id', courseId)
          .single();
          
        if (courseError) throw courseError;
        setCourse(courseData);
        
        // Fetch current lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();
          
        if (lessonError) throw lessonError;
        setLesson(lessonData);
        
        // Fetch all lessons for navigation
        const { data: allLessons, error: allLessonsError } = await supabase
          .from('lessons')
          .select('id, title, order_index')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });
          
        if (allLessonsError) throw allLessonsError;
        
        // Find current lesson index
        const currentIndex = allLessons.findIndex(l => l.id === lessonId);
        if (currentIndex > 0) {
          setPrevLesson(allLessons[currentIndex - 1]);
        } else {
          setPrevLesson(null);
        }
        
        if (currentIndex < allLessons.length - 1) {
          setNextLesson(allLessons[currentIndex + 1]);
        } else {
          setNextLesson(null);
        }
        
        // If user is authenticated, fetch completion status
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_lesson_progress')
            .select('completed')
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)
            .maybeSingle();
            
          if (progressError) throw progressError;
          
          setIsLessonCompleted(progressData?.completed || false);
          
          // Calculate course progress
          const { data: courseProgress, error: progressError2 } = await supabase
            .from('enrollments')
            .select('progress')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle();
            
          if (progressError2) throw progressError2;
          
          if (courseProgress) {
            setProgress(courseProgress.progress);
          }
          
          // Update last accessed timestamp (don't await to avoid blocking UI)
          supabase
            .from('user_lesson_progress')
            .upsert({
              user_id: user.id,
              lesson_id: lessonId,
              last_accessed: new Date().toISOString(),
              completed: progressData?.completed || false
            })
            .then(() => {
              // Update enrollment last_accessed
              return supabase
                .from('enrollments')
                .update({ last_accessed: new Date().toISOString() })
                .eq('user_id', user.id)
                .eq('course_id', courseId);
            })
            .catch(error => {
              console.error('Error updating last accessed:', error);
            });
        }
      } catch (error: any) {
        console.error('Error fetching lesson details:', error);
        toast({
          title: 'Error loading lesson',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId, user, toast]);

  const handleToggleCompletion = async () => {
    if (!user || !lessonId || !courseId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to track your progress',
      });
      return;
    }

    setLoadingProgress(true);

    try {
      const newStatus = !isLessonCompleted;
      
      // Update progress in database
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: newStatus,
          last_accessed: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Update local state
      setIsLessonCompleted(newStatus);
      
      // Get count of completed lessons for the course
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('lesson_id', supabase.from('lessons').select('id').eq('course_id', courseId));
        
      if (progressError) throw progressError;
      
      // Get total lessons count
      const { count: totalLessons, error: countError } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId);
        
      if (countError) throw countError;
      
      // Calculate new progress percentage
      const completedCount = progressData?.length || 0;
      const progressPercentage = Math.round((completedCount / (totalLessons || 1)) * 100);
      
      // Update enrollment progress
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({ 
          progress: progressPercentage,
          completed: progressPercentage === 100,
          last_accessed: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('course_id', courseId);
        
      if (updateError) throw updateError;
      
      // Update local progress state
      setProgress(progressPercentage);
      
      toast({
        title: newStatus ? 'Lesson completed' : 'Lesson marked as incomplete',
        description: newStatus ? 'Great job! Keep going!' : 'Progress updated',
      });
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update progress',
        variant: 'destructive',
      });
    } finally {
      setLoadingProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4 text-muted-foreground">Loading lesson...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Lesson not found</h2>
            <p className="text-muted-foreground mb-6">The lesson you're looking for doesn't exist or has been removed</p>
            <Button onClick={() => navigate(`/courses/${courseId}`)}>Back to Course</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="container px-4 mx-auto py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-auto" 
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to course
              </Button>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground truncate max-w-[200px]">{course?.title}</span>
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{lesson.duration} min</span>
              </div>
              <div className="flex items-center text-sm">
                <Play className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>Lesson {lesson.order_index}</span>
              </div>
            </div>
            
            {user && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Course progress</span>
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
          
          <div className="bg-card border rounded-lg p-6 mb-8">
            <div className="prose max-w-none">
              <div className="min-h-[300px]">
                {/* Here would be the actual lesson content, potentially video or interactive content */}
                <div className="p-8 bg-muted/30 rounded-lg flex items-center justify-center mb-6">
                  <Play className="h-12 w-12 text-primary" />
                </div>
                
                <h2 className="text-xl font-semibold mb-4">Lesson Content</h2>
                <div className="whitespace-pre-wrap">
                  {lesson.content}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div>
              {user && (
                <Button
                  onClick={handleToggleCompletion}
                  variant={isLessonCompleted ? "outline" : "default"}
                  disabled={loadingProgress}
                >
                  {loadingProgress ? (
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                  ) : isLessonCompleted ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {isLessonCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {prevLesson && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/courses/${courseId}/lessons/${prevLesson.id}`)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Lesson
                </Button>
              )}
              
              {nextLesson && (
                <Button
                  onClick={() => navigate(`/courses/${courseId}/lessons/${nextLesson.id}`)}
                >
                  Next Lesson
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LessonView;
