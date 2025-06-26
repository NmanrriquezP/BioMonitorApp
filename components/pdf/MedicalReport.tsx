
import React from 'react';
import { User, VitalSignsRecord } from '../../types';
import { APP_NAME, COLORS } from '../../constants';
import { ECGChart } from '../vitals/ECGChart'; 
import { Thermometer, HeartPulse, Activity, UserCircle, CalendarDays, CheckCircle } from 'lucide-react';

interface MedicalReportProps {
  user: User;
  record: VitalSignsRecord;
  idForPdf?: string; 
}

const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); 
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

export const MedicalReport: React.FC<MedicalReportProps> = ({ user, record, idForPdf }) => {
  const age = calculateAge(user.birthDate);
  const displayUserBirthDate = parseLocalDate(user.birthDate).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const recordDate = new Date(record.date); 

  // Base font size for PDF rendering can be smaller
  const baseFontSizeClass = idForPdf ? "text-xs" : "text-sm";
  const headingFontSizeClass = idForPdf ? "text-lg" : "text-xl";
  const subHeadingFontSizeClass = idForPdf ? "text-base" : "text-lg";
  const iconSize = idForPdf ? 16 : 20;
  const sectionIconSize = idForPdf ? 20 : 24;


  const ReportItem: React.FC<{icon: React.ReactNode, label: string, value?: string | number, unit?: string }> = 
    ({icon, label, value, unit}) => (
    <div className={`flex items-start p-2 sm:p-3 rounded-md bg-gray-50 ${baseFontSizeClass}`}>
        <div className={`mr-2 sm:mr-3 mt-0.5 ${COLORS.accent}`}>{icon}</div>
        <div>
            <p className={`font-medium text-gray-600`}>{label}</p>
            {value !== undefined ? (
                <p className={`${subHeadingFontSizeClass} font-semibold ${COLORS.textHeading}`}>
                    {value} {unit}
                </p>
            ) : <p className="text-gray-500 italic">No medido</p>}
        </div>
    </div>
  );
  
  const ecgChartHeight = idForPdf ? 240 : 150; // Keep PDF chart larger, on-screen smaller

  return (
    <div id={idForPdf} className={`p-3 sm:p-4 md:p-6 bg-white font-sans ${baseFontSizeClass} text-gray-700 printable-report`}>
      <div className="text-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-turquoise-medium">
        <h1 className={`text-2xl sm:${idForPdf ? 'text-2xl' : 'text-3xl'} font-bold text-turquoise-dark`}>{APP_NAME} - Ficha Médica</h1>
        <p className="text-gray-500">Informe de Signos Vitales</p>
      </div>

      <div className={`mb-4 sm:mb-6 p-3 sm:p-4 ${idForPdf ? 'bg-gray-100' : COLORS.backgroundLight} rounded-lg shadow-sm`}>
        <h2 className={`${headingFontSizeClass} font-semibold text-turquoise-dark mb-2 sm:mb-3 flex items-center`}>
            <UserCircle size={sectionIconSize} className="mr-2"/> Información del Paciente
        </h2>
        <div className={`grid grid-cols-1 ${idForPdf ? 'sm:grid-cols-2' : 'md:grid-cols-2'} gap-x-3 sm:gap-x-4 gap-y-1 sm:gap-y-2`}>
          <p><strong>Nombre:</strong> {user.name} {user.surname}</p>
          <p><strong>Edad:</strong> {age} años</p>
          <p><strong>F. Nacimiento:</strong> {displayUserBirthDate}</p>
          <p><strong>Género:</strong> {user.gender}</p>
          <p><strong>Grupo Sanguíneo:</strong> {user.bloodType}</p>
          {idForPdf && <p><strong>ID Usuario:</strong> {user.id}</p> }
        </div>
      </div>

      <div className={`mb-4 sm:mb-6 p-3 sm:p-4 ${idForPdf ? 'bg-gray-100' : COLORS.backgroundPinkLight} rounded-lg shadow-sm`}>
        <h2 className={`${headingFontSizeClass} font-semibold ${idForPdf ? 'text-pink-700' : 'text-pink-700'} mb-2 sm:mb-3 flex items-center`}>
            <CalendarDays size={sectionIconSize} className="mr-2"/> Detalles de la Medición
        </h2>
        <div className={`grid grid-cols-1 ${idForPdf ? 'sm:grid-cols-2' : 'md:grid-cols-2'} gap-x-3 sm:gap-x-4 gap-y-1 sm:gap-y-2`}>
            <p><strong>Fecha y Hora:</strong> {recordDate.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            {idForPdf && <p><strong>ID Registro:</strong> {record.id}</p>}
        </div>
      </div>
      
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        <h2 className={`${headingFontSizeClass} font-semibold ${COLORS.textHeading} mb-2 sm:mb-3`}>Signos Vitales Registrados</h2>
        <ReportItem 
            icon={<Thermometer size={iconSize}/>} 
            label="Temperatura Corporal" 
            value={record.temperature?.toFixed(1)} 
            unit="°C"
        />
        <ReportItem 
            icon={<HeartPulse size={iconSize}/>} 
            label="Pulso Cardíaco" 
            value={record.heartRate} 
            unit="lpm"
        />
        <div>
            <div className={`flex items-start p-2 sm:p-3 rounded-md bg-gray-50 ${baseFontSizeClass}`}>
                 <div className={`${COLORS.accent} mr-2 sm:mr-3 mt-0.5`}><Activity size={iconSize}/></div>
                 <div className="flex-grow">
                    <p className={`font-medium text-gray-600`}>Electrocardiograma (ECG)</p>
                    {record.ecgData && record.ecgData.length > 0 ? (
                        <div className="mt-1 sm:mt-2 w-full"> 
                           <ECGChart data={record.ecgData} height={ecgChartHeight} />
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No medido</p>
                    )}
                 </div>
            </div>
        </div>
      </div>

      <div className={`mt-4 sm:mt-6 mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm`}>
          <div className="flex items-center">
            <CheckCircle size={idForPdf ? 20 : 24} className="mr-2 sm:mr-3 text-green-600 flex-shrink-0" />
            <p className={`font-semibold text-green-700 ${idForPdf ? 'text-sm' : 'text-md'}`}>
                No debe preocuparse, su temperatura, pulso cardiaco y ECG están dentro de lo normal.
            </p>
          </div>
      </div>

      <div className={`mt-6 sm:mt-8 pt-3 sm:pt-4 border-t text-center ${baseFontSizeClass} text-gray-500`}>
        <p className="font-semibold text-gray-600 mb-1 sm:mb-2">Todo se encuentra normal.</p>
        <p>Este es un informe generado por {APP_NAME}. Los datos son para seguimiento personal y no reemplazan el consejo médico profesional.</p>
        <p>Consulte a un profesional de la salud para cualquier preocupación médica.</p>
      </div>
    </div>
  );
};
