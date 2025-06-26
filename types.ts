
export enum Gender {
  MALE = 'Masculino',
  FEMALE = 'Femenino',
  OTHER = 'Otro',
  PREFER_NOT_TO_SAY = 'Prefiero no decirlo'
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
  UNKNOWN = 'Desconocido'
}

export interface User {
  id: string;
  name: string;
  surname: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  bloodType: BloodType;
}

export interface VitalSignsRecord {
  id: string;
  userId: string;
  date: string; // ISO string
  temperature?: number; // Celsius
  heartRate?: number; // bpm
  ecgData?: { name: string; value: number }[]; // Simplified ECG data for chart
  abnormalities?: string[]; // Will always be undefined or empty due to simulation changes
}

export interface SimulatedVitals {
  temperature?: number;
  heartRate?: number;
  ecgPlotData?: { name: string; value: number }[];
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
}
