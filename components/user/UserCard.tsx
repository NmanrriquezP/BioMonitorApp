
import React from 'react';
import { User } from '../../types';
import { UserCircle, Cake, Droplets, VenetianMask } from 'lucide-react';
import { COLORS } from '../../constants';

interface UserCardProps {
  user: User;
  onClick?: () => void;
  className?: string;
  detailed?: boolean;
}

const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

const calculateAge = (birthDateString: string): number => {
  const today = new Date();
  const birthDate = parseLocalDate(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const UserCard: React.FC<UserCardProps> = ({ user, onClick, className = '', detailed = false }) => {
  const age = calculateAge(user.birthDate);
  const displayBirthDate = parseLocalDate(user.birthDate).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div
      onClick={onClick}
      className={`p-4 ${detailed ? 'sm:p-6' : 'sm:p-5'} bg-white shadow-lg rounded-xl border border-gray-200 ${className} ${onClick ? 'cursor-pointer hover:shadow-xl transition-all' : ''}`}
    >
      <div className="flex items-center mb-3 sm:mb-4">
        <UserCircle size={detailed ? 48 : 40} className={`${COLORS.accent} mr-3 sm:mr-4 flex-shrink-0`} /> {/* Added flex-shrink-0 */}
        <div>
          <h3 className={`text-xl ${detailed ? 'sm:text-2xl md:text-3xl' : 'sm:text-xl'} font-semibold ${COLORS.textHeading} leading-tight`}>{user.name} {user.surname}</h3>
          {detailed && <p className={`${COLORS.textDefault} text-base sm:text-lg`}>Perfil del Usuario</p>}
        </div>
      </div>
      <div className={`grid ${detailed ? 'grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4' : 'grid-cols-2 gap-2 sm:gap-3'} text-sm sm:text-base`}>
        <div className="flex items-center">
          <Cake size={18} className={`${COLORS.accent} mr-2 flex-shrink-0`} /> 
          <span className={`${COLORS.textDefault} truncate`}>{age} años</span>
        </div>
        <div className="flex items-center">
          <VenetianMask size={18} className={`${COLORS.accent} mr-2 flex-shrink-0`} /> 
          <span className={`${COLORS.textDefault} truncate`}>{user.gender}</span>
        </div>
        {detailed && (
          <>
            <div className="flex items-center">
                <Droplets size={18} className={`${COLORS.accent} mr-2 flex-shrink-0`} /> 
                <span className={`${COLORS.textDefault} truncate`}>Sangre: {user.bloodType}</span>
            </div>
            <div className="flex items-center col-span-1 sm:col-span-2"> {/* Birthdate takes full width on small if detailed */}
                <span className={`${COLORS.accent} mr-2 font-semibold text-xs sm:text-sm`}>Nacimiento:</span>
                <span className={`${COLORS.textDefault} truncate text-xs sm:text-sm`}>{displayBirthDate}</span>
            </div>
          </>
        )}
         {!detailed && ( // For non-detailed UserCard (list on HomePage)
            <div className="flex items-center col-span-2">
                <Droplets size={18} className={`${COLORS.accent} mr-2 flex-shrink-0`} /> 
                <span className={`${COLORS.textDefault} truncate`}>Sangre: {user.bloodType}</span>
            </div>
         )}
      </div>
    </div>
  );
};
