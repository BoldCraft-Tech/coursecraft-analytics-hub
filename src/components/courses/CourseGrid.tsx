
import CourseCard from './CourseCard';

export interface Course {
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

interface CourseGridProps {
  courses: Course[];
}

const CourseGrid = ({ courses }: CourseGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course) => (
        <CourseCard key={course.id} {...course} />
      ))}
    </div>
  );
};

export default CourseGrid;
