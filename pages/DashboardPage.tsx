
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSession } from '../hooks/useUserSession';
import { UserCard } from '../components/user/UserCard';
import { DashboardActionCard } from '../components/dashboard/ActionCards';
import { Activity, ListChecks, Edit3, ShieldCheck, MapPin } from 'lucide-react'; 
import { COLORS } from '../constants';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUserSession();

  useEffect(() => {
    if (!currentUser) {
      navigate('/'); 
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null; 
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <UserCard user={currentUser} detailed />
      
      <div className="p-6 sm:p-8 bg-white shadow-xl rounded-xl border border-gray-200">
        <h2 className={`text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center ${COLORS.textHeading}`}>¿Qué te gustaría hacer?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6"> {/* Adjusted grid for 4 items */}
          <DashboardActionCard
            title="Medir Signos Vitales"
            description="Realiza la toma de temperatura, pulso y ECG."
            icon={<Activity size={36} className="text-turquoise-medium" />}
            onClick={() => navigate('/measure')}
            buttonText="Comenzar Medición"
          />
          <DashboardActionCard
            title="Ver Historial Médico"
            description="Consulta tus registros de mediciones anteriores."
            icon={<ListChecks size={36} className="text-pink-semi-reddish" />}
            onClick={() => navigate('/history')}
            buttonText="Ver Historial"
            buttonVariant="secondary"
          />
           <DashboardActionCard
            title="Centros Médicos"
            description="Encuentra hospitales y clínicas en Bolivia."
            icon={<MapPin size={36} className="text-green-600" />}
            onClick={() => navigate('/medical-centers')}
            buttonText="Buscar Centros"
            buttonVariant='ghost' // Example using a different variant
          />
          <DashboardActionCard
            title="Editar Perfil"
            description="Actualiza tu información personal."
            icon={<Edit3 size={36} className="text-gray-600" />}
            onClick={() => navigate('/profile')}
            buttonText="Ir a Perfil"
            buttonVariant="ghost"
          />
        </div>
      </div>
      
      <div className={`p-4 sm:p-6 ${COLORS.backgroundPinkLight} rounded-xl shadow-md border border-pink-semi-reddish flex items-start space-x-3 sm:space-x-4`}>
        <ShieldCheck size={40} className="text-pink-semi-reddish mt-1 flex-shrink-0" />
        <div>
            <h3 className={`text-lg sm:text-xl font-semibold ${COLORS.textHeading}`}>Importante</h3>
            <p className={`${COLORS.textDefault} text-sm sm:text-base`}>
            BioMonitor es una herramienta de seguimiento personal. En caso de preocupación por tu salud, 
            consulta siempre a un profesional médico.
            </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
