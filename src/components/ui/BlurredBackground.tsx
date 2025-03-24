
import React from 'react';

interface BlurredBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const BlurredBackground: React.FC<BlurredBackgroundProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-float"></div>
        <div className="absolute top-60 -right-20 w-80 h-80 bg-blue-500/20 rounded-full filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-indigo-500/20 rounded-full filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BlurredBackground;
