
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Users, BookOpen } from 'lucide-react';

interface CourseCardProps {
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

const CourseCard = ({
  id,
  title,
  description,
  category,
  level,
  duration,
  students,
  lessons,
  image
}: CourseCardProps) => {
  return (
    <div className="glass-card rounded-xl overflow-hidden hover-lift transition-all">
      {/* Course Image */}
      <div className="aspect-video relative overflow-hidden bg-secondary">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-primary/40" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium rounded-full">
            {category}
          </span>
        </div>
        
        {/* Level Badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {level}
          </span>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="p-6">
        <h3 className="text-xl font-medium mb-2 line-clamp-2">{title}</h3>
        <p className="text-muted-foreground mb-4 text-sm line-clamp-3">{description}</p>
        
        {/* Course Meta */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-1.5 h-4 w-4" />
            {duration}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="mr-1.5 h-4 w-4" />
            {students.toLocaleString()} students
          </div>
          <div className="flex items-center text-muted-foreground">
            <BookOpen className="mr-1.5 h-4 w-4" />
            {lessons} lessons
          </div>
        </div>
        
        {/* Action */}
        <Link to={`/courses/${id}`}>
          <Button className="w-full button-animation">
            View Course
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
