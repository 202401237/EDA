"""
Stage 2: Comprehensive MCAR, MAR, and MNAR Missingness Mechanism Analysis
Sections 4 of Project Specification.
"""
import matplotlib
matplotlib.use('Agg')

import pandas as pd
import numpy as np
import scipy.stats as stats
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from statsmodels.stats.multitest import multipletests
import os
import warnings

warnings.filterwarnings('ignore')

DATA_PATH = 'EDA_PROJECT/insurance_sample_20000.csv'
OUT_DIR = 'EDA_PROJECT/output'
os.makedirs(OUT_DIR, exist_ok=True)

print("="*80)
print("STAGE 2: MCAR, MAR, MNAR STATISTICAL MECHANISM AUDIT")
print("="*80)

df = pd.read_csv(DATA_PATH)
n_rows, n_cols = df.shape
print(f"Loaded dataset with {n_rows:,} rows and {n_cols} columns.")

# Classify columns
NUM_COLS = ['Age', 'Annual Income', 'Number of Dependents', 'Health Score',
            'Previous Claims', 'Vehicle Age', 'Credit Score', 'Insurance Duration']
CAT_COLS = ['Gender', 'Marital Status', 'Education Level', 'Occupation',
            'Location', 'Policy Type', 'Customer Feedback', 'Smoking Status',
            'Exercise Frequency', 'Property Type']
TARGET = 'Premium Amount'
ID_COL = 'id'
DATE_COL = 'Policy Start Date'

# Identify missing columns
missing_cols = [c for c in df.columns if df[c].isnull().sum() > 0]
print(f"\nIdentified {len(missing_cols)} columns with missing values:")
for col in missing_cols:
    cnt = df[col].isnull().sum()
    pct = (cnt / n_rows) * 100
    print(f"  - {col:<22}: {cnt:5,d} rows ({pct:5.2f}%)")

# Fully observed features
fully_obs_num = [c for c in NUM_COLS if df[c].isnull().sum() == 0]
fully_obs_cat = [c for c in CAT_COLS if df[c].isnull().sum() == 0]
print(f"\nFully observed numerical features: {fully_obs_num}")
print(f"Fully observed categorical features: {fully_obs_cat}")

# Step 1: Create Missingness Indicators
null_indicators = pd.DataFrame()
for col in missing_cols:
    null_indicators[f'missing_{col}'] = df[col].isnull().astype(int)

# Step 2: Target Association Tests (MNAR / Informative Test)
target_tests = []
all_pvalues = []
test_labels = []

print("\n" + "="*80)
print("1. TARGET (PREMIUM AMOUNT) STRATIFICATION: MISSING VS OBSERVED")
print("="*80)

for col in missing_cols:
    mask = df[col].isnull()
    y_mis = df.loc[mask, TARGET].dropna()
    y_obs = df.loc[~mask, TARGET].dropna()
    
    t_stat, t_pval = stats.ttest_ind(y_mis, y_obs, equal_var=False)
    mw_stat, mw_pval = stats.mannwhitneyu(y_mis, y_obs, alternative='two-sided')
    
    mean_mis = y_mis.mean()
    mean_obs = y_obs.mean()
    diff = mean_mis - mean_obs
    
    # Cohen's d
    s_pool = np.sqrt(((len(y_mis) - 1) * y_mis.var() + (len(y_obs) - 1) * y_obs.var()) / (len(y_mis) + len(y_obs) - 2))
    cohens_d = diff / s_pool if s_pool > 0 else 0.0
    
    all_pvalues.append(t_pval)
    test_labels.append(f"{col}_target_ttest")
    all_pvalues.append(mw_pval)
    test_labels.append(f"{col}_target_mwu")
    
    target_tests.append({
        'column': col,
        'missing_count': mask.sum(),
        'missing_pct': (mask.sum() / n_rows) * 100,
        'mean_target_missing': mean_mis,
        'mean_target_observed': mean_obs,
        'target_difference': diff,
        'cohens_d': cohens_d,
        'ttest_stat': t_stat,
        'ttest_pval': t_pval,
        'mwu_stat': mw_stat,
        'mwu_pval': mw_pval
    })
    
    print(f"  {col:<20} | Miss Mean: ${mean_mis:8.2f} | Obs Mean: ${mean_obs:8.2f} | Diff: ${diff:+8.2f} | t-pval: {t_pval:.4e} | MW-pval: {mw_pval:.4e}")

# Step 3: Covariate Association Tests (MAR Analysis)
print("\n" + "="*80)
print("2. COVARIATE ASSOCIATION WITH MISSINGNESS INDICATORS")
print("="*80)

covariate_findings = {c: [] for c in missing_cols}

for col in missing_cols:
    ind = null_indicators[f'missing_{col}']
    
    # Fully observed numericals
    for num_cov in fully_obs_num:
        vals_mis = df.loc[ind == 1, num_cov]
        vals_obs = df.loc[ind == 0, num_cov]
        if len(vals_mis) > 0 and len(vals_obs) > 0:
            mw_stat, pval = stats.mannwhitneyu(vals_mis, vals_obs)
            all_pvalues.append(pval)
            test_labels.append(f"{col}_vs_{num_cov}")
            if pval < 0.05:
                covariate_findings[col].append(f"{num_cov} (p={pval:.3e})")
                
    # Fully observed categoricals
    for cat_cov in fully_obs_cat:
        contingency = pd.crosstab(ind, df[cat_cov])
        chi2, pval, dof, _ = stats.chi2_contingency(contingency)
        all_pvalues.append(pval)
        test_labels.append(f"{col}_vs_{cat_cov}")
        if pval < 0.05:
            covariate_findings[col].append(f"{cat_cov} (Chi2 p={pval:.3e})")

# Step 4: Logistic Regression Predictability Test (MAR Verification)
print("\n" + "="*80)
print("3. LOGISTIC REGRESSION: PREDICTING MISSINGNESS FROM OBSERVED DATA")
print("="*80)

# Build feature matrix from fully observed covariates
X_observed = pd.get_dummies(df[fully_obs_num + fully_obs_cat], drop_first=True)

logistic_scores = {}
for col in missing_cols:
    y_ind = null_indicators[f'missing_{col}']
    clf = LogisticRegression(max_iter=1000, penalty='l2', C=1.0, random_state=42)
    clf.fit(X_observed, y_ind)
    probs = clf.predict_proba(X_observed)[:, 1]
    auc = roc_auc_score(y_ind, probs)
    
    # Top predictive features
    coefs = pd.Series(clf.coef_[0], index=X_observed.columns).abs().sort_values(ascending=False)
    top_feats = ", ".join(coefs.head(2).index.tolist())
    logistic_scores[col] = {'auc': auc, 'top_features': top_feats}
    print(f"  {col:<22}: AUC-ROC = {auc:.4f} (Top predictors: {top_feats})")

# Step 5: Missingness Co-occurrence & Correlation Matrix
corr_matrix = null_indicators.corr()
max_phi = {}
for col in missing_cols:
    ind_name = f'missing_{col}'
    sub_corr = corr_matrix[ind_name].drop(ind_name)
    max_phi[col] = sub_corr.abs().max()

# Step 6: Multiple Testing Correction (Benjamini-Hochberg FDR)
reject, pvals_corrected, _, _ = multipletests(all_pvalues, alpha=0.05, method='fdr_bh')
p_corrected_map = dict(zip(test_labels, pvals_corrected))

# Step 7: Little's MCAR Omnibus Distance Test (Validated Pattern Implementation)
print("\n" + "="*80)
print("4. LITTLE'S MCAR OMNIBUS TEST")
print("="*80)

def calculate_littles_mcar(dataframe, numerical_columns):
    """
    Computes Little's MCAR test statistic (d^2) comparing missingness patterns 
    against estimated population grand means.
    """
    data = dataframe[numerical_columns].copy()
    patterns = data.isnull().drop_duplicates()
    n = len(data)
    
    # Impute initial means for covariance estimation
    mu = data.mean()
    sigma = data.cov()
    
    d2 = 0.0
    df_dof = 0
    
    # Filter patterns that have at least 10 rows
    for _, pattern in patterns.iterrows():
        matches = (data.isnull() == pattern).all(axis=1)
        n_p = matches.sum()
        if n_p < 5:
            continue
            
        obs_cols = pattern[~pattern].index.tolist()
        if len(obs_cols) == 0 or len(obs_cols) == len(numerical_columns):
            continue
            
        # Pattern sample mean
        y_bar_p = data.loc[matches, obs_cols].mean()
        mu_p = mu[obs_cols]
        sigma_p = sigma.loc[obs_cols, obs_cols]
        
        diff = (y_bar_p - mu_p).values
        try:
            inv_sigma = np.linalg.pinv(sigma_p.values)
            d2_p = n_p * np.dot(np.dot(diff.T, inv_sigma), diff)
            d2 += d2_p
            df_dof += len(obs_cols)
        except Exception:
            continue
            
    pval = 1.0 - stats.chi2.cdf(d2, max(df_dof, 1))
    return d2, df_dof, pval

d2_stat, dof, mcar_pval = calculate_littles_mcar(df, [c for c in NUM_COLS if df[c].isnull().any()])
print(f"Little's MCAR Test: Chi2 Distance d^2 = {d2_stat:.2f}, dof = {dof}, p-value = {mcar_pval:.4e}")
if mcar_pval < 0.05:
    print("Inference: Reject H0 (MCAR rejected at alpha=0.05). Data shows evidence of MAR/MNAR.")
else:
    print("Inference: Fail to reject H0 (Consistent with MCAR).")

# Step 8: Assemble Per-Column Classification & CSV Export
summary_rows = []

for t in target_tests:
    col = t['column']
    raw_ttest_p = t['ttest_pval']
    adj_ttest_p = p_corrected_map.get(f"{col}_target_ttest", raw_ttest_p)
    raw_mw_p = t['mwu_pval']
    adj_mw_p = p_corrected_map.get(f"{col}_target_mwu", raw_mw_p)
    
    auc = logistic_scores[col]['auc']
    cov_str = "; ".join(covariate_findings[col]) if covariate_findings[col] else "None significant"
    max_r = max_phi[col]
    
    # Classification logic based on empirical evidence
    if adj_ttest_p < 0.01:
        tentative = "MNAR / Informative"
        conf = "High"
        expl = f"Missingness correlates strongly with Premium Amount (Diff: ${t['target_difference']:+.2f}, adj p={adj_ttest_p:.2e}). Actuarial self-selection or rating omission."
    elif len(covariate_findings[col]) > 0 or auc > 0.55:
        tentative = "MAR (Missing at Random)"
        conf = "Moderate"
        expl = "Missingness associates with observed covariates but weakly with target."
    else:
        tentative = "Inconclusive (Likely MCAR)"
        conf = "Moderate"
        expl = "No strong covariate association or target pricing difference detected."
        
    limits = "Observed sample data cannot definitively rule out unobserved confounding factors without ground-truth collection audit."
    needed_info = "Audited underwriting forms, customer application drop-off logs, agent default-handling policy."
    
    summary_rows.append({
        'column_name': col,
        'missing_count': t['missing_count'],
        'missing_percentage': round(t['missing_pct'], 2),
        'mean_target_missing': round(t['mean_target_missing'], 2),
        'mean_target_observed': round(t['mean_target_observed'], 2),
        'target_difference': round(t['target_difference'], 2),
        'cohens_d': round(t['cohens_d'], 4),
        'target_pval_ttest_raw': t['ttest_pval'],
        'target_pval_ttest_adj': adj_ttest_p,
        'target_pval_mwu_raw': t['mwu_pval'],
        'target_pval_mwu_adj': adj_mw_p,
        'logistic_auc_roc': round(auc, 4),
        'max_cooccurrence_phi': round(max_r, 4),
        'significant_covariates': cov_str,
        'tentative_mechanism': tentative,
        'confidence_level': conf,
        'possible_explanation': expl,
        'limitations': limits,
        'additional_info_required': needed_info
    })

res_df = pd.DataFrame(summary_rows)
out_csv = os.path.join(OUT_DIR, 'missingness_mechanism_analysis.csv')
res_df.to_csv(out_csv, index=False)
print(f"\n[SUCCESS] Exported mechanism analysis to: {out_csv}")
print("="*80)
print(res_df[['column_name', 'missing_percentage', 'target_difference', 'logistic_auc_roc', 'tentative_mechanism', 'confidence_level']].to_string(index=False))
print("="*80)
