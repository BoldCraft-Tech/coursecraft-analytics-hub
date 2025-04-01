
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  onEnrollmentChange: (enrolled: boolean) => void;
}

const EnrollButton = ({ courseId, isEnrolled, onEnrollmentChange }: EnrollButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEnrollment = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to enroll in this course',
      });
      navigate('/signin');
      return;
    }

    setLoading(true);

    try {
      if (isEnrolled) {
        // Unenroll from course
        const { error } = await supabase
          .from('enrollments')
          .delete()
          .eq('user_id', user.id)
          .eq('course_id', courseId);
          
        if (error) throw error;

        toast({
          title: 'Unenrolled successfully',
          description: 'You have been unenrolled from this course',
        });
        
        onEnrollmentChange(false);
      } else {
        // Enroll in course
        const { error } = await supabase
          .from('enrollments')
          .insert({
            user_id: user.id,
            course_id: courseId,
            progress: 0,
            completed: false
          });
          
        if (error) throw error;

        toast({
          title: 'Enrolled successfully',
          description: 'You have been enrolled in this course',
        });
        
        onEnrollmentChange(true);
      }
    } catch (error: any) {
      console.error('Error handling enrollment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update enrollment status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleEnrollment} 
      variant={isEnrolled ? 'outline' : 'default'}
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isEnrolled ? (
        <CheckCircle className="h-4 w-4 mr-2" />
      ) : (
        <BookOpen className="h-4 w-4 mr-2" />
      )}
      {isEnrolled ? 'Unenroll' : 'Enroll Now'}
    </Button>
  );
};

export default EnrollButton;
