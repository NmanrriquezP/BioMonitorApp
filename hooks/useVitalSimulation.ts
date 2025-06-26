
import { useState, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { VitalSignsRecord, User, SimulatedVitals } from '../types';
import { 
  NORMAL_TEMPERATURE_RANGE, 
  NORMAL_HEART_RATE_RANGE, 
  HEALTHY_ECG_DATA_PATTERN 
} from '../constants';

const VITAL_RECORDS_STORAGE_KEY_PREFIX = 'biomonitor_vital_records_';

// Helper to generate random number in a range
const randomInRange = (min: number, max: number, decimals: number = 1): number => {
  const factor = Math.pow(10, decimals);
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
};

interface NormalReport {
  isAnomalous: false; // Always false
  messages: string[];   // Always empty
  vitals: SimulatedVitals;
}

export const useVitalSimulation = (currentUser: User | null) => {
  const storageKey = currentUser ? `${VITAL_RECORDS_STORAGE_KEY_PREFIX}${currentUser.id}` : '';
  const [records, setRecords] = useLocalStorage<VitalSignsRecord[]>(storageKey, []);
  
  const [currentVitals, setCurrentVitals] = useState<SimulatedVitals>({});
  // Anomaly report is kept for structure but will always indicate normal
  const [normalReport, setNormalReport] = useState<NormalReport | null>(null); 

  const simulateTemperature = useCallback(() => {
    // Always simulate normal temperature
    const temp = randomInRange(NORMAL_TEMPERATURE_RANGE.min, NORMAL_TEMPERATURE_RANGE.max);
    setCurrentVitals(prev => ({ ...prev, temperature: temp }));
    return temp;
  }, []);

  const simulateHeartRate = useCallback(() => {
    // Always simulate normal heart rate
    const hr = randomInRange(NORMAL_HEART_RATE_RANGE.min, NORMAL_HEART_RATE_RANGE.max, 0);
    setCurrentVitals(prev => ({ ...prev, heartRate: hr }));
    return hr;
  }, []);

  const simulateECG = useCallback(() => {
    const ecgPlot = HEALTHY_ECG_DATA_PATTERN;
    setCurrentVitals(prev => ({ ...prev, ecgPlotData: ecgPlot }));
    return ecgPlot;
  }, []);

  const checkAndReportNormalcy = useCallback((vitals: SimulatedVitals): NormalReport => {
    // This function now confirms normalcy, a bit of a misnomer from 'checkAnomalies' but keeps structure
    const report: NormalReport = { isAnomalous: false, messages: [], vitals };
    setNormalReport(report);
    return report;
  }, []);

  const saveCurrentVitals = useCallback(() => {
    if (!currentUser || Object.keys(currentVitals).length === 0) return null;

    // Call the normalcy check, though it will always be normal
    checkAndReportNormalcy(currentVitals); 

    const newRecord: VitalSignsRecord = {
      id: Date.now().toString(),
      userId: currentUser.id,
      date: new Date().toISOString(),
      temperature: currentVitals.temperature,
      heartRate: currentVitals.heartRate,
      ecgData: currentVitals.ecgPlotData,
      abnormalities: undefined, // Always undefined/empty as no anomalies are simulated
    };
    setRecords(prevRecords => [newRecord, ...prevRecords]);
    return newRecord;
  }, [currentUser, currentVitals, setRecords, checkAndReportNormalcy]);
  
  const clearCurrentVitals = useCallback(() => {
    setCurrentVitals({});
    setNormalReport(null);
  }, []);

  return {
    records,
    currentVitals,
    // anomalyReport is replaced by normalReport for clarity, though component might still expect anomalyReport name
    // For compatibility, let's keep the name `anomalyReport` but know it's always normal
    anomalyReport: normalReport, 
    simulateTemperature,
    simulateHeartRate,
    simulateECG,
    checkAnomalies: checkAndReportNormalcy, // Map old name to new function
    saveCurrentVitals,
    clearCurrentVitals,
    getRecords: () => records,
  };
};