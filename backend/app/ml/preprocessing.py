from typing import Dict, List
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Frontend to Dataset Column Mapping
FEATURE_MAPPING: Dict[str, str] = {
    "age": "Age",
    "gender": "Gender",
    "annualIncome": "Annual Income",
    "maritalStatus": "Marital Status",
    "numberOfDependents": "Number of Dependents",
    "educationLevel": "Education Level",
    "occupation": "Occupation",
    "healthScore": "Health Score",
    "location": "Location",
    "policyType": "Policy Type",
    "previousClaims": "Previous Claims",
    "vehicleAge": "Vehicle Age",
    "creditScore": "Credit Score",
    "insuranceDuration": "Insurance Duration",
    "smokingStatus": "Smoking Status",
    "exerciseFrequency": "Exercise Frequency",
    "propertyType": "Property Type",
}

NUMERICAL_FEATURES: List[str] = [
    "Age",
    "Annual Income",
    "Number of Dependents",
    "Health Score",
    "Previous Claims",
    "Vehicle Age",
    "Credit Score",
    "Insurance Duration",
]

CATEGORICAL_FEATURES: List[str] = [
    "Gender",
    "Marital Status",
    "Education Level",
    "Occupation",
    "Location",
    "Policy Type",
    "Smoking Status",
    "Exercise Frequency",
    "Property Type",
]

TARGET_COLUMN: str = "Premium Amount"


def build_preprocessor(scale_numerical: bool = True) -> ColumnTransformer:
    """
    Constructs a leakage-free Scikit-Learn ColumnTransformer for numerical
    and categorical features.
    
    - Handles missing numerical values via Median Imputation.
    - Handles missing categorical values via Most Frequent / Mode Imputation.
    - One-hot encodes categorical values with unknown-category tolerance.
    """
    num_steps = [("imputer", SimpleImputer(strategy="median"))]
    if scale_numerical:
        num_steps.append(("scaler", StandardScaler()))

    num_pipeline = Pipeline(steps=num_steps)

    cat_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERICAL_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )

    return preprocessor
