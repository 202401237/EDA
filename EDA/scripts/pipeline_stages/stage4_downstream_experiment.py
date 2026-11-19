"""
Stage 4: Downstream Prediction Experiment & Sensitivity Analysis
Evaluates downstream impact of imputation pipelines on Premium Amount prediction.
"""
import matplotlib
matplotlib.use('Agg')

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import warnings

from sklearn.model_selection import KFold
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import OrdinalEncoder
from sklearn.impute import SimpleImputer
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from sklearn.linear_model import BayesianRidge

warnings.filterwarnings('ignore')
RANDOM_SEED = 42

DATA_PATH = 'EDA_PROJECT/insurance_sample_20000.csv'
OUT_DIR = 'EDA_PROJECT/output'
FIG_DIR = os.path.join(OUT_DIR, 'figures', 'imputation_comparison')
os.makedirs(FIG_DIR, exist_ok=True)

print("="*80)
print("STAGE 4: DOWNSTREAM PREDICTION EXPERIMENT (PREMIUM AMOUNT)")
print("="*80)

df = pd.read_csv(DATA_PATH)
n_rows = len(df)
print(f"Loaded {n_rows:,} rows.")

NUM_COLS = ['Age', 'Annual Income', 'Number of Dependents', 'Health Score',
            'Previous Claims', 'Vehicle Age', 'Credit Score', 'Insurance Duration']
CAT_COLS = ['Gender', 'Marital Status', 'Education Level', 'Occupation',
            'Location', 'Policy Type', 'Customer Feedback', 'Smoking Status',
            'Exercise Frequency', 'Property Type']
TARGET = 'Premium Amount'

# 5-fold cross-validation setup
kf = KFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)

pipelines = [
    'Dummy Median Baseline',
    'Listwise Deletion (Drop Rows)',
    'Simple Median/Mode Imputation',
    'Median/Mode + Missing Indicators',
    'Iterative Imputer (Bayesian Ridge)',
    'Native NaN (HistGradientBoosting)'
]

results = {p: {'mae': [], 'rmse': [], 'r2': []} for p in pipelines}

# Ordinal encode categoricals safely
df_encoded = df.copy()
cat_encoders = {}
for c in CAT_COLS:
    oe = OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)
    non_null_mask = df[c].notna()
    df_encoded.loc[non_null_mask, c] = oe.fit_transform(df.loc[non_null_mask, [c]])
    cat_encoders[c] = oe

print("\nRunning 5-fold cross-validation across all pipelines...")

for fold, (train_idx, val_idx) in enumerate(kf.split(df)):
    train_data = df_encoded.iloc[train_idx].copy()
    val_data = df_encoded.iloc[val_idx].copy()
    
    y_train_full = train_data[TARGET].values
    y_val_full = val_data[TARGET].values
    
    # 1. Dummy Median Baseline
    pred_dummy = np.full(len(val_data), np.median(y_train_full))
    results['Dummy Median Baseline']['mae'].append(mean_absolute_error(y_val_full, pred_dummy))
    results['Dummy Median Baseline']['rmse'].append(np.sqrt(mean_squared_error(y_val_full, pred_dummy)))
    results['Dummy Median Baseline']['r2'].append(r2_score(y_val_full, pred_dummy))
    
    # 2. Listwise Deletion
    complete_train = train_data.dropna(subset=NUM_COLS + CAT_COLS)
    complete_val = val_data.dropna(subset=NUM_COLS + CAT_COLS)
    if len(complete_val) > 0:
        X_tr_drop = complete_train[NUM_COLS + CAT_COLS]
        y_tr_drop = complete_train[TARGET].values
        X_vl_drop = complete_val[NUM_COLS + CAT_COLS]
        y_vl_drop = complete_val[TARGET].values
        
        hgb_drop = HistGradientBoostingRegressor(max_iter=100, random_state=RANDOM_SEED)
        hgb_drop.fit(X_tr_drop, y_tr_drop)
        pred_drop = hgb_drop.predict(X_vl_drop)
        results['Listwise Deletion (Drop Rows)']['mae'].append(mean_absolute_error(y_vl_drop, pred_drop))
        results['Listwise Deletion (Drop Rows)']['rmse'].append(np.sqrt(mean_squared_error(y_vl_drop, pred_drop)))
        results['Listwise Deletion (Drop Rows)']['r2'].append(r2_score(y_vl_drop, pred_drop))
        
    # 3. Simple Median/Mode Imputation
    X_tr_med = train_data[NUM_COLS + CAT_COLS].copy()
    X_vl_med = val_data[NUM_COLS + CAT_COLS].copy()
    for c in NUM_COLS:
        med = X_tr_med[c].median()
        X_tr_med[c] = X_tr_med[c].fillna(med)
        X_vl_med[c] = X_vl_med[c].fillna(med)
    for c in CAT_COLS:
        mode_val = X_tr_med[c].mode().iloc[0]
        X_tr_med[c] = X_tr_med[c].fillna(mode_val)
        X_vl_med[c] = X_vl_med[c].fillna(mode_val)
        
    hgb_med = HistGradientBoostingRegressor(max_iter=100, random_state=RANDOM_SEED)
    hgb_med.fit(X_tr_med, y_train_full)
    pred_med = hgb_med.predict(X_vl_med)
    results['Simple Median/Mode Imputation']['mae'].append(mean_absolute_error(y_val_full, pred_med))
    results['Simple Median/Mode Imputation']['rmse'].append(np.sqrt(mean_squared_error(y_val_full, pred_med)))
    results['Simple Median/Mode Imputation']['r2'].append(r2_score(y_val_full, pred_med))
    
    # 4. Median/Mode + Missing Indicators
    X_tr_ind = X_tr_med.copy()
    X_vl_ind = X_vl_med.copy()
    for c in NUM_COLS + CAT_COLS:
        if train_data[c].isnull().any():
            X_tr_ind[f'missing_{c}'] = train_data[c].isnull().astype(int)
            X_vl_ind[f'missing_{c}'] = val_data[c].isnull().astype(int)
            
    hgb_ind = HistGradientBoostingRegressor(max_iter=100, random_state=RANDOM_SEED)
    hgb_ind.fit(X_tr_ind, y_train_full)
    pred_ind = hgb_ind.predict(X_vl_ind)
    results['Median/Mode + Missing Indicators']['mae'].append(mean_absolute_error(y_val_full, pred_ind))
    results['Median/Mode + Missing Indicators']['rmse'].append(np.sqrt(mean_squared_error(y_val_full, pred_ind)))
    results['Median/Mode + Missing Indicators']['r2'].append(r2_score(y_val_full, pred_ind))
    
    # 5. Iterative Imputer (Bayesian Ridge) on numericals
    it_imp = IterativeImputer(estimator=BayesianRidge(), max_iter=5, random_state=RANDOM_SEED)
    X_tr_it = X_tr_med.copy()
    X_vl_it = X_vl_med.copy()
    X_tr_it[NUM_COLS] = it_imp.fit_transform(train_data[NUM_COLS])
    X_vl_it[NUM_COLS] = it_imp.transform(val_data[NUM_COLS])
    
    hgb_it = HistGradientBoostingRegressor(max_iter=100, random_state=RANDOM_SEED)
    hgb_it.fit(X_tr_it, y_train_full)
    pred_it = hgb_it.predict(X_vl_it)
    results['Iterative Imputer (Bayesian Ridge)']['mae'].append(mean_absolute_error(y_val_full, pred_it))
    results['Iterative Imputer (Bayesian Ridge)']['rmse'].append(np.sqrt(mean_squared_error(y_val_full, pred_it)))
    results['Iterative Imputer (Bayesian Ridge)']['r2'].append(r2_score(y_val_full, pred_it))
    
    # 6. Native NaN Handling (HistGradientBoosting handles raw NaNs directly)
    X_tr_raw = train_data[NUM_COLS + CAT_COLS].copy()
    X_vl_raw = val_data[NUM_COLS + CAT_COLS].copy()
    
    hgb_native = HistGradientBoostingRegressor(max_iter=100, random_state=RANDOM_SEED)
    hgb_native.fit(X_tr_raw, y_train_full)
    pred_native = hgb_native.predict(X_vl_raw)
    results['Native NaN (HistGradientBoosting)']['mae'].append(mean_absolute_error(y_val_full, pred_native))
    results['Native NaN (HistGradientBoosting)']['rmse'].append(np.sqrt(mean_squared_error(y_val_full, pred_native)))
    results['Native NaN (HistGradientBoosting)']['r2'].append(r2_score(y_val_full, pred_native))

# Summary table
downstream_rows = []
for p in pipelines:
    m_mae = np.mean(results[p]['mae'])
    s_mae = np.std(results[p]['mae'])
    m_rmse = np.mean(results[p]['rmse'])
    s_rmse = np.std(results[p]['rmse'])
    m_r2 = np.mean(results[p]['r2'])
    s_r2 = np.std(results[p]['r2'])
    
    downstream_rows.append({
        'pipeline': p,
        'mean_mae': round(m_mae, 2),
        'std_mae': round(s_mae, 2),
        'mean_rmse': round(m_rmse, 2),
        'std_rmse': round(s_rmse, 2),
        'mean_r2': round(m_r2, 4),
        'std_r2': round(s_r2, 4)
    })
    print(f"  {p:<36}: MAE = ${m_mae:7.2f} +/- ${s_mae:5.2f} | RMSE = ${m_rmse:7.2f} | R2 = {m_r2:.4f}")

df_downstream = pd.DataFrame(downstream_rows)
out_csv = os.path.join(OUT_DIR, 'downstream_prediction_results.csv')
df_downstream.to_csv(out_csv, index=False)
print(f"\n[SUCCESS] Exported downstream prediction results to: {out_csv}")

# Generate Visualization: 07_downstream_pipeline_comparison.png
fig, axes = plt.subplots(1, 3, figsize=(18, 5))

# MAE
ax = axes[0]
sns.barplot(data=df_downstream, x='pipeline', y='mean_mae', palette='Blues_r', ax=ax)
ax.set_title("Downstream Prediction: MAE by Imputation Pipeline (Lower is Better)", fontsize=11, fontweight='bold')
ax.set_ylabel("MAE ($)", fontsize=10)
ax.set_xlabel("")
ax.set_xticklabels(ax.get_xticklabels(), rotation=35, ha='right', fontsize=9)

# RMSE
ax = axes[1]
sns.barplot(data=df_downstream, x='pipeline', y='mean_rmse', palette='Reds_r', ax=ax)
ax.set_title("Downstream Prediction: RMSE by Imputation Pipeline (Lower is Better)", fontsize=11, fontweight='bold')
ax.set_ylabel("RMSE ($)", fontsize=10)
ax.set_xlabel("")
ax.set_xticklabels(ax.get_xticklabels(), rotation=35, ha='right', fontsize=9)

# R2
ax = axes[2]
sns.barplot(data=df_downstream, x='pipeline', y='mean_r2', palette='Greens_r', ax=ax)
ax.set_title("Downstream Prediction: R2 Score (Higher is Better)", fontsize=11, fontweight='bold')
ax.set_ylabel("R2 Score", fontsize=10)
ax.set_xlabel("")
ax.set_xticklabels(ax.get_xticklabels(), rotation=35, ha='right', fontsize=9)

plt.tight_layout()
p7 = os.path.join(FIG_DIR, '07_downstream_pipeline_comparison.png')
plt.savefig(p7, dpi=300)
plt.close()
print(f"  Saved: {p7}")

print("="*80)
print("STAGE 4 COMPLETED SUCCESSFULLY")
print("="*80)
