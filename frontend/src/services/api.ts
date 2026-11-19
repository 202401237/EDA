import { config } from '../config';
import type {
  PremiumPredictionInput, PremiumPredictionResult,
  UnderInsuranceInput, UnderInsuranceResult,
  UnderwritingMarginInput, UnderwritingMarginResult,
  ClaimBurstRiskInput, ClaimBurstRiskResult,
  CustomerChurnInput, CustomerChurnResult,
  FraudSuspicionInput, FraudSuspicionResult,
} from '../types/features';
import {
  mockPremiumPrediction,
  mockUnderInsuranceWarning,
  mockUnderwritingMargin,
  mockClaimBurstRisk,
  mockCustomerChurn,
  mockFraudSuspicion,
} from './mock';

async function callApi<T>(endpoint: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const message =
        typeof errorData?.detail === 'string'
          ? errorData.detail
          : Array.isArray(errorData?.errors)
          ? errorData.errors.join(', ')
          : `API error ${res.status}: ${res.statusText}`;
      throw new Error(message);
    }
    return res.json() as Promise<T>;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.toLowerCase().includes('failed to fetch')) {
      throw new Error(
        `Backend service unavailable at ${config.apiBaseUrl || 'http://127.0.0.1:8000'}. Ensure the FastAPI server is running.`
      );
    }
    throw err;
  }
}

function withMockDelay<T>(result: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(result), 900 + Math.random() * 600));
}

export async function predictInsurancePremium(input: PremiumPredictionInput): Promise<PremiumPredictionResult> {
  if (config.useMock) return withMockDelay(mockPremiumPrediction(input));
  return callApi<PremiumPredictionResult>('/api/v1/predict/premium', input);
}

export async function checkUnderInsuranceWarning(input: UnderInsuranceInput): Promise<UnderInsuranceResult> {
  if (config.useMock) return withMockDelay(mockUnderInsuranceWarning(input));
  return callApi<UnderInsuranceResult>('/api/v1/predict/under-insurance', input);
}

export async function analyzeUnderwritingMargin(input: UnderwritingMarginInput): Promise<UnderwritingMarginResult> {
  if (config.useMock) return withMockDelay(mockUnderwritingMargin(input));
  return callApi<UnderwritingMarginResult>('/api/v1/analyze/underwriting-margin', input);
}

export async function analyzeClaimBurstRisk(input: ClaimBurstRiskInput): Promise<ClaimBurstRiskResult> {
  if (config.useMock) return withMockDelay(mockClaimBurstRisk(input));
  return callApi<ClaimBurstRiskResult>('/api/v1/analyze/claim-burst-risk', input);
}

export async function analyzeCustomerChurn(input: CustomerChurnInput): Promise<CustomerChurnResult> {
  if (config.useMock) return withMockDelay(mockCustomerChurn(input));
  return callApi<CustomerChurnResult>('/api/v1/analyze/customer-churn', input);
}

export async function analyzeFraudSuspicion(input: FraudSuspicionInput): Promise<FraudSuspicionResult> {
  if (config.useMock) return withMockDelay(mockFraudSuspicion(input));
  return callApi<FraudSuspicionResult>('/api/v1/analyze/fraud-suspicion', input);
}
