
import React from 'react';
import CourseGrid from './CourseGrid';

export type CourseGridWrapperProps = {
  courses: any[];
  isLoading: boolean;
  emptyMessage: string;
};

const CourseGridWrapper: React.FC<CourseGridWrapperProps> = ({ 
  courses, 
  isLoading, 
  emptyMessage 
}) => {
  return (
    <CourseGrid 
      courses={courses}
      loading={isLoading} 
      emptyMessage={emptyMessage}
    />
  );
};

export default CourseGridWrapper;
