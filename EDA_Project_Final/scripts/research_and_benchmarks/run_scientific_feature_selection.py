import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, f1_score, balanced_accuracy_score
from sklearn.ensemble import HistGradientBoostingRegressor, HistGradientBoostingClassifier, RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import PoissonRegressor
from sklearn.inspection import permutation_importance
import warnings

warnings.filterwarnings('ignore')
RANDOM_SEED = 42

def run_scientific_analysis():
    sample_path = 'EDA_PROJECT/insurance_sample_20000.csv'
    if not os.path.exists(sample_path):
        sample_path = 'insurance_sample_20000.csv'
    df = pd.read_csv(sample_path)
    
    print("="*80)
    print("SCIENTIFIC FEATURE SELECTION EXPERIMENTAL AUDIT")
    print("="*80)
    
    # =========================================================================
    # 1. HEALTH SCORE
    # =========================================================================
    print("\n" + "="*50)
    print("1. TARGET: HEALTH SCORE (Continuous Regression)")
    print("="*50)
    df_hs = df.dropna(subset=['Health Score']).copy()
    candidate_hs = [
        'Age', 'Smoking Status', 'Exercise Frequency', 'Gender',
        'Annual Income', 'Credit Score', 'Occupation', 'Education Level',
        'Number of Dependents', 'Location', 'Property Type', 'Insurance Duration'
    ]
    
    # Univariate relationships
    print("\n--- Univariate Correlations / Group Means with Health Score ---")
    for col in candidate_hs:
        if df_hs[col].dtype in ['float64', 'int64']:
            r = df_hs['Health Score'].corr(df_hs[col])
            print(f"  {col:<22}: Pearson r = {r:+.5f}")
        else:
            means = df_hs.groupby(col)['Health Score'].mean()
            std_range = means.max() - means.min()
            print(f"  {col:<22}: Group Means range delta = {std_range:.4f} (min={means.min():.2f}, max={means.max():.2f})")
            
    # Train / Test split
    X_hs_raw = df_hs[candidate_hs].copy()
    # Fill upstream predictors using safe medians/modes on training only
    X_tr_raw, X_te_raw, y_tr_hs, y_te_hs = train_test_split(X_hs_raw, df_hs['Health Score'], test_size=0.2, random_state=RANDOM_SEED)
    
    # Simple median baseline
    med_pred = np.full_like(y_te_hs, y_tr_hs.median())
    print(f"\nBaseline Median ({y_tr_hs.median():.2f}): MAE = {mean_absolute_error(y_te_hs, med_pred):.4f}, RMSE = {np.sqrt(mean_squared_error(y_te_hs, med_pred)):.4f}, R2 = {r2_score(y_te_hs, med_pred):.5f}")
    
    # Full Model
    X_tr_enc = pd.get_dummies(X_tr_raw, drop_first=True)
    X_te_enc = pd.get_dummies(X_te_raw, drop_first=True).reindex(columns=X_tr_enc.columns, fill_value=0)
    # Fill any nulls in predictor train
    for c in X_tr_enc.columns:
        if X_tr_enc[c].isnull().sum() > 0:
            med = X_tr_enc[c].median()
            X_tr_enc[c] = X_tr_enc[c].fillna(med)
            X_te_enc[c] = X_te_enc[c].fillna(med)
            
    hgb_hs = HistGradientBoostingRegressor(max_iter=100, random_state=RANDOM_SEED)
    hgb_hs.fit(X_tr_enc, y_tr_hs)
    full_preds = hgb_hs.predict(X_te_enc)
    full_mae = mean_absolute_error(y_te_hs, full_preds)
    full_r2 = r2_score(y_te_hs, full_preds)
    print(f"Full Model (All 12 Features): MAE = {full_mae:.4f}, RMSE = {np.sqrt(mean_squared_error(y_te_hs, full_preds)):.4f}, R2 = {full_r2:.5f}")
    
    # Permutation importance
    p_imp = permutation_importance(hgb_hs, X_te_enc, y_te_hs, n_repeats=5, random_state=RANDOM_SEED)
    print("\nPermutation Importance (R2 decrease upon shuffling):")
    sorted_idx = p_imp.importances_mean.argsort()[::-1]
    for idx in sorted_idx[:8]:
        print(f"  {X_tr_enc.columns[idx]:<25}: {p_imp.importances_mean[idx]:+.5f} +/- {p_imp.importances_std[idx]:.5f}")

    # =========================================================================
    # 2. CREDIT SCORE
    # =========================================================================
    print("\n" + "="*50)
    print("2. TARGET: CREDIT SCORE (Continuous Regression)")
    print("="*50)
    df_cs = df.dropna(subset=['Credit Score']).copy()
    candidate_cs = [
        'Annual Income', 'Age', 'Education Level', 'Occupation',
        'Number of Dependents', 'Marital Status', 'Property Type',
        'Location', 'Insurance Duration', 'Previous Claims'
    ]
    
    print("\n--- Univariate Correlations / Group Means with Credit Score ---")
    for col in candidate_cs:
        if df_cs[col].dtype in ['float64', 'int64']:
            r = df_cs['Credit Score'].corr(df_cs[col])
            print(f"  {col:<22}: Pearson r = {r:+.5f}")
        else:
            means = df_cs.groupby(col)['Credit Score'].mean()
            std_range = means.max() - means.min()
            print(f"  {col:<22}: Group Means range delta = {std_range:.2f} (min={means.min():.1f}, max={means.max():.1f})")
            
    X_cs_raw = df_cs[candidate_cs].copy()
    X_tr_cs, X_te_cs, y_tr_cs, y_te_cs = train_test_split(X_cs_raw, df_cs['Credit Score'], test_size=0.2, random_state=RANDOM_SEED)
    
    med_cs = y_tr_cs.median()
    base_cs_pred = np.full_like(y_te_cs, med_cs)
    print(f"\nBaseline Median ({med_cs:.1f}): MAE = {mean_absolute_error(y_te_cs, base_cs_pred):.2f}, RMSE = {np.sqrt(mean_squared_error(y_te_cs, base_cs_pred)):.2f}, R2 = {r2_score(y_te_cs, base_cs_pred):.5f}")
    
    X_tr_cs_enc = pd.get_dummies(X_tr_cs, drop_first=True)
    X_te_cs_enc = pd.get_dummies(X_te_cs, drop_first=True).reindex(columns=X_tr_cs_enc.columns, fill_value=0)
    for c in X_tr_cs_enc.columns:
        if X_tr_cs_enc[c].isnull().sum() > 0:
            med = X_tr_cs_enc[c].median()
            X_tr_cs_enc[c] = X_tr_cs_enc[c].fillna(med)
            X_te_cs_enc[c] = X_te_cs_enc[c].fillna(med)
            
    hgb_cs = HistGradientBoostingRegressor(max_iter=100, random_state=RANDOM_SEED)
    hgb_cs.fit(X_tr_cs_enc, y_tr_cs)
    preds_cs = hgb_cs.predict(X_te_cs_enc)
    print(f"Full Model (All 10 Features): MAE = {mean_absolute_error(y_te_cs, preds_cs):.2f}, RMSE = {np.sqrt(mean_squared_error(y_te_cs, preds_cs)):.2f}, R2 = {r2_score(y_te_cs, preds_cs):.5f}")
    
    # Ablation: check if Previous Claims or Duration add value
    for drop_col in ['Previous Claims', 'Insurance Duration', 'Location', 'Number of Dependents']:
        cols_sub = [c for c in candidate_cs if c != drop_col]
        X_sub_tr = pd.get_dummies(X_tr_cs[cols_sub], drop_first=True)
        X_sub_te = pd.get_dummies(X_te_cs[cols_sub], drop_first=True).reindex(columns=X_sub_tr.columns, fill_value=0)
        for c in X_sub_tr.columns:
            if X_sub_tr[c].isnull().sum() > 0:
                med = X_sub_tr[c].median()
                X_sub_tr[c] = X_sub_tr[c].fillna(med)
                X_sub_te[c] = X_sub_te[c].fillna(med)
        m_sub = HistGradientBoostingRegressor(max_iter=100, random_state=RANDOM_SEED).fit(X_sub_tr, y_tr_cs)
        p_sub = m_sub.predict(X_sub_te)
        print(f"  Without {drop_col:<20}: MAE = {mean_absolute_error(y_te_cs, p_sub):.2f}, R2 = {r2_score(y_te_cs, p_sub):.5f}")

    # =========================================================================
    # 3. OCCUPATION
    # =========================================================================
    print("\n" + "="*50)
    print("3. TARGET: OCCUPATION (Multiclass Classification)")
    print("="*50)
    df_occ = df.dropna(subset=['Occupation']).copy()
    candidate_occ = [
        'Annual Income', 'Education Level', 'Age', 'Location',
        'Property Type', 'Gender', 'Marital Status', 'Number of Dependents', 'Credit Score'
    ]
    
    print("\n--- Occupation Class Distribution in Observed Records ---")
    print(df_occ['Occupation'].value_counts(normalize=True) * 100)
    
    X_tr_occ_r, X_te_occ_r, y_tr_occ, y_te_occ = train_test_split(df_occ[candidate_occ], df_occ['Occupation'], test_size=0.2, stratify=df_occ['Occupation'], random_state=RANDOM_SEED)
    maj_cls = y_tr_occ.mode()[0]
    maj_preds = [maj_cls] * len(y_te_occ)
    print(f"\nMajority Baseline ('{maj_cls}'): Accuracy = {accuracy_score(y_te_occ, maj_preds):.4f}, Macro-F1 = {f1_score(y_te_occ, maj_preds, average='macro'):.4f}")
    
    X_tr_occ_enc = pd.get_dummies(X_tr_occ_r, drop_first=True)
    X_te_occ_enc = pd.get_dummies(X_te_occ_r, drop_first=True).reindex(columns=X_tr_occ_enc.columns, fill_value=0)
    for c in X_tr_occ_enc.columns:
        if X_tr_occ_enc[c].isnull().sum() > 0:
            med = X_tr_occ_enc[c].median()
            X_tr_occ_enc[c] = X_tr_occ_enc[c].fillna(med)
            X_te_occ_enc[c] = X_te_occ_enc[c].fillna(med)
            
    clf_occ = HistGradientBoostingClassifier(max_iter=100, random_state=RANDOM_SEED)
    clf_occ.fit(X_tr_occ_enc, y_tr_occ)
    preds_occ = clf_occ.predict(X_te_occ_enc)
    print(f"Full Classifier (All Candidate Features): Accuracy = {accuracy_score(y_te_occ, preds_occ):.4f}, Balanced Acc = {balanced_accuracy_score(y_te_occ, preds_occ):.4f}, Macro-F1 = {f1_score(y_te_occ, preds_occ, average='macro'):.4f}")

    # =========================================================================
    # 4. PREVIOUS CLAIMS
    # =========================================================================
    print("\n" + "="*50)
    print("4. TARGET: PREVIOUS CLAIMS (Count Prediction)")
    print("="*50)
    df_pc = df.dropna(subset=['Previous Claims']).copy()
    candidate_pc = [
        'Vehicle Age', 'Insurance Duration', 'Age', 'Location',
        'Policy Type', 'Occupation', 'Annual Income', 'Credit Score',
        'Gender', 'Smoking Status', 'Health Score'
    ]
    
    print("\n--- Univariate Correlations with Previous Claims ---")
    for col in candidate_pc:
        if df_pc[col].dtype in ['float64', 'int64']:
            r = df_pc['Previous Claims'].corr(df_pc[col])
            print(f"  {col:<22}: Pearson r = {r:+.5f}")
            
    X_tr_pc_r, X_te_pc_r, y_tr_pc, y_te_pc = train_test_split(df_pc[candidate_pc], df_pc['Previous Claims'], test_size=0.2, random_state=RANDOM_SEED)
    
    med_pc = y_tr_pc.median()
    base_pc_preds = np.full_like(y_te_pc, med_pc)
    print(f"\nBaseline Median (1.0): MAE = {mean_absolute_error(y_te_pc, base_pc_preds):.4f}, RMSE = {np.sqrt(mean_squared_error(y_te_pc, base_pc_preds)):.4f}")
    
    X_tr_pc_enc = pd.get_dummies(X_tr_pc_r, drop_first=True)
    X_te_pc_enc = pd.get_dummies(X_te_pc_r, drop_first=True).reindex(columns=X_tr_pc_enc.columns, fill_value=0)
    for c in X_tr_pc_enc.columns:
        if X_tr_pc_enc[c].isnull().sum() > 0:
            med = X_tr_pc_enc[c].median()
            X_tr_pc_enc[c] = X_tr_pc_enc[c].fillna(med)
            X_te_pc_enc[c] = X_te_pc_enc[c].fillna(med)
            
    poi = PoissonRegressor(max_iter=200).fit(X_tr_pc_enc, y_tr_pc)
    poi_preds = poi.predict(X_te_pc_enc)
    print(f"Poisson Regressor:     MAE = {mean_absolute_error(y_te_pc, poi_preds):.4f}, RMSE = {np.sqrt(mean_squared_error(y_te_pc, poi_preds)):.4f}")
    print(f"Poisson (Rounded):     MAE = {mean_absolute_error(y_te_pc, np.round(poi_preds)):.4f}, RMSE = {np.sqrt(mean_squared_error(y_te_pc, np.round(poi_preds))):.4f}")

if __name__ == '__main__':
    run_scientific_analysis()
