
import LessonList from '@/components/course-detail/LessonList';

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  order_index: number;
  completed?: boolean;
  videoUrl?: string;
  video_url?: string;
}

interface CourseCurriculumProps {
  courseId: string;
  lessons: Lesson[];
  isEnrolled: boolean;
  onLessonComplete: (lessonId: string, completed: boolean) => void;
  totalLessons: number;
  totalDuration: string;
}

const CourseCurriculum = ({
  courseId,
  lessons,
  isEnrolled,
  onLessonComplete,
  totalLessons,
  totalDuration
}: CourseCurriculumProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Course Curriculum</h2>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{totalLessons} lessons</span>
          <span>{totalDuration} total</span>
        </div>
      </div>
      
      {lessons && lessons.length > 0 ? (
        <LessonList 
          courseId={courseId}
          lessons={lessons} 
          isEnrolled={isEnrolled}
          onLessonComplete={onLessonComplete}
        />
      ) : (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No lessons available for this course yet</p>
        </div>
      )}
    </div>
  );
};

export default CourseCurriculum;
