
// If this is a read-only file, we should create a fixed version
// Create a wrapper component that adapts props:

import React from 'react';
import { useNavigate } from 'react-router-dom';

// Original CourseGrid might have a 'loading' prop, but we're using 'isLoading'
// We create a wrapper that maps props correctly
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
  // Import the original CourseGrid and pass props with the correct names
  // If CourseGrid is expecting 'loading', pass isLoading as loading
  return (
    <CourseGrid 
      courses={courses}
      loading={isLoading} 
      emptyMessage={emptyMessage}
    />
  );
};

export default CourseGridWrapper;
