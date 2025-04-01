
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, GraduationCap, Users, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EnrollButton from '@/components/course-detail/EnrollButton';

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

interface CourseHeaderProps {
  course: Course;
  isEnrolled: boolean;
  certificateId: string | null;
  onEnrollmentChange: (enrolled: boolean) => void;
  generateCertificate: () => Promise<void>;
  loadingCertificate: boolean;
  enrollmentCompleted: boolean;
  isAdmin?: boolean;
}

const CourseHeader = ({
  course,
  isEnrolled,
  certificateId,
  onEnrollmentChange,
  generateCertificate,
  loadingCertificate,
  enrollmentCompleted,
  isAdmin = false
}: CourseHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-lg text-muted-foreground mb-6">{course.description}</p>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center">
          <GraduationCap className="h-5 w-5 mr-2 text-muted-foreground" />
          <span>{course.level}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
          <span>{course.duration}</span>
        </div>
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-muted-foreground" />
          <span>{course.lessons} lessons</span>
        </div>
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-muted-foreground" />
          <span>{course.students} students</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
          {course.category}
        </span>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-auto">
          <EnrollButton 
            courseId={course.id} 
            isEnrolled={isEnrolled}
            onEnrollmentChange={onEnrollmentChange} 
          />
        </div>
        
        {certificateId && (
          <Button 
            variant="outline"
            onClick={() => navigate(`/certificates?course=${course.id}`)}
            className="w-full sm:w-auto"
          >
            <Award className="h-4 w-4 mr-2" />
            View Certificate
          </Button>
        )}
        
        {isEnrolled && enrollmentCompleted && !certificateId && (
          <Button 
            variant="outline"
            onClick={() => generateCertificate()}
            disabled={loadingCertificate}
            className="w-full sm:w-auto"
          >
            {loadingCertificate ? (
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
            ) : (
              <Award className="h-4 w-4 mr-2" />
            )}
            Get Certificate
          </Button>
        )}
        
        {isAdmin && (
          <Button 
            variant="outline"
            onClick={() => navigate(`/admin/courses/${course.id}/lessons`)}
            className="w-full sm:w-auto"
          >
            Manage Lessons
          </Button>
        )}
      </div>
    </div>
  );
};

export default CourseHeader;
