
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Circle, Clock, Play, Lock } from 'lucide-react';
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
      if (currentStatus) {
        // Mark as incomplete
        const { error } = await supabase
          .from('user_lesson_progress')
          .update({ completed: false, last_accessed: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);
          
        if (error) throw error;
      } else {
        // Mark as complete (upsert in case the record doesn't exist yet)
        const { error } = await supabase
          .from('user_lesson_progress')
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            last_accessed: new Date().toISOString()
          });
          
        if (error) throw error;
      }

      // Update enrollment last_accessed
      await supabase
        .from('enrollments')
        .update({ last_accessed: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('course_id', courseId);

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

  return (
    <Accordion 
      type="single" 
      collapsible 
      value={expandedLesson || undefined}
      onValueChange={(value) => setExpandedLesson(value)}
      className="w-full"
    >
      {sortedLessons.map((lesson) => (
        <AccordionItem key={lesson.id} value={lesson.id} className="border border-border rounded-lg mb-2">
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
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>{lesson.duration} min</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
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
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default LessonList;
