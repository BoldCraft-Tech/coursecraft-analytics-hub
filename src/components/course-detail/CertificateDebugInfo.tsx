
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/components/ui/use-toast';

interface CertificateDebugInfoProps {
  userId: string;
  courseId: string;
}

const CertificateDebugInfo = ({ userId, courseId }: CertificateDebugInfoProps) => {
  const [totalLessons, setTotalLessons] = useState<any[]>([]);
  const [completedLessons, setCompletedLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completionStatus, setCompletionStatus] = useState<string>('checking...');
  const { toast } = useToast();

  useEffect(() => {
    const fetchLessonStatus = async () => {
      setIsLoading(true);
      try {
        // Get all lessons for this course
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, title')
          .eq('course_id', courseId);
          
        if (lessonsError) throw lessonsError;
        setTotalLessons(lessons || []);
        
        // Get completed lessons
        const { data: progress, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id, completed')
          .eq('user_id', userId)
          .eq('completed', true)
          .in('lesson_id', lessons.map(l => l.id));
          
        if (progressError) throw progressError;
        setCompletedLessons(progress || []);
        
        // Determine completion status
        if (lessons.length === 0) {
          setCompletionStatus('No lessons in course');
        } else if (progress.length === 0) {
          setCompletionStatus('No completed lessons');
        } else if (progress.length < lessons.length) {
          setCompletionStatus(`${progress.length}/${lessons.length} lessons completed`);
        } else {
          setCompletionStatus('All lessons completed');
        }
      } catch (error) {
        console.error('Error fetching lesson status:', error);
        setCompletionStatus('Error checking status');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLessonStatus();
  }, [userId, courseId]);
  
  const forceMarkAllComplete = async () => {
    try {
      // Mark all lessons as completed in the database
      for (const lesson of totalLessons) {
        await supabase
          .from('user_lesson_progress')
          .upsert({
            user_id: userId,
            lesson_id: lesson.id,
            completed: true,
            last_accessed: new Date().toISOString()
          }, { onConflict: 'user_id,lesson_id' });
      }
      
      // Update enrollment progress to 100%
      await supabase
        .from('enrollments')
        .update({ 
          progress: 100,
          completed: true,
          last_accessed: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);
      
      toast({
        title: 'All lessons marked as complete',
        description: 'You can now generate a certificate'
      });
      
      // Refresh the lesson status
      setCompletedLessons(totalLessons.map(lesson => ({ 
        lesson_id: lesson.id,
        completed: true
      })));
      setCompletionStatus('All lessons completed');
    } catch (error) {
      console.error('Error marking lessons as complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark lessons as complete',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return <div className="mt-6 text-center text-sm text-muted-foreground">Loading certificate data...</div>;
  }

  return (
    <Accordion type="single" collapsible className="w-full mt-6 border rounded-md">
      <AccordionItem value="debug-info">
        <AccordionTrigger className="px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Certificate Eligibility Debug</span>
            <Badge variant={
              completionStatus === 'All lessons completed' 
                ? 'accent' 
                : completionStatus === 'No lessons in course'
                ? 'outline'
                : 'secondary'
            }>
              {completionStatus}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pt-2 pb-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Course Lessons ({totalLessons.length})</h4>
              <ul className="text-sm space-y-1">
                {totalLessons.map(lesson => (
                  <li key={lesson.id} className="flex justify-between">
                    <span>{lesson.title}</span>
                    <Badge variant={
                      completedLessons.some(p => p.lesson_id === lesson.id) 
                        ? 'accent' 
                        : 'outline'
                    }>
                      {completedLessons.some(p => p.lesson_id === lesson.id) ? 'Completed' : 'Incomplete'}
                    </Badge>
                  </li>
                ))}
                {totalLessons.length === 0 && (
                  <li className="text-muted-foreground">No lessons found</li>
                )}
              </ul>
            </div>
            
            <div className="flex justify-end">
              <Button 
                size="sm" 
                variant="outline"
                onClick={forceMarkAllComplete}
                disabled={totalLessons.length === 0 || completionStatus === 'All lessons completed'}
              >
                Force Mark All Complete
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CertificateDebugInfo;
