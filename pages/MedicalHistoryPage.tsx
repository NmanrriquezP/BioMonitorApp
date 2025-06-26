
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSession } from '../hooks/useUserSession';
import { useVitalSimulation } from '../hooks/useVitalSimulation';
import { VitalSignsRecord, User } from '../types';
import { Button } from '../components/common/Button';
import { PdfExportButton } from '../components/pdf/PdfExportButton';
import { MedicalReport } from '../components/pdf/MedicalReport'; 
import { ArrowLeft, ListChecks, FileText, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { COLORS } from '../constants';

const HistoryListItem: React.FC<{ record: VitalSignsRecord; user: User }> = ({ record, user }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = new Date(record.date);

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
      <div 
        className="flex justify-between items-center p-3 sm:p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`record-details-${record.id}`}
      >
        <div className="flex-grow overflow-hidden mr-2"> {/* Added for text truncation if needed */}
          <p className={`text-base sm:text-lg md:text-xl font-semibold ${COLORS.textHeading} truncate`}>
            {date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="text-xs sm:text-sm text-gray-500 flex items-center mt-0.5 sm:mt-1">
            <span>{date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="ml-2 inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle size={10} className="mr-1" /> Normal
            </span>
          </div>
        </div>
        <div className="flex-shrink-0"> {/* Prevent chevron from shrinking */}
            {isExpanded ? <ChevronUp size={20} className={COLORS.accent}/> : <ChevronDown size={20} className={COLORS.accent}/>}
        </div>
      </div>
      {isExpanded && (
        <div id={`record-details-${record.id}`} className="p-3 sm:p-4 md:p-6 border-t border-gray-200 bg-gray-50">
          <MedicalReport user={user} record={record} />
          <div className="mt-4 sm:mt-6 flex justify-end">
            <PdfExportButton user={user} record={record} buttonText="Exportar Registro a PDF" />
          </div>
        </div>
      )}
    </div>
  );
};


const MedicalHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUserSession();
  const { getRecords } = useVitalSimulation(currentUser); 
  const records = getRecords(); 

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null; 
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4 sm:mb-6" leftIcon={<ArrowLeft size={18}/>}>
        Volver al Panel
      </Button>
      <div className="flex items-center mb-6 sm:mb-8">
        <ListChecks size={32} className={`mr-3 sm:mr-4 ${COLORS.accent}`} />
        <h1 className={`text-3xl sm:text-4xl font-bold ${COLORS.textHeading}`}>Historial Médico</h1>
      </div>
      <p className={`${COLORS.textDefault} text-base sm:text-lg mb-6 sm:mb-8`}>
        Aquí puedes ver todos tus registros de mediciones de signos vitales. Haz clic en un registro para ver detalles y exportarlo.
      </p>

      {records.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {records.map(record => (
            <HistoryListItem key={record.id} record={record} user={currentUser} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 sm:py-12 px-4 sm:px-6 bg-white shadow-xl rounded-xl border border-gray-200">
          <FileText size={56} className="mx-auto text-gray-400 mb-5 sm:mb-6" />
          <h2 className={`text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 ${COLORS.textHeading}`}>No Hay Registros Aún</h2>
          <p className={`${COLORS.textDefault} text-base sm:text-lg mb-5 sm:mb-6`}>
            No se han guardado mediciones para tu perfil.
          </p>
          <Button onClick={() => navigate('/measure')} size="lg">
            Comenzar una Medición
          </Button>
        </div>
      )}
    </div>
  );
};

export default MedicalHistoryPage;
