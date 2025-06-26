
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSession } from '../hooks/useUserSession';
import { UserCard } from '../components/user/UserCard';
import { Button } from '../components/common/Button';
import { PlusCircle, Users, LogIn } from 'lucide-react';
import { APP_NAME, COLORS } from '../constants';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { users, selectUser, currentUser } = useUserSession();

  useEffect(() => {
    if (currentUser) {
      navigate('/welcome');
    }
  }, [currentUser, navigate]);

  if (currentUser) {
    return null; 
  }

  const handleSelectUser = (userId: string) => {
    selectUser(userId);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-8 sm:py-12">
      <div className="text-center mb-10 sm:mb-12">
        <h1 className={`text-4xl sm:text-5xl font-bold ${COLORS.textHeading} mb-3`}>Bienvenido a {APP_NAME}</h1>
        <p className={`${COLORS.textDefault} text-lg sm:text-xl max-w-2xl`}>
          Tu asistente personal para el monitoreo de signos vitales. Diseñado con cariño para ser fácil de usar.
        </p>
      </div>

      <div className="w-full max-w-md sm:max-w-xl bg-white p-6 sm:p-10 rounded-xl shadow-xl border border-gray-200 space-y-6 sm:space-y-8">
        <Button 
          onClick={() => navigate('/register')} 
          size="lg" 
          variant="primary" 
          leftIcon={<PlusCircle size={22}/>}
          className="w-full text-base sm:text-lg"
        >
          Crear Nuevo Usuario
        </Button>

        {users.length > 0 && (
          <div className="text-center">
             <div className="my-4 border-t border-gray-300"></div>
            <h2 className={`text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center justify-center ${COLORS.textHeading}`}>
              <LogIn size={24} className="mr-2 sm:mr-3 text-turquoise-medium" /> O Selecciona un Perfil Existente
            </h2>
            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto p-1 sm:p-2 -mr-1 sm:-mr-2 pr-1 sm:pr-2">
              {users.map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  onClick={() => handleSelectUser(user.id)}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-turquoise-medium text-left"
                />
              ))}
            </div>
          </div>
        )}
        
        {users.length === 0 && (
           <div className="text-center pt-3 sm:pt-4">
             <p className={`${COLORS.textDefault} text-base sm:text-lg`}>
               No hay usuarios registrados. Por favor, crea un perfil para empezar.
             </p>
           </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
