
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  let spinnerSize = 'h-8 w-8';
  if (size === 'sm') spinnerSize = 'h-5 w-5';
  if (size === 'lg') spinnerSize = 'h-12 w-12';

  return (
    <div className="flex flex-col items-center justify-center space-y-2 p-4">
      <div 
        className={`animate-spin rounded-full ${spinnerSize} border-t-4 border-b-4 border-turquoise-medium`}
      ></div>
      {text && <p className="text-turquoise-dark text-sm">{text}</p>}
    </div>
  );
};
    