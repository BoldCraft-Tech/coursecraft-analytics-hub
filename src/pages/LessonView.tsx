
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen,
  CheckCircle,
  Video,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { updateLessonProgress } from '@/utils/courseVideoUtils';
import VideoPlayer from '@/components/lessons/VideoPlayer';

interface Lesson {
  id: string;
  title: string;
  content: string;
  order_index: number;
  course_id: string;
  videoUrl?: string;
  video_url?: string;
}

const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [prevLesson, setPrevLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!courseId || !lessonId) return;

    const fetchLessonDetails = async () => {
      setLoading(true);
      try {
        // Fetch current lesson
        const { data: currentLesson, error: currentError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();
          
        if (currentError) throw currentError;
        
        setLesson(currentLesson);
        
        // Fetch all lessons for this course to determine next/prev
        const { data: allLessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });
          
        if (lessonsError) throw lessonsError;
        
        // Find current lesson index
        const currentIndex = allLessons.findIndex(l => l.id === lessonId);
        
        // Set previous and next lessons
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
        
        // Check if lesson is completed
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_lesson_progress')
            .select('completed')
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)
            .maybeSingle();
            
          if (!progressError && progressData) {
            setCompleted(progressData.completed);
          }
          
          // Update last accessed time for this lesson
          await supabase
            .from('user_lesson_progress')
            .upsert({
              user_id: user.id,
              lesson_id: lessonId,
              completed: progressData?.completed || false,
              last_accessed: new Date().toISOString()
            });
            
          // Update last accessed time for this course enrollment
          await supabase
            .from('enrollments')
            .update({ last_accessed: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('course_id', courseId);
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

    fetchLessonDetails();
  }, [courseId, lessonId, user, toast]);

  const handleMarkComplete = async () => {
    if (!user || !courseId || !lessonId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to track your progress',
      });
      return;
    }
    
    setIsMarkingComplete(true);
    
    try {
      await updateLessonProgress(user.id, courseId, lessonId, completed ? 0 : 100);
      
      setCompleted(!completed);
      
      toast({
        title: completed ? 'Lesson marked as incomplete' : 'Lesson completed',
        description: completed 
          ? 'You can revisit this lesson anytime' 
          : 'Great job! Keep going with your learning journey',
      });
    } catch (error: any) {
      console.error('Error updating lesson progress:', error);
      toast({
        title: 'Error updating progress',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const navigateToLesson = (lessonId: string) => {
    navigate(`/courses/${courseId}/lessons/${lessonId}`);
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

  // Determine if this lesson has a video
  const hasVideo = !!lesson.videoUrl || !!lesson.video_url;
  const videoUrl = lesson.videoUrl || lesson.video_url;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-8">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <Link to={`/courses/${courseId}`}>
                  <Button variant="ghost" className="gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Course
                  </Button>
                </Link>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  {hasVideo ? (
                    <Video className="h-5 w-5 text-primary" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-primary" />
                  )}
                  <h1 className="text-2xl font-bold">{lesson.title}</h1>
                </div>
                
                {/* Video Player */}
                {hasVideo && videoUrl && (
                  <div className="mb-8">
                    <VideoPlayer 
                      videoUrl={videoUrl} 
                      lessonId={lesson.id} 
                      courseId={courseId || ''} 
                    />
                  </div>
                )}
                
                {/* Lesson content */}
                <div className="glass-panel p-6 rounded-xl mb-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{lesson.content}</p>
                  </div>
                </div>
                
                {/* Lesson navigation and actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center space-x-4">
                    {prevLesson && (
                      <Button 
                        variant="outline" 
                        onClick={() => navigateToLesson(prevLesson.id)}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Previous Lesson
                      </Button>
                    )}
                    
                    {nextLesson && (
                      <Button 
                        onClick={() => navigateToLesson(nextLesson.id)}
                      >
                        Next Lesson
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <Button
                    variant={completed ? "outline" : "default"}
                    onClick={handleMarkComplete}
                    disabled={isMarkingComplete}
                    className={completed ? "text-green-500 border-green-500" : ""}
                  >
                    {isMarkingComplete ? (
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                    ) : completed ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : null}
                    {completed ? "Completed" : "Mark as Complete"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LessonView;
