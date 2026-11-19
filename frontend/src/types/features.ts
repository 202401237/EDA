import type { Gender, MaritalStatus, EducationLevel, Occupation, Location, PolicyType, CustomerFeedback, SmokingStatus, ExerciseFrequency, PropertyType } from './dataset';

// ── Premium Prediction ──────────────────────────────────────────────────────
export interface PremiumPredictionInput {
  age: number;
  gender: Gender;
  annualIncome: number;
  maritalStatus: MaritalStatus;
  numberOfDependents: number;
  educationLevel: EducationLevel;
  occupation: Occupation;
  healthScore: number;
  location: Location;
  policyType: PolicyType;
  previousClaims: number;
  vehicleAge: number;
  creditScore: number;
  insuranceDuration: number;
  smokingStatus: SmokingStatus;
  exerciseFrequency: ExerciseFrequency;
  propertyType: PropertyType;
}

export interface PremiumPredictionResult {
  estimatedPremium: number;
  policyType: PolicyType;
  confidenceLow: number | null;
  confidenceHigh: number | null;
  premiumCategory: 'Low' | 'Medium' | 'High';
  isDemoResult: boolean;
  submittedInputs: PremiumPredictionInput;
}

// ── Under Insurance Warning ──────────────────────────────────────────────────
export interface UnderInsuranceInput {
  numberOfDependents: number;
  annualIncome: number;
  vehicleAge: number;
  policyType: PolicyType;
}

export interface UnderInsuranceResult {
  isUnderInsured: boolean;
  riskLevel: 'Low' | 'Medium' | 'High';
  triggeredConditions: string[];
  recommendation: string;
  isDemoResult: boolean;
}

// ── Underwriting Profit Margin ───────────────────────────────────────────────
export interface UnderwritingMarginInput {
  customerPaidPremium: number;
  riskAdjustedMinPremium: number;
  policyType: PolicyType;
  previousClaims: number;
  vehicleAge: number;
}

export interface UnderwritingMarginResult {
  customerPaidPremium: number;
  riskAdjustedMinPremium: number;
  difference: number;
  status: 'Above' | 'At' | 'Below';
  marginPercent: number;
  isDemoResult: boolean;
}

// ── Claim Burst Risk ─────────────────────────────────────────────────────────
export interface ClaimBurstRiskInput {
  vehicleAge: number;
  previousClaims: number;
  location: Location;
  policyType: PolicyType;
  age: number;
  smokingStatus: SmokingStatus;
}

export interface ClaimBurstRiskResult {
  overallRisk: 'Low' | 'Medium' | 'High';
  locationRisk: 'Low' | 'Medium' | 'High';
  vehicleAgeRisk: 'Low' | 'Medium' | 'High';
  claimsRisk: 'Low' | 'Medium' | 'High';
  triggeredFactors: string[];
  riskScore: number;
  isDemoResult: boolean;
}

// ── Customer Churn ───────────────────────────────────────────────────────────
export interface CustomerChurnInput {
  customerFeedback: CustomerFeedback;
  currentPremium: number;
  previousPremium: number;
  insuranceDuration: number;
  policyType: PolicyType;
  location: Location;
}

export interface CustomerChurnResult {
  churnRisk: 'Low' | 'Medium' | 'High';
  churnProbability: number | null; // 0-100, demo only / null if uncalibrated
  triggeredFactors: string[];
  retentionSuggestions: string[];
  isDemoResult: boolean;
}

// ── Fraud Suspicion ──────────────────────────────────────────────────────────
export interface FraudSuspicionInput {
  claimReference: string;
  previousClaimsCount: number | null; // null = missing/concealed
  annualIncome: number;
  creditScore: number;
  policyType: PolicyType;
  vehicleAge: number;
}

export interface FraudSuspicionResult {
  status: 'Potentially Suspicious' | 'Further Verification' | 'Low Suspicion';
  triggeredIndicators: string[];
  indicatorCount: number;
  recommendedAction: string;
  isDemoResult: boolean;
}
