
import React from 'react';
import { Button } from '../common/Button';
import { COLORS } from '../../constants';

interface DashboardActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  buttonText: string;
  buttonVariant?: 'primary' | 'secondary' | 'ghost';
}

export const DashboardActionCard: React.FC<DashboardActionCardProps> = ({ title, description, icon, onClick, buttonText, buttonVariant = 'primary' }) => (
  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center h-full">
    <div className="mb-4">{icon}</div>
    <h3 className={`text-xl font-semibold mb-2 ${COLORS.textHeading}`}>{title}</h3>
    <p className={`${COLORS.textDefault} text-sm mb-6 flex-grow`}>{description}</p>
    <Button onClick={onClick} variant={buttonVariant} size="md" className="w-full">
      {buttonText}
    </Button>
  </div>
);
