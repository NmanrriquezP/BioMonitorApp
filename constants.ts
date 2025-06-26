
import { BloodType, Gender } from './types';

export const APP_NAME = "BioMonitor";

export const GENDERS: Gender[] = [
  Gender.FEMALE,
  Gender.MALE,
  Gender.OTHER,
  Gender.PREFER_NOT_TO_SAY,
];

export const BLOOD_TYPES: BloodType[] = [
  BloodType.A_POSITIVE, BloodType.A_NEGATIVE,
  BloodType.B_POSITIVE, BloodType.B_NEGATIVE,
  BloodType.AB_POSITIVE, BloodType.AB_NEGATIVE,
  BloodType.O_POSITIVE, BloodType.O_NEGATIVE,
  BloodType.UNKNOWN,
];

export const NORMAL_TEMPERATURE_RANGE = { min: 36.5, max: 37.5 }; // Celsius
export const ANOMALOUS_TEMPERATURE_LOW = 35.5;
export const ANOMALOUS_TEMPERATURE_HIGH = 38.5;

export const NORMAL_HEART_RATE_RANGE = { min: 60, max: 100 }; // bpm
export const ANOMALOUS_HEART_RATE_LOW = 50;
export const ANOMALOUS_HEART_RATE_HIGH = 110;

// Simplified ECG waveform data points (PQRST complex repeated)
const pqrstComplex = [
  { name: 'P0', value: 0 }, { name: 'P1', value: 0.2 }, { name: 'P2', value: 0 }, // P wave
  { name: 'Q', value: -0.1 }, // Q wave
  { name: 'R', value: 1.0 }, // R wave
  { name: 'S', value: -0.2 }, // S wave
  { name: 'T0', value: 0 }, { name: 'T1', value: 0.3 }, { name: 'T2', value: 0 }, // T wave
  { name: 'U', value: 0.1 }, { name: 'U0', value: 0} // U wave (optional and small)
];

export const HEALTHY_ECG_DATA_PATTERN = [
  ...pqrstComplex.map((p, i) => ({ name: `t${i}`, value: p.value })),
  ...pqrstComplex.map((p, i) => ({ name: `t${i + pqrstComplex.length}`, value: p.value })),
  ...pqrstComplex.map((p, i) => ({ name: `t${i + 2 * pqrstComplex.length}`, value: p.value })),
];

export const COLORS = {
  primary: 'bg-turquoise-medium',
  primaryText: 'text-white',
  secondary: 'bg-pink-semi-reddish',
  secondaryText: 'text-white',
  accent: 'text-turquoise-dark',
  backgroundLight: 'bg-turquoise-light',
  backgroundPinkLight: 'bg-pink-light',
  textDefault: 'text-gray-text',
  textHeading: 'text-heading-text',
  borderDefault: 'border-gray-300',
  anomaly: 'text-red-600 font-semibold',
  pinkSemiReddish: '#FF6B6B', // Added for direct hex color usage
};