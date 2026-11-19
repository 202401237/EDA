from typing import List
from app.config import settings
from app.schemas.underwriting import (
    UnderInsuranceInput,
    UnderInsuranceResult,
    UnderwritingMarginInput,
    UnderwritingMarginResult,
)
from app.schemas.common import PolicyType, RiskLevel


class UnderwritingService:
    @staticmethod
    def evaluate_under_insurance(
        data: UnderInsuranceInput,
        income_threshold: float = settings.UNDER_INSURANCE_INCOME_THRESHOLD,
    ) -> UnderInsuranceResult:
        """
        Rule-based under-insurance audit.
        Flags policyholders with high dependency and asset replacement costs
        who have opted for the minimal 'Basic' coverage tier.
        """
        conditions: List[str] = []
        has_many_dependents = data.numberOfDependents >= 2
        is_good_income = data.annualIncome >= income_threshold
        is_new_vehicle = data.vehicleAge <= 2
        is_basic_plan = data.policyType == PolicyType.BASIC

        if has_many_dependents:
            conditions.append(f"{data.numberOfDependents} dependents detected (elevated household financial vulnerability)")
        if is_good_income:
            conditions.append(
                f"Annual income ({data.annualIncome:,.0f}) meets/exceeds middle-tier threshold (≥ {income_threshold:,.0f})"
            )
        if is_new_vehicle:
            conditions.append(f"Vehicle age {data.vehicleAge} yr(s) (high capital replacement exposure)")
        if is_basic_plan:
            conditions.append("Basic coverage tier selected (minimal third-party / statutory protection)")

        # Disjunctive / Conjunctive rule definition:
        # High under-insurance risk occurs when ALL 4 conditions coincide:
        is_under_insured = has_many_dependents and is_good_income and is_new_vehicle and is_basic_plan
        partial_risk_count = sum([has_many_dependents, is_good_income, is_new_vehicle, is_basic_plan])

        if is_under_insured:
            risk_level = RiskLevel.HIGH
            recommendation = (
                "High Under-Insurance Exposure: Your household dependents and recent vehicle represent significant capital "
                "exposure. We strongly advise upgrading to Comprehensive or Premium coverage."
            )
        elif partial_risk_count >= 2:
            risk_level = RiskLevel.MEDIUM
            recommendation = (
                "Moderate Coverage Gap: Several vulnerability factors were identified. Consider adding specific endorsements "
                "or upgrading to Comprehensive coverage."
            )
        else:
            risk_level = RiskLevel.LOW
            recommendation = "Your current coverage tier appears proportional to your demographic profile."

        return UnderInsuranceResult(
            isUnderInsured=is_under_insured,
            riskLevel=risk_level,
            triggeredConditions=conditions if conditions else ["No significant under-insurance factors detected"],
            recommendation=recommendation,
            isDemoResult=True,
        )

    @staticmethod
    def calculate_margin(data: UnderwritingMarginInput) -> UnderwritingMarginResult:
        """
        Deterministic actuarial spread calculation:
        Difference = Customer Paid Premium - Risk-Adjusted Minimum Premium
        """
        diff = data.customerPaidPremium - data.riskAdjustedMinPremium
        margin_pct = (
            (diff / data.riskAdjustedMinPremium) * 100.0
            if data.riskAdjustedMinPremium > 0
            else 0.0
        )

        # Tolerance band (+/- 10 currency units) for 'At' parity
        if diff > 10.0:
            status = "Above"
        elif diff < -10.0:
            status = "Below"
        else:
            status = "At"

        return UnderwritingMarginResult(
            customerPaidPremium=round(data.customerPaidPremium, 2),
            riskAdjustedMinPremium=round(data.riskAdjustedMinPremium, 2),
            difference=round(diff, 2),
            status=status,
            marginPercent=round(margin_pct, 1),
            isDemoResult=True,
        )
