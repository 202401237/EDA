from typing import List, Literal
from app.config import settings
from app.schemas.fraud import FraudSuspicionInput, FraudSuspicionResult


class FraudService:
    @staticmethod
    def audit_fraud_suspicion(
        data: FraudSuspicionInput,
        income_threshold: float = settings.FRAUD_INCOME_THRESHOLD,
        credit_threshold: int = settings.FRAUD_CREDIT_THRESHOLD,
    ) -> FraudSuspicionResult:
        """
        Rule-based audit flagging heuristic for prioritization of claims review.
        Evaluates 3 risk indicators:
          1. Missing or undisclosed previous claims history (null input)
          2. Disproportionately low annual income (<= income_threshold, default 100)
          3. Subprime / compromised credit standing (< credit_threshold, default 450)
        """
        indicators: List[str] = []

        # Indicator 1: Undisclosed prior loss history
        if data.previousClaimsCount is None:
            indicators.append("Prior claim history is undisclosed or omitted on claim submission")

        # Indicator 2: Suspiciously low income floor
        # Documented caveat: Dataset contains synthetic $1 floor artifact; threshold of 100 is configurable.
        if data.annualIncome <= income_threshold:
            indicators.append(
                f"Declared annual income (${data.annualIncome:,.0f}) is at or below benchmark anomaly threshold (≤ ${income_threshold:,.0f})"
            )

        # Indicator 3: Severe credit degradation
        if data.creditScore < credit_threshold:
            indicators.append(
                f"Credit score ({data.creditScore}) is below minimum audit threshold (< {credit_threshold})"
            )

        count = len(indicators)

        if count >= 2:
            status: Literal["Potentially Suspicious", "Further Verification", "Low Suspicion"] = "Potentially Suspicious"
            action = (
                "Escalate claim to Special Investigation Unit (SIU) for cross-verification of loss history, "
                "financial disclosures, and police/damage report documentation prior to settlement."
            )
        elif count == 1:
            status = "Further Verification"
            action = (
                "Forward claim to Level-2 Claims Examiner. Request supporting documentation for flagged item "
                "before authorizing disbursement."
            )
        else:
            status = "Low Suspicion"
            action = "Proceed with standard claims adjudication process and automated straight-through processing checks."

        return FraudSuspicionResult(
            status=status,
            triggeredIndicators=indicators if indicators else ["No audit trigger indicators detected on initial submission"],
            indicatorCount=count,
            recommendedAction=action,
            isDemoResult=True,
        )
