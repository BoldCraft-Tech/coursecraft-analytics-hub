
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
        // Get the enrollment ID first before trying to delete
        const { data: enrollmentData, error: fetchError } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle();
          
        if (fetchError) throw fetchError;
        
        if (!enrollmentData) {
          toast({
            title: 'Error',
            description: 'Could not find your enrollment record',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        
        // Unenroll from course using the enrollment ID
        const { error } = await supabase
          .from('enrollments')
          .delete()
          .eq('id', enrollmentData.id);
          
        if (error) throw error;
          
        toast({
          title: 'Unenrolled successfully',
          description: 'You have been unenrolled from this course',
        });
        
        onEnrollmentChange(false);
      } else {
        // Check if enrollment already exists first
        const { data: existingEnrollment, error: checkError } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        // If already enrolled, update the UI state but don't try to insert again
        if (existingEnrollment) {
          toast({
            title: 'Already enrolled',
            description: 'You are already enrolled in this course',
          });
          onEnrollmentChange(true);
          setLoading(false);
          return;
        }
          
        // Enroll in course using Supabase - set initial progress to 0
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
