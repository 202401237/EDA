from .common import (
    Gender,
    MaritalStatus,
    EducationLevel,
    Occupation,
    Location,
    PolicyType,
    CustomerFeedback,
    SmokingStatus,
    ExerciseFrequency,
    PropertyType,
    RiskLevel,
)
from .premium import PremiumPredictionInput, PremiumPredictionResult
from .underwriting import (
    UnderInsuranceInput,
    UnderInsuranceResult,
    UnderwritingMarginInput,
    UnderwritingMarginResult,
)
from .claim_risk import ClaimBurstRiskInput, ClaimBurstRiskResult
from .churn import CustomerChurnInput, CustomerChurnResult
from .fraud import FraudSuspicionInput, FraudSuspicionResult

__all__ = [
    "Gender",
    "MaritalStatus",
    "EducationLevel",
    "Occupation",
    "Location",
    "PolicyType",
    "CustomerFeedback",
    "SmokingStatus",
    "ExerciseFrequency",
    "PropertyType",
    "RiskLevel",
    "PremiumPredictionInput",
    "PremiumPredictionResult",
    "UnderInsuranceInput",
    "UnderInsuranceResult",
    "UnderwritingMarginInput",
    "UnderwritingMarginResult",
    "ClaimBurstRiskInput",
    "ClaimBurstRiskResult",
    "CustomerChurnInput",
    "CustomerChurnResult",
    "FraudSuspicionInput",
    "FraudSuspicionResult",
]
