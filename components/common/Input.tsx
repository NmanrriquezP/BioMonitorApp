
import React from 'react';
import { COLORS } from '../../constants';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, error, className, ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className={`block text-sm font-medium mb-1 ${COLORS.textDefault}`}>
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-4 py-2.5 text-base ${COLORS.textDefault} bg-white border ${COLORS.borderDefault} rounded-lg shadow-sm focus:ring-2 focus:ring-turquoise-medium focus:border-turquoise-medium transition-colors duration-150 ease-in-out ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
    