from typing import List, Optional
from pydantic import BaseModel, Field
from .common import CustomerFeedback, PolicyType, Location, RiskLevel


class CustomerChurnInput(BaseModel):
    customerFeedback: CustomerFeedback = Field(..., description="Customer sentiment classification")
    currentPremium: float = Field(..., ge=0.0, description="Current annual policy premium")
    previousPremium: float = Field(..., ge=0.0, description="Prior year policy premium")
    insuranceDuration: int = Field(..., ge=1, le=50, description="Customer relationship tenure (years)")
    policyType: PolicyType = Field(..., description="Coverage policy tier")
    location: Location = Field(..., description="Geographic territory")


class CustomerChurnResult(BaseModel):
    churnRisk: RiskLevel = Field(..., description="Policyholder retention risk tier")
    churnProbability: Optional[float] = Field(
        None,
        description="Calibrated probability (null if rule-based proxy without empirical validation)",
    )
    triggeredFactors: List[str] = Field(..., description="Identified retention hazard factors")
    retentionSuggestions: List[str] = Field(..., description="Actionable retention recommendations")
    isDemoResult: bool = Field(True, description="True indicates heuristic risk category assessment")
