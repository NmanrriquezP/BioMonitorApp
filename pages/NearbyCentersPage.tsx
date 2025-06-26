
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSession } from '../hooks/useUserSession';
import { LeafletMap } from '../components/map/LeafletMap'; 
import { Button } from '../components/common/Button';
import { ArrowLeft, MapPin } from 'lucide-react';
import { COLORS } from '../constants';

const NearbyCentersPage: React.FC = () => {
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
    <div className="space-y-6 sm:space-y-8">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-0 sm:mb-2" leftIcon={<ArrowLeft size={18}/>}>
        Volver al Panel
      </Button>
      <div className="flex items-center mb-4 sm:mb-6">
        <MapPin size={32} className={`mr-3 sm:mr-4 ${COLORS.accent}`} />
        <h1 className={`text-3xl sm:text-4xl font-bold ${COLORS.textHeading}`}>Centros Médicos Cercanos</h1>
      </div>
      <p className={`${COLORS.textDefault} text-base sm:text-lg mb-4 sm:mb-6`}>
        Visualiza hospitales y clínicas en Bolivia. El mapa puede tardar unos segundos en cargar.
        Asegúrate de tener activados los servicios de localización en tu dispositivo y navegador si deseas ver tu ubicación y buscar cerca de ti.
      </p>
      <div className="bg-white p-1 sm:p-2 rounded-xl shadow-xl border border-gray-200">
        <LeafletMap />
      </div>
    </div>
  );
};

export default NearbyCentersPage;
