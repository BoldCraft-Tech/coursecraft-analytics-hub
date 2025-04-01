import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Circle, Clock, Play, Lock, Video, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { lessonProgressService } from '@/services/api';

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  order_index: number;
  completed?: boolean;
  video_url?: string;
  videoUrl?: string; // Support both formats for compatibility
}

interface LessonListProps {
  courseId: string;
  lessons: Lesson[];
  isEnrolled: boolean;
  onLessonComplete: (lessonId: string, completed: boolean) => void;
}

const LessonList = ({ courseId, lessons, isEnrolled, onLessonComplete }: LessonListProps) => {
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log('LessonList - Received lessons:', lessons);

  const sortedLessons = [...lessons].sort((a, b) => a.order_index - b.order_index);

  const handleToggleCompletion = async (lessonId: string, currentStatus: boolean) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to track your progress',
      });
      return;
    }

    setLoadingLessonId(lessonId);

    try {
      // Update lesson progress using API
      await lessonProgressService.updateProgress(lessonId, user.id, !currentStatus);

      // Update UI through callback
      onLessonComplete(lessonId, !currentStatus);
    } catch (error: any) {
      console.error('Error updating lesson progress:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update lesson progress',
        variant: 'destructive',
      });
    } finally {
      setLoadingLessonId(null);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    if (!isEnrolled) {
      toast({
        title: 'Enrollment required',
        description: 'Please enroll in this course to access lessons',
      });
      return;
    }

    navigate(`/courses/${courseId}/lessons/${lessonId}`);
  };

  const getLessonTypeIcon = (lesson: Lesson) => {
    // Check for both possible properties for video URL
    if (lesson.video_url || lesson.videoUrl) {
      return <Video className="h-3 w-3 ml-2 text-accent" />;
    }
    return <FileText className="h-3 w-3 ml-2 text-blue-500" />;
  };

  console.log('LessonList - Sorted lessons:', sortedLessons);
  console.log('LessonList - Number of lessons:', sortedLessons.length);

  // First check if there are actually lessons to display
  if (!sortedLessons || sortedLessons.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No lessons available for this course yet</p>
      </div>
    );
  }

  return (
    <Accordion 
      type="single" 
      collapsible 
      value={expandedLesson || undefined}
      onValueChange={(value) => setExpandedLesson(value)}
      className="w-full"
    >
      {sortedLessons.map((lesson) => (
        <AccordionItem key={lesson.id} value={lesson.id} className="border border-border rounded-lg mb-2 overflow-hidden hover:shadow-sm transition-shadow">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                {isEnrolled ? (
                  loadingLessonId === lesson.id ? (
                    <div className="h-4 w-4 mr-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : lesson.completed ? (
                    <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 mr-3 text-muted-foreground" />
                  )
                ) : (
                  <Lock className="h-4 w-4 mr-3 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{lesson.order_index}. {lesson.title}</span>
                {(lesson.video_url || lesson.videoUrl) && (
                  <Badge variant="outline" className="ml-2 bg-accent/10 text-accent-foreground border-accent/20 text-xs">
                    <Video className="h-3 w-3 mr-1" />
                    Video
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>{lesson.duration} min</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 bg-muted/5">
            <div className="mt-2 mb-4 pl-7 text-sm">
              {lesson.content}
            </div>
            {isEnrolled && (
              <div className="flex justify-end space-x-2 mt-4 pl-7">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleCompletion(lesson.id, !!lesson.completed)}
                  disabled={loadingLessonId === lesson.id}
                >
                  {lesson.completed ? 'Mark as incomplete' : 'Mark as complete'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStartLesson(lesson.id)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Play className="h-3 w-3 mr-1" />
                  {lesson.completed ? 'Review Lesson' : 'Start Lesson'}
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default LessonList;
