export interface PatientInput {
  name: string;
  age: number;
  height: number;
  weight: number;
  bloodGroup: string;
  country: string;
  ethnicity: string;
  biologicalMarkers?: string;
}

export interface SyntheticTwin {
  id: string;
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bloodGroup: string;
  country: string;
  ethnicity: string;
  bmi: number;
  biologicalMarkers: string;
  matchAccuracy: number;
  riskFactors: string[];
}

export interface PatientResult {
  patientId: string;
  safetyStatus: "SAFE" | "CAUTION" | "RISK";
  efficacyScore: number;
  sideEffects: string[];
  contraindications: string[];
  recommendation: string;
  riskLevel: "low" | "medium" | "high";
  demographicGroup: string;
}

export interface TrialSummary {
  overallSafetyScore: number;
  recommendedDosage: string;
  trialOutcome: "APPROVED_FOR_TESTING" | "REQUIRES_FURTHER_STUDY" | "NOT_RECOMMENDED";
  keyFindings: string[];
}

export interface DrugTrialResult {
  medicineName: string;
  patientResults: PatientResult[];
  trialSummary: TrialSummary;
  timestamp: string;
}
