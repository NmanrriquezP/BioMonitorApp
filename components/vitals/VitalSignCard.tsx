
import React from 'react';
import { Thermometer, HeartPulse, Activity, CheckCircle2 } from 'lucide-react';
import { COLORS } from '../../constants';

interface VitalSignCardProps {
  label: string;
  value?: string | number;
  unit?: string;
  status?: 'normal' | 'pending';
  iconType: 'temperature' | 'heartRate' | 'ecg' | 'generic';
  children?: React.ReactNode; 
}

const iconMap = {
  temperature: Thermometer,
  heartRate: HeartPulse,
  ecg: Activity,
  generic: Activity,
};

export const VitalSignCard: React.FC<VitalSignCardProps> = ({
  label,
  value,
  unit,
  status = 'pending',
  iconType,
  children
}) => {
  const IconComponent = iconMap[iconType];
  
  let statusColor = COLORS.textDefault;
  let StatusIcon = null;

  if (status === 'normal') {
    statusColor = 'text-green-600'; 
    StatusIcon = <CheckCircle2 size={18} className="mr-1" />;
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between min-h-[180px] sm:min-h-[200px]">
      <div>
        <div className="flex items-center mb-2 sm:mb-3">
          <IconComponent size={24} className={`mr-2 sm:mr-3 ${COLORS.accent}`} />
          <h3 className={`text-lg sm:text-xl font-semibold ${COLORS.textHeading}`}>{label}</h3>
        </div>
        {value !== undefined ? (
          <div className="text-center my-3 sm:my-4">
            <p className={`text-4xl sm:text-5xl font-bold ${statusColor}`}>
              {value}
              {unit && <span className="text-xl sm:text-2xl ml-1">{unit}</span>}
            </p>
            {status === 'normal' && (
              <p className={`text-xs sm:text-sm font-medium flex items-center justify-center mt-1 ${statusColor}`}>
                {StatusIcon}
                Normal
              </p>
            )}
          </div>
        ) : children ? null : (
          <p className={`${COLORS.textDefault} text-base sm:text-lg text-center my-6 sm:my-8`}>No medido aún.</p>
        )}
        {children && <div className="my-3 sm:my-4 w-full">{children}</div>} {/* Added w-full here */}
      </div>
    </div>
  );
};
