from enum import Enum


class Gender(str, Enum):
    MALE = "Male"
    FEMALE = "Female"


class MaritalStatus(str, Enum):
    MARRIED = "Married"
    SINGLE = "Single"
    DIVORCED = "Divorced"


class EducationLevel(str, Enum):
    BACHELORS = "Bachelor's"
    MASTERS = "Master's"
    PHD = "PhD"
    HIGH_SCHOOL = "High School"


class Occupation(str, Enum):
    EMPLOYED = "Employed"
    SELF_EMPLOYED = "Self-Employed"
    UNEMPLOYED = "Unemployed"


class Location(str, Enum):
    URBAN = "Urban"
    SUBURBAN = "Suburban"
    RURAL = "Rural"


class PolicyType(str, Enum):
    BASIC = "Basic"
    COMPREHENSIVE = "Comprehensive"
    PREMIUM = "Premium"


class CustomerFeedback(str, Enum):
    POOR = "Poor"
    AVERAGE = "Average"
    GOOD = "Good"


class SmokingStatus(str, Enum):
    YES = "Yes"
    NO = "No"


class ExerciseFrequency(str, Enum):
    DAILY = "Daily"
    WEEKLY = "Weekly"
    MONTHLY = "Monthly"
    RARELY = "Rarely"


class PropertyType(str, Enum):
    HOUSE = "House"
    APARTMENT = "Apartment"
    CONDO = "Condo"


class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
