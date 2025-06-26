
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSession } from '../hooks/useUserSession';
import { useVitalSimulation } from '../hooks/useVitalSimulation';
import { VitalSignCard } from '../components/vitals/VitalSignCard';
import { ECGChart } from '../components/vitals/ECGChart';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { PdfExportButton } from '../components/pdf/PdfExportButton';
import { MedicalReport } from '../components/pdf/MedicalReport';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Thermometer, HeartPulse, Activity, Save, ArrowLeft, RotateCcw, CheckCircle, Bluetooth } from 'lucide-react';
import { COLORS } from '../constants';
import { SimulatedVitals, VitalSignsRecord } from '../types';

const MeasureVitalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUserSession();
  const { 
    currentVitals,
    simulateTemperature, simulateHeartRate, simulateECG,
    saveCurrentVitals, checkAnomalies, clearCurrentVitals
  } = useVitalSimulation(currentUser);

  const [isMeasuring, setIsMeasuring] = useState<Partial<Record<'temp' | 'hr' | 'ecg', boolean>>>({});
  const [latestSavedRecord, setLatestSavedRecord] = useState<VitalSignsRecord | null>(null);

  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);
  const [measurementTask, setMeasurementTask] = useState<(() => void) | null>(null);

  useEffect(() => {
    return () => { clearCurrentVitals(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUser) navigate('/');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const performMeasurement = async (vitalType: 'temp' | 'hr' | 'ecg') => {
    setIsMeasuring(prev => ({ ...prev, [vitalType]: true }));
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700)); 
    
    let newVitals: SimulatedVitals = { ...currentVitals };
    if (vitalType === 'temp') newVitals.temperature = simulateTemperature();
    if (vitalType === 'hr') newVitals.heartRate = simulateHeartRate();
    if (vitalType === 'ecg') newVitals.ecgPlotData = simulateECG();
    
    setIsMeasuring(prev => ({ ...prev, [vitalType]: false }));
    checkAnomalies(newVitals); 
  };
  
  const triggerMeasurement = (vitalType: 'temp' | 'hr' | 'ecg') => {
    setMeasurementTask(() => () => performMeasurement(vitalType));
    setIsBluetoothModalOpen(true);
  };

  const handleBluetoothModalAccept = () => {
    if (measurementTask) measurementTask();
    setIsBluetoothModalOpen(false);
    setMeasurementTask(null);
  };

  const handleBluetoothModalClose = () => {
    setIsBluetoothModalOpen(false);
    setMeasurementTask(null);
  };

  const handleSaveRecord = () => {
    const record = saveCurrentVitals();
    if (record) {
      setLatestSavedRecord(record);
      alert('Registro guardado exitosamente.');
    }
  };

  const getStatus = (type: 'temp' | 'hr'): 'normal' | 'pending' => {
    const value = type === 'temp' ? currentVitals.temperature : currentVitals.heartRate;
    return value === undefined ? 'pending' : 'normal'; 
  };
  
  const canSave = currentVitals.temperature !== undefined || currentVitals.heartRate !== undefined || currentVitals.ecgPlotData !== undefined;
  const currentVitalsAreSameAsLastSaved = latestSavedRecord !== null &&
    currentVitals.temperature === latestSavedRecord.temperature &&
    currentVitals.heartRate === latestSavedRecord.heartRate &&
    JSON.stringify(currentVitals.ecgPlotData) === JSON.stringify(latestSavedRecord.ecgData);

  return (
    <div className="space-y-6 sm:space-y-8">
      <Modal
        isOpen={isBluetoothModalOpen}
        onClose={handleBluetoothModalClose}
        title="Aviso de Conexión Bluetooth"
        footerContent={
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
             <Button variant="ghost" onClick={handleBluetoothModalClose} className="w-full sm:w-auto">Cerrar</Button>
            <Button onClick={handleBluetoothModalAccept} variant="primary" className="w-full sm:w-auto">Aceptar</Button>
          </div>
        }
      >
        <div className="text-center">
            <Bluetooth size={40} className={`mx-auto mb-4 ${COLORS.accent}`}/>
            <p className={`${COLORS.textDefault} text-base sm:text-lg`}>
                Para realizar la medición se necesita activar el Bluetooth.
            </p>
        </div>
      </Modal>

      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4 sm:mb-6" leftIcon={<ArrowLeft size={18}/>}>
        Volver al Panel
      </Button>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <div className="flex items-center mb-3 sm:mb-0">
          <Activity size={32} className={`mr-3 sm:mr-4 ${COLORS.accent}`} />
          <h1 className={`text-3xl sm:text-4xl font-bold ${COLORS.textHeading}`}>Medición de Signos Vitales</h1>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
           <Button onClick={() => { clearCurrentVitals(); setLatestSavedRecord(null); }} variant="ghost" size="md" leftIcon={<RotateCcw size={18}/>} disabled={Object.keys(currentVitals).length === 0} className="w-full sm:w-auto">
            Reiniciar
          </Button>
          <Button onClick={handleSaveRecord} disabled={!canSave || currentVitalsAreSameAsLastSaved} size="md" leftIcon={<Save size={20}/>} className="w-full sm:w-auto">
            Guardar Registro
          </Button>
        </div>
      </div>
      <p className={`${COLORS.textDefault} text-base sm:text-lg mb-6`}>
        Haz clic en "Medir" para cada signo vital. Se te recordará activar Bluetooth.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <VitalSignCard
          label="Temperatura Corporal"
          value={currentVitals.temperature?.toFixed(1)}
          unit="°C"
          status={getStatus('temp')}
          iconType="temperature"
        >
          {isMeasuring.temp ? <LoadingSpinner text="Midiendo..." /> : (
            <Button onClick={() => triggerMeasurement('temp')} className="w-full mt-4" variant="ghost" size="md" leftIcon={<Thermometer size={18}/>}>
              Medir Temperatura
            </Button>
          )}
        </VitalSignCard>

        <VitalSignCard
          label="Pulso Cardíaco"
          value={currentVitals.heartRate}
          unit="lpm"
          status={getStatus('hr')}
          iconType="heartRate"
        >
          {isMeasuring.hr ? <LoadingSpinner text="Midiendo..." /> : (
             <Button onClick={() => triggerMeasurement('hr')} className="w-full mt-4" variant="ghost" size="md" leftIcon={<HeartPulse size={18}/>}>
               Medir Pulso
             </Button>
          )}
        </VitalSignCard>

        <VitalSignCard
          label="Electrocardiograma (ECG)"
          iconType="ecg"
          status={currentVitals.ecgPlotData ? 'normal' : 'pending'} 
        >
          {isMeasuring.ecg ? <LoadingSpinner text="Generando ECG..." /> : (
            <>
              {currentVitals.ecgPlotData && <ECGChart data={currentVitals.ecgPlotData} height={120} />} {/* Reduced height for card */}
              <Button onClick={() => triggerMeasurement('ecg')} className="w-full mt-2" variant="ghost" size="md" leftIcon={<Activity size={18}/>}>
                {currentVitals.ecgPlotData ? 'Volver a Medir ECG' : 'Medir ECG'}
              </Button>
            </>
          )}
        </VitalSignCard>
      </div>

      {latestSavedRecord && currentUser && (
        <div className="mt-8 sm:mt-10 p-4 sm:p-6 bg-green-50 border border-green-300 rounded-lg shadow">
            <h2 className="text-lg sm:text-xl font-semibold text-green-700 mb-3 flex items-center">
                <CheckCircle size={20} className="mr-2"/> Último registro guardado:
            </h2>
            <MedicalReport user={currentUser} record={latestSavedRecord} />
            <div className="mt-4">
              <PdfExportButton 
                user={currentUser} 
                record={latestSavedRecord}
                buttonText="Exportar este Registro a PDF"
              />
            </div>
        </div>
      )}
      
       {Object.keys(currentVitals).length > 0 && !latestSavedRecord && !currentVitalsAreSameAsLastSaved && (
         <div className="mt-8 sm:mt-10 p-4 sm:p-6 bg-blue-50 border border-blue-300 rounded-lg shadow text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-700 mb-2">Resultados Actuales</h2>
            <p className="text-blue-600 text-sm sm:text-base">Los valores medidos se mostrarán aquí. Todos los valores estarán dentro del rango normal.</p>
         </div>
       )}
        {Object.keys(currentVitals).length > 0 && latestSavedRecord && !currentVitalsAreSameAsLastSaved && (
         <div className="mt-8 sm:mt-10 p-4 sm:p-6 bg-yellow-50 border border-yellow-300 rounded-lg shadow text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-yellow-700 mb-2">Nuevos Valores Medidos</h2>
            <p className="text-yellow-600 text-sm sm:text-base">Has tomado nuevas mediciones. Guarda el registro si deseas conservarlas.</p>
         </div>
       )}
    </div>
  );
};

export default MeasureVitalsPage;
