from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from .common import PolicyType


class FraudSuspicionInput(BaseModel):
    claimReference: str = Field(..., min_length=1, max_length=50, description="Claim identifier or reference token")
    previousClaimsCount: Optional[int] = Field(
        None,
        ge=0,
        le=50,
        description="Declared count of past claims; null signals missing or concealed history",
    )
    annualIncome: float = Field(..., ge=0.0, description="Policyholder declared annual income")
    creditScore: int = Field(..., ge=300, le=850, description="FICO-style credit score")
    policyType: PolicyType = Field(..., description="Insurance policy tier under claim")
    vehicleAge: int = Field(..., ge=0, le=100, description="Vehicle age in years")


class FraudSuspicionResult(BaseModel):
    status: Literal["Potentially Suspicious", "Further Verification", "Low Suspicion"] = Field(
        ..., description="Audit flag status"
    )
    triggeredIndicators: List[str] = Field(..., description="Specific indicators flagged for investigator review")
    indicatorCount: int = Field(..., ge=0, description="Count of triggered suspicious indicators")
    recommendedAction: str = Field(..., description="Human-in-the-loop review workflow recommendation")
    isDemoResult: bool = Field(True, description="True indicates heuristic indicators for audit prioritization")
