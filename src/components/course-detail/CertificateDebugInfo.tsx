
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CertificateDebugInfoProps {
  userId: string;
  courseId: string;
}

const CertificateDebugInfo = ({ userId, courseId }: CertificateDebugInfoProps) => {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    totalLessons: number;
    completedLessons: number;
    lessonIds: string[];
    completedLessonIds: string[];
    missingLessonIds: string[];
  } | null>(null);
  const { toast } = useToast();

  const checkCompletionStatus = async () => {
    if (!userId || !courseId) return;
    
    setLoading(true);
    
    try {
      // Get lesson IDs for this course
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('course_id', courseId);
        
      if (lessonError) throw lessonError;
      
      const lessonIds = lessonData.map(lesson => lesson.id);
      
      // Get completed lessons for this user
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('completed', true)
        .in('lesson_id', lessonIds);
        
      if (progressError) throw progressError;
      
      const completedLessonIds = progressData.map(progress => progress.lesson_id);
      
      // Find missing lessons
      const missingLessonIds = lessonIds.filter(id => !completedLessonIds.includes(id));
      
      setDebugInfo({
        totalLessons: lessonIds.length,
        completedLessons: completedLessonIds.length,
        lessonIds,
        completedLessonIds,
        missingLessonIds
      });
      
      // Show toast with basic info
      toast({
        title: 'Completion Status',
        description: `Completed ${completedLessonIds.length} out of ${lessonIds.length} lessons.`,
      });
    } catch (error: any) {
      console.error('Error checking completion status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not check completion status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // This component is only included during development or for administrators
  return (
    <div className="mt-4 p-4 bg-muted/20 rounded-lg text-sm">
      <h4 className="font-medium mb-2">Certificate Debug Info</h4>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={checkCompletionStatus}
        disabled={loading}
        className="mb-2"
      >
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Check Completion Status
      </Button>
      
      {debugInfo && (
        <div className="space-y-1 mt-2">
          <p>Total lessons: {debugInfo.totalLessons}</p>
          <p>Completed lessons: {debugInfo.completedLessons}</p>
          {debugInfo.missingLessonIds.length > 0 && (
            <div>
              <p className="text-red-500">Missing {debugInfo.missingLessonIds.length} lessons:</p>
              <ul className="list-disc pl-5">
                {debugInfo.missingLessonIds.map(id => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateDebugInfo;
