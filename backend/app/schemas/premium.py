from typing import Optional, Literal
from pydantic import BaseModel, Field
from .common import (
    Gender,
    MaritalStatus,
    EducationLevel,
    Occupation,
    Location,
    PolicyType,
    SmokingStatus,
    ExerciseFrequency,
    PropertyType,
)


class PremiumPredictionInput(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Age of policyholder in years")
    gender: Gender = Field(..., description="Gender")
    annualIncome: float = Field(..., ge=0.0, description="Annual household income")
    maritalStatus: MaritalStatus = Field(..., description="Marital status")
    numberOfDependents: int = Field(..., ge=0, le=20, description="Number of dependents")
    educationLevel: EducationLevel = Field(..., description="Highest education completed")
    occupation: Occupation = Field(..., description="Current employment status")
    healthScore: float = Field(..., ge=0.0, le=100.0, description="Health score index")
    location: Location = Field(..., description="Geographic classification")
    policyType: PolicyType = Field(..., description="Selected policy tier")
    previousClaims: int = Field(..., ge=0, le=50, description="Count of past claims")
    vehicleAge: int = Field(..., ge=0, le=100, description="Vehicle age in years")
    creditScore: int = Field(..., ge=300, le=850, description="Credit score")
    insuranceDuration: int = Field(..., ge=1, le=50, description="Years insured with company")
    smokingStatus: SmokingStatus = Field(..., description="Tobacco consumption status")
    exerciseFrequency: ExerciseFrequency = Field(..., description="Frequency of physical exercise")
    propertyType: PropertyType = Field(..., description="Type of dwelling owned or rented")


class PremiumPredictionResult(BaseModel):
    estimatedPremium: float = Field(..., description="Model-estimated fair annual premium")
    policyType: PolicyType = Field(..., description="Policy tier evaluated")
    confidenceLow: Optional[float] = Field(None, description="Lower prediction interval bound (if calibrated)")
    confidenceHigh: Optional[float] = Field(None, description="Upper prediction interval bound (if calibrated)")
    premiumCategory: Literal["Low", "Medium", "High"] = Field(..., description="Categorical premium classification")
    isDemoResult: bool = Field(False, description="False indicates genuine ML model prediction")
    submittedInputs: PremiumPredictionInput = Field(..., description="Echo of validated inputs")
