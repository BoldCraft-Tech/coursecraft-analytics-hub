
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  lessons: number;
  progress?: number;
  completed?: boolean;
}

const CourseCard = ({ id, title, description, category, level, duration, lessons, progress = 0, completed = false }: CourseCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-1">{title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {description}
            </CardDescription>
          </div>
          {completed && (
            <Award className="h-5 w-5 text-amber-500 flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">{category}</span>
          <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-full">{level}</span>
        </div>
        
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            <span>{lessons} lessons</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{duration}</span>
          </div>
        </div>

        {progress > 0 && (
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span>Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => navigate(`/courses/${id}`)}
          className="w-full"
        >
          {progress > 0 ? 'Continue Learning' : 'Start Learning'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
