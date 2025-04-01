
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
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
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
