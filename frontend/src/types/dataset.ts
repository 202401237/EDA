// Dataset schema based on insurance_sample_20000.csv
// 21 columns verified from EDA inspection

export type Gender = 'Male' | 'Female';
export type MaritalStatus = 'Married' | 'Single' | 'Divorced';
export type EducationLevel = "Bachelor's" | "Master's" | 'PhD' | 'High School';
export type Occupation = 'Employed' | 'Self-Employed' | 'Unemployed';
export type Location = 'Urban' | 'Suburban' | 'Rural';
export type PolicyType = 'Basic' | 'Comprehensive' | 'Premium';
export type CustomerFeedback = 'Poor' | 'Average' | 'Good';
export type SmokingStatus = 'Yes' | 'No';
export type ExerciseFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Rarely';
export type PropertyType = 'House' | 'Apartment' | 'Condo';

// Verified ranges from EDA
export const DATASET_RANGES = {
  age: { min: 18, max: 64, unit: 'Years' },
  annualIncome: { min: 1, max: 149974, unit: 'USD/year', note: 'Floor of $1 is a synthetic artifact' },
  numberOfDependents: { min: 0, max: 4, unit: 'Count' },
  healthScore: { min: 2.01, max: 58.98, unit: 'Index (unitless)' },
  previousClaims: { min: 0, max: 9, unit: 'Count (integer)' },
  vehicleAge: { min: 0, max: 19, unit: 'Years' },
  creditScore: { min: 300, max: 849, unit: 'FICO-style score' },
  insuranceDuration: { min: 1, max: 9, unit: 'Years' },
  premiumAmount: { min: 20, max: 4999, mean: 1098, median: 867, unit: 'USD/year' },
} as const;

// NOTE: Dataset currency is USD. Frontend displays ₹ as per project requirement.
// Treat displayed values as demo/illustrative only.
export const CURRENCY = { symbol: '₹', label: 'INR (Demo)' };
