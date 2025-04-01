
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, BookOpen, Award, Clock } from 'lucide-react';

interface CourseProgressProps {
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

const CourseProgress = ({ progress, totalLessons, completedLessons }: CourseProgressProps) => {
  // Calculate estimated remaining time (assuming average of 30 min per lesson)
  const remainingLessons = totalLessons - completedLessons;
  const estimatedRemainingTime = remainingLessons * 30; // minutes
  const remainingHours = Math.floor(estimatedRemainingTime / 60);
  const remainingMinutes = estimatedRemainingTime % 60;
  
  // Format remaining time string
  let remainingTimeString = '';
  if (remainingHours > 0) {
    remainingTimeString += `${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
  }
  if (remainingMinutes > 0 || remainingHours === 0) {
    if (remainingHours > 0) remainingTimeString += ' ';
    remainingTimeString += `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }
  
  return (
    <div className="p-6 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-lg">Your Progress</span>
        <span className="text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
          {progress}%
        </span>
      </div>
      <Progress value={progress} className="h-2.5 mb-5" />
      
      <div className="grid gap-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4 mr-2" />
          <span>
            {completedLessons} of {totalLessons} lessons completed
          </span>
        </div>
        
        {remainingLessons > 0 && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              Estimated {remainingTimeString} remaining
            </span>
          </div>
        )}
        
        {progress === 100 ? (
          <div className="flex items-center text-sm text-green-600">
            <Award className="h-4 w-4 mr-2" />
            <span>Course completed! You can claim your certificate.</span>
          </div>
        ) : progress >= 50 ? (
          <div className="flex items-center text-sm text-amber-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>You're making great progress, keep going!</span>
          </div>
        ) : (
          <div className="flex items-center text-sm text-blue-600">
            <Circle className="h-4 w-4 mr-2" />
            <span>Just getting started. Continue learning!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseProgress;
