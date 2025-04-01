
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, BookOpen } from 'lucide-react';

interface CourseProgressProps {
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

const CourseProgress = ({ progress, totalLessons, completedLessons }: CourseProgressProps) => {
  return (
    <div className="p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Your Progress</span>
        <span className="text-sm font-semibold">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2 mb-4" />
      <div className="flex items-center text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4 mr-1" />
        <span>
          {completedLessons} of {totalLessons} lessons completed
        </span>
      </div>
      {progress === 100 && (
        <div className="mt-2 flex items-center text-sm text-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span>Course completed</span>
        </div>
      )}
    </div>
  );
};

export default CourseProgress;
