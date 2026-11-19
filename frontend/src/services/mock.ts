import type {
  PremiumPredictionInput, PremiumPredictionResult,
  UnderInsuranceInput, UnderInsuranceResult,
  UnderwritingMarginInput, UnderwritingMarginResult,
  ClaimBurstRiskInput, ClaimBurstRiskResult,
  CustomerChurnInput, CustomerChurnResult,
  FraudSuspicionInput, FraudSuspicionResult,
} from '../types/features';

// Dataset stats (verified from EDA inspection of insurance_sample_20000.csv)
const DATASET_MEDIAN_PREMIUM = 867;

export function mockPremiumPrediction(input: PremiumPredictionInput): PremiumPredictionResult {
  // Demo heuristic based on EDA findings:
  // Previous Claims has strongest positive correlation (r=+0.044)
  // Credit Score has negative correlation (r=-0.031)
  // Location: Urban slightly higher premiums
  let base = DATASET_MEDIAN_PREMIUM;
  base += input.previousClaims * 80;
  base -= ((input.creditScore - 591) / 150) * 60;
  base += input.vehicleAge > 10 ? 120 : 0;
  base += input.smokingStatus === 'Yes' ? 50 : 0;
  base += input.location === 'Urban' ? 40 : input.location === 'Suburban' ? 15 : 0;
  base += input.numberOfDependents * 30;
  base += input.healthScore > 40 ? 80 : 0;
  base = Math.max(200, Math.min(4999, Math.round(base)));

  return {
    estimatedPremium: base,
    policyType: input.policyType,
    confidenceLow: Math.round(base * 0.85),
    confidenceHigh: Math.round(base * 1.15),
    premiumCategory: base < 700 ? 'Low' : base < 1500 ? 'Medium' : 'High',
    isDemoResult: true,
    submittedInputs: input,
  };
}

export function mockUnderInsuranceWarning(input: UnderInsuranceInput): UnderInsuranceResult {
  const conditions: string[] = [];
  const hasManydependents = input.numberOfDependents >= 2;
  const isGoodIncome = input.annualIncome >= 25000;
  const isNewVehicle = input.vehicleAge <= 2;
  const isBasicPlan = input.policyType === 'Basic';

  if (hasManydependents) conditions.push('2 or more dependents detected');
  if (isGoodIncome) conditions.push('Annual income qualifies as good income (≥ $25,000)');
  if (isNewVehicle) conditions.push('Vehicle is relatively new (≤ 2 years old)');
  if (isBasicPlan) conditions.push('Basic plan selected — lowest coverage tier');

  const isUnderInsured = hasManydependents && isGoodIncome && isNewVehicle && isBasicPlan;
  const partialRisk = [hasManydependents, isGoodIncome, isNewVehicle, isBasicPlan].filter(Boolean).length;

  return {
    isUnderInsured,
    riskLevel: isUnderInsured ? 'High' : partialRisk >= 2 ? 'Medium' : 'Low',
    triggeredConditions: conditions,
    recommendation: isUnderInsured
      ? 'Consider upgrading to Comprehensive or Premium plan to better protect your dependents and assets.'
      : partialRisk >= 2
      ? 'Review your coverage needs — some risk factors are present.'
      : 'Your current coverage appears appropriate for your profile.',
    isDemoResult: true,
  };
}

export function mockUnderwritingMargin(input: UnderwritingMarginInput): UnderwritingMarginResult {
  const diff = input.customerPaidPremium - input.riskAdjustedMinPremium;
  const marginPercent = input.riskAdjustedMinPremium > 0
    ? (diff / input.riskAdjustedMinPremium) * 100
    : 0;
  const status: 'Above' | 'At' | 'Below' =
    diff > 10 ? 'Above' : diff < -10 ? 'Below' : 'At';
  return {
    customerPaidPremium: input.customerPaidPremium,
    riskAdjustedMinPremium: input.riskAdjustedMinPremium,
    difference: diff,
    status,
    marginPercent: Math.round(marginPercent * 10) / 10,
    isDemoResult: true,
  };
}

export function mockClaimBurstRisk(input: ClaimBurstRiskInput): ClaimBurstRiskResult {
  const factors: string[] = [];
  // EDA verified: Previous Claims x Vehicle Age interaction: 3-4 claims + 13-19yr vehicles → $1,215 avg premium
  const vehicleRisk: 'Low' | 'Medium' | 'High' = input.vehicleAge >= 13 ? 'High' : input.vehicleAge >= 10 ? 'Medium' : 'Low';
  const claimsRisk: 'Low' | 'Medium' | 'High' = input.previousClaims >= 3 ? 'High' : input.previousClaims >= 2 ? 'Medium' : 'Low';
  // EDA verified: Urban has highest premium ($1,104.75 vs Rural $1,087.65)
  const locationRisk: 'Low' | 'Medium' | 'High' = input.location === 'Urban' ? 'High' : input.location === 'Suburban' ? 'Medium' : 'Low';

  if (input.vehicleAge >= 10) factors.push(`Vehicle age ${input.vehicleAge} years — elevated mechanical risk`);
  if (input.previousClaims >= 2) factors.push(`${input.previousClaims} previous claims — above average claim frequency`);
  if (input.location === 'Urban') factors.push('Urban location — higher traffic density and accident exposure');
  if (input.location === 'Suburban') factors.push('Suburban location — moderate traffic density');

  const scores: Record<'Low' | 'Medium' | 'High', number> = { Low: 0, Medium: 1, High: 2 };
  const totalScore = scores[vehicleRisk] + scores[claimsRisk] + scores[locationRisk];
  const overallRisk: 'Low' | 'Medium' | 'High' = totalScore >= 4 ? 'High' : totalScore >= 2 ? 'Medium' : 'Low';

  return {
    overallRisk,
    locationRisk,
    vehicleAgeRisk: vehicleRisk,
    claimsRisk,
    triggeredFactors: factors,
    riskScore: Math.round((totalScore / 6) * 100),
    isDemoResult: true,
  };
}

export function mockCustomerChurn(input: CustomerChurnInput): CustomerChurnResult {
  const factors: string[] = [];
  const poorFeedback = input.customerFeedback === 'Poor';
  const premiumIncrease = input.previousPremium > 0
    ? ((input.currentPremium - input.previousPremium) / input.previousPremium) * 100
    : 0;
  const highStress = premiumIncrease > 15;
  const longDuration = input.insuranceDuration >= 7;

  if (poorFeedback) factors.push('Customer feedback rated as Poor');
  if (highStress) factors.push(`Premium increased by ${premiumIncrease.toFixed(1)}% — high financial stress`);
  if (input.customerFeedback === 'Average') factors.push('Average satisfaction — moderate retention risk');
  if (longDuration) factors.push(`${input.insuranceDuration}-year customer — high lifetime value at risk`);

  const isHighRisk = poorFeedback || highStress;
  const isMediumRisk = input.customerFeedback === 'Average' || premiumIncrease > 8;

  const churnRisk: 'Low' | 'Medium' | 'High' = isHighRisk ? 'High' : isMediumRisk ? 'Medium' : 'Low';
  const prob = churnRisk === 'High' ? 65 + Math.floor(premiumIncrease / 2) : churnRisk === 'Medium' ? 35 : 12;

  const suggestions = churnRisk === 'High'
    ? ['Schedule immediate retention call', 'Offer loyalty discount or plan upgrade', 'Address feedback concerns directly']
    : churnRisk === 'Medium'
    ? ['Send satisfaction survey', 'Offer renewal incentive', 'Review current plan fit']
    : ['Send regular engagement newsletter', 'Highlight upcoming renewal benefits'];

  return {
    churnRisk,
    churnProbability: Math.min(95, prob),
    triggeredFactors: factors.length ? factors : ['No significant churn signals detected'],
    retentionSuggestions: suggestions,
    isDemoResult: true,
  };
}

export function mockFraudSuspicion(input: FraudSuspicionInput): FraudSuspicionResult {
  const indicators: string[] = [];
  const missingClaims = input.previousClaimsCount === null;
  // NOTE: The income threshold of 100 is from the project brief.
  // The dataset shows Annual Income in USD with a synthetic $1 floor.
  // This threshold is AMBIGUOUS and must be confirmed with the team.
  const suspiciousIncome = input.annualIncome <= 100;
  const lowCredit = input.creditScore < 450;

  if (missingClaims) indicators.push('Previous claim information is missing or concealed');
  if (suspiciousIncome) indicators.push('Annual income is at or below the configured demo threshold (≤ 100)');
  if (lowCredit) indicators.push(`Credit score ${input.creditScore} is below the low-credit threshold (< 450)`);

  const count = indicators.length;
  const status: FraudSuspicionResult['status'] =
    count >= 2 ? 'Potentially Suspicious'
    : count === 1 ? 'Further Verification'
    : 'Low Suspicion';

  const action =
    count >= 2
      ? 'Escalate to senior underwriter for full documentation audit before processing claim.'
      : count === 1
      ? 'Request additional documentation and verify supplied information before approving.'
      : 'Proceed with standard claim processing. Continue routine monitoring.';

  return {
    status,
    triggeredIndicators: indicators.length ? indicators : ['No suspicious indicators detected based on supplied inputs'],
    indicatorCount: count,
    recommendedAction: action,
    isDemoResult: true,
  };
}
