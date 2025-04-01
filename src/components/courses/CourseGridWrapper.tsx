
import React from 'react';
import CourseGrid from './CourseGrid';

export type CourseGridWrapperProps = {
  courses: any[];
  isLoading: boolean;
  emptyMessage: string;
  title?: string;
  description?: string;
};

const CourseGridWrapper: React.FC<CourseGridWrapperProps> = ({ 
  courses, 
  isLoading, 
  emptyMessage,
  title,
  description
}) => {
  return (
    <div>
      {title && <h2 className="text-xl font-semibold mb-2">{title}</h2>}
      {description && <p className="text-muted-foreground mb-4">{description}</p>}
      
      <CourseGrid 
        courses={courses}
        loading={isLoading} 
        emptyMessage={emptyMessage}
      />
    </div>
  );
};

export default CourseGridWrapper;
