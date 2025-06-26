
import React from 'react';
import { COLORS } from '../../constants';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, id, error, options, className, ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className={`block text-sm font-medium mb-1 ${COLORS.textDefault}`}>
        {label}
      </label>
      <select
        id={id}
        className={`w-full px-4 py-2.5 text-base ${COLORS.textDefault} bg-white border ${COLORS.borderDefault} rounded-lg shadow-sm focus:ring-2 focus:ring-turquoise-medium focus:border-turquoise-medium transition-colors duration-150 ease-in-out ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      >
        <option value="" disabled>Selecciona una opción</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
    