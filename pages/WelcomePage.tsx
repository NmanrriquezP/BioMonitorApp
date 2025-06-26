
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSession } from '../hooks/useUserSession';
import { Button } from '../components/common/Button';
import { PlayCircle, UserCircle } from 'lucide-react'; // Importado UserCircle
import { APP_NAME, COLORS } from '../constants';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUserSession();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null; // Render nothing while redirecting
  }

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-16rem)] py-12"> {/* Adjusted min-h for header/footer */}
      <div className="bg-white p-10 sm:p-16 rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full">
        {/* Ícono de UserCircle añadido aquí */}
        <UserCircle size={80} className="mx-auto mb-6 text-turquoise-medium" />
        <h1 className={`text-4xl font-bold ${COLORS.textHeading} mb-4`}>
          ¡Hola, {currentUser.name}!
        </h1>
        <p className={`${COLORS.textDefault} text-xl mb-10`}>
          Estás listo para comenzar a monitorear tu bienestar con {APP_NAME}.
        </p>
        <Button 
          onClick={() => navigate('/dashboard')} 
          size="lg" 
          variant="primary" 
          leftIcon={<PlayCircle size={28}/>}
          className="w-full text-xl py-4"
        >
          Empezar
        </Button>
      </div>
    </div>
  );
};

export default WelcomePage;
