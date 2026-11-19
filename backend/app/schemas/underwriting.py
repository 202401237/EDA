from typing import List, Literal
from pydantic import BaseModel, Field
from .common import PolicyType, RiskLevel


# --- Under Insurance Warning Schemas ---
class UnderInsuranceInput(BaseModel):
    numberOfDependents: int = Field(..., ge=0, le=20, description="Number of household dependents")
    annualIncome: float = Field(..., ge=0.0, description="Annual income (USD/INR equiv)")
    vehicleAge: int = Field(..., ge=0, le=100, description="Age of vehicle in years")
    policyType: PolicyType = Field(..., description="Selected policy tier")


class UnderInsuranceResult(BaseModel):
    isUnderInsured: bool = Field(..., description="True if customer triggers under-insurance conditions")
    riskLevel: RiskLevel = Field(..., description="Overall under-insurance severity risk")
    triggeredConditions: List[str] = Field(..., description="Actuarial risk indicators identified")
    recommendation: str = Field(..., description="Targeted policy upgrade guidance")
    isDemoResult: bool = Field(True, description="True indicates transparent rule-based heuristic")


# --- Underwriting Profit Margin Schemas ---
class UnderwritingMarginInput(BaseModel):
    customerPaidPremium: float = Field(..., ge=0.0, description="Actual premium paid by customer")
    riskAdjustedMinPremium: float = Field(..., ge=0.0, description="Actuarial risk-adjusted minimum premium threshold")
    policyType: PolicyType = Field(..., description="Policy tier")
    previousClaims: int = Field(..., ge=0, le=50, description="Prior loss claims history")
    vehicleAge: int = Field(..., ge=0, le=100, description="Vehicle age in years")


class UnderwritingMarginResult(BaseModel):
    customerPaidPremium: float = Field(..., description="Customer paid premium")
    riskAdjustedMinPremium: float = Field(..., description="Minimum risk premium benchmark")
    difference: float = Field(..., description="Premium variance (Paid - Benchmark)")
    status: Literal["Above", "At", "Below"] = Field(..., description="Margin status relative to risk threshold")
    marginPercent: float = Field(..., description="Percentage spread relative to risk baseline")
    isDemoResult: bool = Field(True, description="True indicates formula-based deterministic calculation")
