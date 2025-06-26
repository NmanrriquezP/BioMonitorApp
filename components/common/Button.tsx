
import React from 'react';
import { COLORS } from '../../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyle = "font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-150 ease-in-out flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantStyle = '';
  switch (variant) {
    case 'primary':
      variantStyle = `${COLORS.primary} ${COLORS.primaryText} hover:bg-turquoise-dark focus:ring-turquoise-medium`;
      break;
    case 'secondary':
      variantStyle = `${COLORS.secondary} ${COLORS.secondaryText} hover:bg-pink-600 focus:ring-pink-semi-reddish`;
      break;
    case 'danger':
      variantStyle = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      break;
    case 'ghost':
      variantStyle = `bg-transparent text-turquoise-dark hover:bg-turquoise-light focus:ring-turquoise-medium border border-turquoise-medium`;
      break;
  }

  let sizeStyle = '';
  switch (size) {
    case 'sm':
      sizeStyle = 'px-3 py-1.5 text-sm';
      break;
    case 'md':
      sizeStyle = 'px-5 py-2.5 text-base';
      break;
    case 'lg':
      sizeStyle = 'px-7 py-3 text-lg';
      break;
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  );
};
    