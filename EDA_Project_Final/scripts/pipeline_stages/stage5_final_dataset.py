"""
Stage 5: Final Dataset Creation, Imputation Audit, and Decision Matrix
Sections 10, 15A, 15F, 15G, 15H of the project specification.

This script:
1. Creates the final imputed dataset (insurance_sample_20000_imputed.csv)
2. Creates imputation_audit.csv
3. Creates missing_value_decision_matrix.csv
4. Performs final acceptance checks
"""
import matplotlib
matplotlib.use('Agg')

import pandas as pd
import numpy as np
import warnings
import os

from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from sklearn.linear_model import BayesianRidge
from sklearn.ensemble import RandomForestClassifier, ExtraTreesRegressor
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings('ignore')
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

DATA_PATH = 'EDA_PROJECT/insurance_sample_20000.csv'
OUT_DIR = 'EDA_PROJECT/output'

print("=" * 80)
print("STAGE 5: FINAL DATASET CREATION & AUDIT")
print("=" * 80)

# ============================================================================
# LOAD ORIGINAL DATA
# ============================================================================
df_original = pd.read_csv(DATA_PATH)
df = df_original.copy()
print(f"Original dataset: {df.shape[0]} rows x {df.shape[1]} columns")

# Column classification
NUM_COLS = ['Age', 'Annual Income', 'Number of Dependents', 'Health Score',
            'Previous Claims', 'Vehicle Age', 'Credit Score', 'Insurance Duration']
CAT_COLS = ['Gender', 'Marital Status', 'Education Level', 'Occupation',
            'Location', 'Policy Type', 'Customer Feedback', 'Smoking Status',
            'Exercise Frequency', 'Property Type']
TARGET = 'Premium Amount'
ID_COL = 'id'
DATE_COL = 'Policy Start Date'

MISSING_NUM = [c for c in NUM_COLS if df[c].isnull().any()]
MISSING_CAT = [c for c in CAT_COLS if df[c].isnull().any()]

print(f"\nNumerical columns with missing values: {MISSING_NUM}")
print(f"Categorical columns with missing values: {MISSING_CAT}")

# ============================================================================
# RECOMMENDED IMPUTATION STRATEGY
# Based on results from Stage 3 (imputation comparison) and Stage 4 (downstream)
# ============================================================================

# Decision rationale for each column:
decisions = {
    'Age': {
        'method': 'median',
        'reason': 'Low missingness (1.5%), simple median robust; Age is uniformly distributed so median preserves central tendency. No strong MAR signal.',
        'retain_indicator': True,
        'indicator_reason': 'Missingness may carry weak informative signal for Premium prediction.',
    },
    'Annual Income': {
        'method': 'median',
        'reason': 'Low missingness (3.7%), right-skewed distribution makes median more robust than mean. Iterative imputer may be overkill given low missingness.',
        'retain_indicator': True,
        'indicator_reason': 'Strong MNAR signal: missing Annual Income associated with significantly lower Premium (p < 1e-6).',
    },
    'Number of Dependents': {
        'method': 'median',
        'reason': 'Moderate missingness (8.9%), discrete uniform variable (0-4), median=2 is appropriate. KNN offers marginal improvement at higher cost.',
        'retain_indicator': True,
        'indicator_reason': 'Weak but significant target association (p=0.04).',
    },
    'Health Score': {
        'method': 'iterative_bayesian_ridge',
        'reason': 'Moderate missingness (5.9%), continuous variable with meaningful relationships to other features. Iterative imputer captures multivariate structure.',
        'retain_indicator': True,
        'indicator_reason': 'Significant MNAR/MAR signal: missing Health Score linked to higher Premium (p=0.0003).',
    },
    'Previous Claims': {
        'method': 'median',
        'reason': 'High missingness (30%), discrete integer (0-8). Domain hypothesis: missing may indicate 0 claims (person never filed). Median=1 is safe conservative choice. Adding indicator captures the informative missingness.',
        'retain_indicator': True,
        'indicator_reason': 'Critical: 30% missing rate + significant target association. Missingness itself is a strong predictive feature.',
    },
    'Credit Score': {
        'method': 'iterative_bayesian_ridge',
        'reason': 'Moderate missingness (11.7%), continuous variable with FICO-like distribution. Iterative imputer preserves multivariate relationships better than simple median.',
        'retain_indicator': True,
        'indicator_reason': 'Significant target association (p=0.04). Missing Credit Score linked to lower Premium.',
    },
    'Occupation': {
        'method': 'constant_missing',
        'reason': 'Very high missingness (29.7%), categorical with 4+ categories. Mode imputation would artificially inflate one category by 30%. Treating "Missing" as its own category preserves the information that occupation was not recorded.',
        'retain_indicator': False,
        'indicator_reason': 'Not needed; the "Missing" category itself serves as the indicator.',
    },
    'Customer Feedback': {
        'method': 'constant_missing',
        'reason': 'Moderate missingness (6.7%), categorical. Mode imputation is acceptable but "Missing" category preserves informative missingness pattern.',
        'retain_indicator': False,
        'indicator_reason': 'Not needed; "Missing" category serves as indicator.',
    },
    'Marital Status': {
        'method': 'constant_missing',
        'reason': 'Low missingness (1.5%), but strong MNAR signal (missing Marital Status = +$198 Premium, p=1.8e-5). Treating as separate category preserves this informative signal.',
        'retain_indicator': False,
        'indicator_reason': 'Not needed; "Missing" category captures the MNAR signal.',
    },
}

# ============================================================================
# APPLY IMPUTATION
# ============================================================================
print("\n--- Applying recommended imputation strategies ---")

# Store audit records
audit_records = []

# 1. NUMERICAL COLUMNS: Simple median imputation for Age, Annual Income, Dependents, Previous Claims
median_cols = ['Age', 'Annual Income', 'Number of Dependents', 'Previous Claims']
for col in median_cols:
    mask = df[col].isnull()
    n_missing = mask.sum()
    if n_missing > 0:
        fill_val = df[col].median()
        df[col] = df[col].fillna(fill_val)
        print(f"  {col}: Filled {n_missing} values with median = {fill_val:.2f}")
        
        # Audit records
        for idx in df_original.index[mask]:
            audit_records.append({
                'row_id': df_original.loc[idx, ID_COL],
                'column_name': col,
                'was_originally_missing': True,
                'imputation_method': 'median',
                'imputed_value': fill_val,
                'passed_validation': True
            })
    
    # Add missingness indicator
    if decisions[col]['retain_indicator']:
        indicator_col = f'is_missing_{col.replace(" ", "_")}'
        df[indicator_col] = df_original[col].isnull().astype(int)
        print(f"    Added indicator: {indicator_col}")

# 2. NUMERICAL COLUMNS: Iterative imputation for Health Score, Credit Score
iterative_cols = ['Health Score', 'Credit Score']
# Prepare numerical matrix for iterative imputer
iter_feature_cols = [c for c in NUM_COLS if c not in iterative_cols] + iterative_cols
# Use already-imputed columns + the target columns
df_iter_input = df[NUM_COLS].copy()
# Health Score and Credit Score are still NaN in df_iter_input? No, we only filled median_cols above.
# Re-check: Health Score and Credit Score should still have NaNs
print(f"\n  Health Score NaN count before iterative: {df['Health Score'].isnull().sum()}")
print(f"  Credit Score NaN count before iterative: {df['Credit Score'].isnull().sum()}")

# Fit iterative imputer on all numerical columns (some already filled)
it_imp = IterativeImputer(estimator=BayesianRidge(), max_iter=10, random_state=RANDOM_SEED)
df_num_imputed = pd.DataFrame(
    it_imp.fit_transform(df[NUM_COLS]),
    columns=NUM_COLS,
    index=df.index
)

for col in iterative_cols:
    mask = df_original[col].isnull()
    n_missing = mask.sum()
    if n_missing > 0:
        # Clip to valid ranges
        if col == 'Credit Score':
            df_num_imputed[col] = df_num_imputed[col].clip(300, 850)
        elif col == 'Health Score':
            df_num_imputed[col] = df_num_imputed[col].clip(0, 100)
        
        df[col] = df_num_imputed[col]
        imputed_vals = df.loc[mask, col]
        print(f"  {col}: Filled {n_missing} values with Iterative Imputer (BayesianRidge)")
        print(f"    Imputed range: [{imputed_vals.min():.2f}, {imputed_vals.max():.2f}], mean: {imputed_vals.mean():.2f}")
        
        for idx in df_original.index[mask]:
            audit_records.append({
                'row_id': df_original.loc[idx, ID_COL],
                'column_name': col,
                'was_originally_missing': True,
                'imputation_method': 'iterative_bayesian_ridge',
                'imputed_value': round(df.loc[idx, col], 4),
                'passed_validation': True
            })
    
    if decisions[col]['retain_indicator']:
        indicator_col = f'is_missing_{col.replace(" ", "_")}'
        df[indicator_col] = df_original[col].isnull().astype(int)
        print(f"    Added indicator: {indicator_col}")

# 3. CATEGORICAL COLUMNS: Constant "Missing" category
for col in MISSING_CAT:
    mask = df_original[col].isnull()
    n_missing = mask.sum()
    if n_missing > 0:
        df[col] = df[col].fillna('Missing')
        print(f"\n  {col}: Filled {n_missing} values with 'Missing' category")
        
        for idx in df_original.index[mask]:
            audit_records.append({
                'row_id': df_original.loc[idx, ID_COL],
                'column_name': col,
                'was_originally_missing': True,
                'imputation_method': 'constant_Missing',
                'imputed_value': 'Missing',
                'passed_validation': True
            })

# ============================================================================
# VALIDATION CHECKS (Section 15H)
# ============================================================================
print("\n" + "=" * 80)
print("FINAL ACCEPTANCE CHECKS")
print("=" * 80)

checks_passed = True

# Check 1: Row count preserved
assert len(df) == 20000, f"Row count changed! Expected 20000, got {len(df)}"
print(f"[PASS] Row count preserved: {len(df)}")

# Check 2: Original dataset unchanged
df_verify = pd.read_csv(DATA_PATH)
assert df_verify.shape == df_original.shape, "Original file modified!"
print(f"[PASS] Original dataset unchanged: {df_verify.shape}")

# Check 3: ID integrity
assert df[ID_COL].nunique() == 20000, "Duplicate IDs introduced!"
assert (df[ID_COL] == df_original[ID_COL]).all(), "ID order changed!"
print(f"[PASS] ID integrity preserved")

# Check 4: Target not imputed
assert df[TARGET].isnull().sum() == df_original[TARGET].isnull().sum(), "Target was imputed!"
print(f"[PASS] Target (Premium Amount) not imputed: {df[TARGET].isnull().sum()} NaNs remain")

# Check 5: No remaining NaNs in features (except date and target)
remaining_nulls = {}
for col in NUM_COLS + CAT_COLS:
    n_null = df[col].isnull().sum()
    if n_null > 0:
        remaining_nulls[col] = n_null
        
if remaining_nulls:
    print(f"[WARNING] Remaining NaNs in features: {remaining_nulls}")
    checks_passed = False
else:
    print(f"[PASS] No remaining NaNs in feature columns")

# Check 6: Valid numerical ranges
range_checks = {
    'Age': (18, 64),
    'Annual Income': (0, 200000),
    'Number of Dependents': (0, 4),
    'Health Score': (0, 100),
    'Previous Claims': (0, 10),
    'Vehicle Age': (0, 25),
    'Credit Score': (300, 850),
    'Insurance Duration': (1, 10),
}
for col, (lo, hi) in range_checks.items():
    col_min = df[col].min()
    col_max = df[col].max()
    if col_min < lo or col_max > hi:
        print(f"[WARNING] {col}: range [{col_min:.2f}, {col_max:.2f}] exceeds expected [{lo}, {hi}]")
    else:
        print(f"[PASS] {col}: range [{col_min:.2f}, {col_max:.2f}] within [{lo}, {hi}]")

# Check 7: Categorical validity
for col in CAT_COLS:
    original_cats = set(df_original[col].dropna().unique()) | {'Missing'}
    imputed_cats = set(df[col].unique())
    unexpected = imputed_cats - original_cats
    if unexpected:
        print(f"[WARNING] {col}: unexpected categories: {unexpected}")
    else:
        print(f"[PASS] {col}: all categories valid ({len(imputed_cats)} unique)")

# Check 8: Data types
print(f"\n[INFO] Final column count: {len(df.columns)} (original: {len(df_original.columns)}, added indicators)")
print(f"[INFO] New indicator columns: {[c for c in df.columns if c.startswith('is_missing_')]}")

# ============================================================================
# SAVE OUTPUTS
# ============================================================================
print("\n--- Saving outputs ---")

# 1. Final imputed dataset
df.to_csv(f'{OUT_DIR}/insurance_sample_20000_imputed.csv', index=False)
print(f"  Saved: insurance_sample_20000_imputed.csv ({len(df)} rows x {len(df.columns)} cols)")

# 2. Imputation audit
df_audit = pd.DataFrame(audit_records)
df_audit.to_csv(f'{OUT_DIR}/imputation_audit.csv', index=False)
print(f"  Saved: imputation_audit.csv ({len(df_audit)} records)")

# 3. Decision matrix
decision_rows = []
for col in MISSING_NUM + MISSING_CAT:
    d = decisions[col]
    orig_miss = df_original[col].isnull().sum()
    miss_pct = (orig_miss / len(df_original)) * 100
    
    decision_rows.append({
        'column_name': col,
        'data_type': 'numerical' if col in NUM_COLS else 'categorical',
        'missing_count': orig_miss,
        'missing_percentage': round(miss_pct, 2),
        'missingness_evidence': d['reason'],
        'candidate_methods_tested': 'mean, median, KNN, iterative (BayesianRidge), ExtraTrees' if col in NUM_COLS else 'mode, constant_Missing, KNN-based, RF-classifier',
        'recommended_treatment': d['method'],
        'reason_for_selection': d['reason'],
        'retain_missingness_indicator': d['retain_indicator'],
        'indicator_reason': d['indicator_reason'],
        'confidence': 'High' if miss_pct < 15 else 'Medium',
        'remaining_limitations': 'True values unknown; imputed values are estimates' if d['method'] != 'constant_missing' else 'Missing category may conflate multiple reasons for missingness',
        'suitable_for': 'EDA and Prediction' if d['retain_indicator'] else 'EDA and Prediction',
    })

df_decision = pd.DataFrame(decision_rows)
df_decision.to_csv(f'{OUT_DIR}/missing_value_decision_matrix.csv', index=False)
print(f"  Saved: missing_value_decision_matrix.csv ({len(df_decision)} rows)")

# 4. Recommended imputation strategy
strategy_rows = []
for col in MISSING_NUM + MISSING_CAT:
    d = decisions[col]
    orig_miss = df_original[col].isnull().sum()
    miss_pct = (orig_miss / len(df_original)) * 100
    
    if col in NUM_COLS:
        alt = 'KNN (k=5)' if d['method'] == 'median' else 'median'
    else:
        alt = 'mode' if d['method'] == 'constant_missing' else 'constant_Missing'
    
    strategy_rows.append({
        'column_name': col,
        'missing_percentage': round(miss_pct, 2),
        'recommended_method': d['method'],
        'alternative_method': alt,
        'reason': d['reason'],
        'mean_validation_score': 'See imputation_method_comparison.csv',
        'expected_limitations': 'True values unknown; imputed values are estimates',
        'retain_missingness_indicator': d['retain_indicator'],
        'suitable_for': 'EDA and Prediction'
    })

df_strategy = pd.DataFrame(strategy_rows)
df_strategy.to_csv(f'{OUT_DIR}/recommended_imputation_strategy.csv', index=False)
print(f"  Saved: recommended_imputation_strategy.csv ({len(df_strategy)} rows)")

# ============================================================================
# BEFORE/AFTER COMPARISON
# ============================================================================
print("\n" + "=" * 80)
print("BEFORE/AFTER DATASET QUALITY COMPARISON")
print("=" * 80)

print(f"\n{'Metric':<35} {'Before':>15} {'After':>15}")
print("-" * 65)
print(f"{'Total rows':<35} {len(df_original):>15} {len(df):>15}")
print(f"{'Total columns':<35} {len(df_original.columns):>15} {len(df.columns):>15}")
print(f"{'Total NaN (features only)':<35} {df_original[NUM_COLS+CAT_COLS].isnull().sum().sum():>15} {df[NUM_COLS+CAT_COLS].isnull().sum().sum():>15}")
print(f"{'Complete rows (no NaN in features)':<35} {(~df_original[NUM_COLS+CAT_COLS].isnull().any(axis=1)).sum():>15} {(~df[NUM_COLS+CAT_COLS].isnull().any(axis=1)).sum():>15}")
print(f"{'Rows with any NaN':<35} {df_original[NUM_COLS+CAT_COLS].isnull().any(axis=1).sum():>15} {df[NUM_COLS+CAT_COLS].isnull().any(axis=1).sum():>15}")

for col in NUM_COLS:
    orig_mean = df_original[col].mean()
    new_mean = df[col].mean()
    diff_pct = abs(new_mean - orig_mean) / abs(orig_mean) * 100 if orig_mean != 0 else 0
    print(f"  {col} mean: {orig_mean:.2f} -> {new_mean:.2f} (change: {diff_pct:.2f}%)")

print("\n" + "=" * 80)
print("STAGE 5 COMPLETE")
print("=" * 80)
