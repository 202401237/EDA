from typing import List
from app.config import settings
from app.schemas.churn import CustomerChurnInput, CustomerChurnResult
from app.schemas.common import CustomerFeedback, RiskLevel


class CustomerChurnService:
    @staticmethod
    def evaluate_churn_risk(
        data: CustomerChurnInput,
        shock_threshold_pct: float = settings.CHURN_RATE_HIKE_THRESHOLD,
    ) -> CustomerChurnResult:
        """
        Deterministic rule-based customer retention risk evaluation.
        Follows the verified disjunctive logic:
        High Risk = (Poor Customer Feedback) OR (Excessive Premium Rate Shock > shock_threshold_pct)
        """
        factors: List[str] = []

        is_poor_feedback = data.customerFeedback == CustomerFeedback.POOR
        premium_increase_pct = (
            ((data.currentPremium - data.previousPremium) / data.previousPremium) * 100.0
            if data.previousPremium > 0
            else 0.0
        )
        is_rate_shock = premium_increase_pct > shock_threshold_pct
        is_moderate_increase = premium_increase_pct > 8.0
        is_average_feedback = data.customerFeedback == CustomerFeedback.AVERAGE
        is_long_tenure = data.insuranceDuration >= 7

        if is_poor_feedback:
            factors.append("Customer feedback rated as 'Poor' — strong negative sentiment and dissatisfaction")
        if is_rate_shock:
            factors.append(
                f"Premium increased by {premium_increase_pct:.1f}% year-over-year — exceeds rate shock threshold ({shock_threshold_pct:.0f}%)"
            )
        elif is_moderate_increase:
            factors.append(f"Moderate premium rate increase of {premium_increase_pct:.1f}%")

        if is_average_feedback:
            factors.append("Average satisfaction score — vulnerable to competitor acquisition campaigns")
        if is_long_tenure:
            factors.append(f"{data.insuranceDuration}-year customer tenure — valuable relationship at hazard")

        # Disjunctive Logic (OR)
        if is_poor_feedback or is_rate_shock:
            churn_risk = RiskLevel.HIGH
            suggestions = [
                "Initiate immediate outbound priority call from senior account manager.",
                "Review policy pricing structure and offer tailored loyalty renewal discount.",
                "Conduct customer service root-cause remediation on recorded complaints.",
            ]
        elif is_average_feedback or is_moderate_increase:
            churn_risk = RiskLevel.MEDIUM
            suggestions = [
                "Issue customer satisfaction survey to identify service friction points.",
                "Highlight active policy benefits and no-claim bonus status before renewal.",
                "Offer a structured annual policy review to ensure coverage alignment.",
            ]
        else:
            churn_risk = RiskLevel.LOW
            suggestions = [
                "Maintain standard relationship communication cadence.",
                "Deliver scheduled annual policy statement and benefit summary.",
            ]

        return CustomerChurnResult(
            churnRisk=churn_risk,
            churnProbability=None,  # Null: uncalibrated heuristic rule; no empirical churn target exists in dataset
            triggeredFactors=factors if factors else ["No adverse retention signals identified"],
            retentionSuggestions=suggestions,
            isDemoResult=True,
        )
