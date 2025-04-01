
import React from 'react';
import { useNavigate } from 'react-router-dom';

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration?: string;
  lessons?: number;
  students?: number;
  image_url?: string;
};

interface CourseGridProps {
  courses: Course[];
  loading: boolean;
  emptyMessage: string;
}

const CourseGrid: React.FC<CourseGridProps> = ({ courses, loading, emptyMessage }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-gray-100 rounded-lg p-4 h-64 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div 
          key={course.id} 
          className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/courses/${course.id}`)}
        >
          <div className="aspect-video bg-gray-100 relative">
            {course.image_url ? (
              <img 
                src={course.image_url} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">{course.category || 'Course'}</span>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <span className="inline-block bg-white/90 px-2 py-1 rounded text-xs font-medium">
                {course.level}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold mb-1 line-clamp-1">{course.title}</h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {course.description}
            </p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{course.duration || 'Self-paced'}</span>
              <span>{course.lessons || 0} lessons</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseGrid;
