from typing import List, Dict
from app.schemas.claim_risk import ClaimBurstRiskInput, ClaimBurstRiskResult
from app.schemas.common import Location, RiskLevel


class ClaimRiskService:
    @staticmethod
    def analyze_claim_burst_risk(data: ClaimBurstRiskInput) -> ClaimBurstRiskResult:
        """
        Deterministic rule-based risk heuristic evaluating vehicle wear, loss frequency,
        and geographic exposure density.
        """
        factors: List[str] = []

        # 1. Vehicle Age Risk: >=13 High, >=10 Medium, <10 Low
        if data.vehicleAge >= 13:
            vehicle_risk = RiskLevel.HIGH
            factors.append(f"Vehicle age {data.vehicleAge} years — advanced mechanical aging and component failure risk")
        elif data.vehicleAge >= 10:
            vehicle_risk = RiskLevel.MEDIUM
            factors.append(f"Vehicle age {data.vehicleAge} years — elevated wear threshold (≥ 10 years)")
        else:
            vehicle_risk = RiskLevel.LOW

        # 2. Prior Claims Risk: >=3 High, >=2 Medium, <2 Low
        if data.previousClaims >= 3:
            claims_risk = RiskLevel.HIGH
            factors.append(f"{data.previousClaims} previous claims — high recurring claim frequency")
        elif data.previousClaims >= 2:
            claims_risk = RiskLevel.MEDIUM
            factors.append(f"{data.previousClaims} previous claims — elevated loss history above portfolio average")
        else:
            claims_risk = RiskLevel.LOW

        # 3. Location Exposure: Urban High, Suburban Medium, Rural Low
        if data.location == Location.URBAN:
            location_risk = RiskLevel.HIGH
            factors.append("Urban location — highest congestion density and accident exposure zone")
        elif data.location == Location.SUBURBAN:
            location_risk = RiskLevel.MEDIUM
            factors.append("Suburban location — moderate commuter and traffic exposure")
        else:
            location_risk = RiskLevel.LOW

        # Additional risk modifier notes
        if data.smokingStatus.value == "Yes":
            factors.append("Smoking status: Yes — lifestyle health correlation factor")

        # Composite Scoring
        weights: Dict[RiskLevel, int] = {RiskLevel.LOW: 0, RiskLevel.MEDIUM: 1, RiskLevel.HIGH: 2}
        total_score = weights[vehicle_risk] + weights[claims_risk] + weights[location_risk]
        # Maximum possible score across 3 dimensions is 6 (2+2+2)
        score_percent = int(round((total_score / 6.0) * 100))

        if total_score >= 4:
            overall_risk = RiskLevel.HIGH
        elif total_score >= 2:
            overall_risk = RiskLevel.MEDIUM
        else:
            overall_risk = RiskLevel.LOW

        return ClaimBurstRiskResult(
            overallRisk=overall_risk,
            locationRisk=location_risk,
            vehicleAgeRisk=vehicle_risk,
            claimsRisk=claims_risk,
            triggeredFactors=factors if factors else ["No elevated loss exposure indicators triggered"],
            riskScore=score_percent,
            isDemoResult=True,
        )
