from typing import List
from pydantic import BaseModel, Field
from .common import Location, PolicyType, SmokingStatus, RiskLevel


class ClaimBurstRiskInput(BaseModel):
    vehicleAge: int = Field(..., ge=0, le=100, description="Vehicle age in years")
    previousClaims: int = Field(..., ge=0, le=50, description="Past loss claim frequency")
    location: Location = Field(..., description="Operating geographical territory")
    policyType: PolicyType = Field(..., description="Insurance policy tier")
    age: int = Field(..., ge=18, le=100, description="Driver/policyholder age")
    smokingStatus: SmokingStatus = Field(..., description="Tobacco use status")


class ClaimBurstRiskResult(BaseModel):
    overallRisk: RiskLevel = Field(..., description="Composite claim exposure classification")
    locationRisk: RiskLevel = Field(..., description="Location-specific exposure risk")
    vehicleAgeRisk: RiskLevel = Field(..., description="Mechanical aging risk")
    claimsRisk: RiskLevel = Field(..., description="Prior loss frequency risk")
    triggeredFactors: List[str] = Field(..., description="Identified risk factors")
    riskScore: int = Field(..., ge=0, le=100, description="Composite risk index (0-100)")
    isDemoResult: bool = Field(True, description="True indicates transparent rule-based heuristic")
