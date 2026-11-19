import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, f1_score, accuracy_score, balanced_accuracy_score
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, HistGradientBoostingRegressor, HistGradientBoostingClassifier
from sklearn.linear_model import PoissonRegressor
import warnings
warnings.filterwarnings('ignore')

def evaluate_models():
    sample_path = 'EDA_PROJECT/insurance_sample_20000.csv'
    df = pd.read_csv(sample_path)
    
    print("="*80)
    print("EMPIRICAL EVALUATION OF CANDIDATE IMPUTATION MODELS")
    print("="*80)
    
    # ---------------------------------------------------------
    # 1. HEALTH SCORE
    # ---------------------------------------------------------
    print("\n--- 1. HEALTH SCORE EXPERIMENT ---")
    df_hs = df.dropna(subset=['Health Score']).copy()
    candidate_features_hs = [
        'Age', 'Gender', 'Smoking Status', 'Exercise Frequency',
        'Annual Income', 'Credit Score', 'Occupation', 'Education Level',
        'Number of Dependents', 'Location', 'Property Type', 'Insurance Duration'
    ]
    
    # For testing, fill intermediate missing in predictors with median/mode to isolate target
    X_hs = pd.get_dummies(df_hs[candidate_features_hs], drop_first=True)
    for col in X_hs.columns:
        if X_hs[col].isnull().sum() > 0:
            X_hs[col] = X_hs[col].fillna(X_hs[col].median())
    y_hs = df_hs['Health Score']
    
    X_tr_hs, X_te_hs, y_tr_hs, y_te_hs = train_test_split(X_hs, y_hs, test_size=0.2, random_state=42)
    
    # Baseline: Median
    med_val_hs = y_tr_hs.median()
    y_pred_med_hs = np.full_like(y_te_hs, med_val_hs)
    mae_med_hs = mean_absolute_error(y_te_hs, y_pred_med_hs)
    rmse_med_hs = np.sqrt(mean_squared_error(y_te_hs, y_pred_med_hs))
    r2_med_hs = r2_score(y_te_hs, y_pred_med_hs)
    print(f"Median Baseline ({med_val_hs:.2f}): MAE={mae_med_hs:.4f}, RMSE={rmse_med_hs:.4f}, R2={r2_med_hs:.5f}")
    
    # HistGradientBoosting
    hgb_hs = HistGradientBoostingRegressor(max_iter=100, random_state=42)
    hgb_hs.fit(X_tr_hs, y_tr_hs)
    y_pred_hgb_hs = hgb_hs.predict(X_te_hs)
    print(f"HistGradientBoosting:    MAE={mean_absolute_error(y_te_hs, y_pred_hgb_hs):.4f}, RMSE={np.sqrt(mean_squared_error(y_te_hs, y_pred_hgb_hs)):.4f}, R2={r2_score(y_te_hs, y_pred_hgb_hs):.5f}")
    
    # RandomForest
    rf_hs = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42, n_jobs=-1)
    rf_hs.fit(X_tr_hs, y_tr_hs)
    y_pred_rf_hs = rf_hs.predict(X_te_hs)
    print(f"Random Forest (depth 8): MAE={mean_absolute_error(y_te_hs, y_pred_rf_hs):.4f}, RMSE={np.sqrt(mean_squared_error(y_te_hs, y_pred_rf_hs)):.4f}, R2={r2_score(y_te_hs, y_pred_rf_hs):.5f}")

    # ---------------------------------------------------------
    # 2. CREDIT SCORE
    # ---------------------------------------------------------
    print("\n--- 2. CREDIT SCORE EXPERIMENT ---")
    df_cs = df.dropna(subset=['Credit Score']).copy()
    candidate_features_cs = [
        'Annual Income', 'Age', 'Education Level', 'Occupation',
        'Number of Dependents', 'Marital Status', 'Property Type', 'Location',
        'Gender', 'Vehicle Age', 'Insurance Duration'
    ]
    X_cs = pd.get_dummies(df_cs[candidate_features_cs], drop_first=True)
    for col in X_cs.columns:
        if X_cs[col].isnull().sum() > 0:
            X_cs[col] = X_cs[col].fillna(X_cs[col].median())
    y_cs = df_cs['Credit Score']
    
    X_tr_cs, X_te_cs, y_tr_cs, y_te_cs = train_test_split(X_cs, y_cs, test_size=0.2, random_state=42)
    
    # Baseline: Median
    med_val_cs = y_tr_cs.median()
    y_pred_med_cs = np.full_like(y_te_cs, med_val_cs)
    print(f"Median Baseline ({med_val_cs:.1f}): MAE={mean_absolute_error(y_te_cs, y_pred_med_cs):.4f}, RMSE={np.sqrt(mean_squared_error(y_te_cs, y_pred_med_cs)):.4f}, R2={r2_score(y_te_cs, y_pred_med_cs):.5f}")
    
    hgb_cs = HistGradientBoostingRegressor(max_iter=100, random_state=42)
    hgb_cs.fit(X_tr_cs, y_tr_cs)
    y_pred_hgb_cs = hgb_cs.predict(X_te_cs)
    print(f"HistGradientBoosting:    MAE={mean_absolute_error(y_te_cs, y_pred_hgb_cs):.4f}, RMSE={np.sqrt(mean_squared_error(y_te_cs, y_pred_hgb_cs)):.4f}, R2={r2_score(y_te_cs, y_pred_hgb_cs):.5f}")

    # ---------------------------------------------------------
    # 3. OCCUPATION
    # ---------------------------------------------------------
    print("\n--- 3. OCCUPATION EXPERIMENT ---")
    df_occ = df.dropna(subset=['Occupation']).copy()
    candidate_features_occ = [
        'Annual Income', 'Education Level', 'Age', 'Property Type',
        'Location', 'Gender', 'Marital Status', 'Number of Dependents'
    ]
    X_occ = pd.get_dummies(df_occ[candidate_features_occ], drop_first=True)
    for col in X_occ.columns:
        if X_occ[col].isnull().sum() > 0:
            X_occ[col] = X_occ[col].fillna(X_occ[col].median())
    y_occ = df_occ['Occupation']
    
    X_tr_occ, X_te_occ, y_tr_occ, y_te_occ = train_test_split(X_occ, y_occ, test_size=0.2, stratify=y_occ, random_state=42)
    
    # Majority baseline
    majority_class = y_tr_occ.mode()[0]
    y_pred_maj = [majority_class] * len(y_te_occ)
    print(f"Majority Baseline ('{majority_class}'): Accuracy={accuracy_score(y_te_occ, y_pred_maj):.4f}, Macro-F1={f1_score(y_te_occ, y_pred_maj, average='macro'):.4f}")
    
    hgb_occ = HistGradientBoostingClassifier(max_iter=100, random_state=42)
    hgb_occ.fit(X_tr_occ, y_tr_occ)
    y_pred_hgb_occ = hgb_occ.predict(X_te_occ)
    print(f"HistGradientBoosting:    Accuracy={accuracy_score(y_te_occ, y_pred_hgb_occ):.4f}, Balanced Acc={balanced_accuracy_score(y_te_occ, y_pred_hgb_occ):.4f}, Macro-F1={f1_score(y_te_occ, y_pred_hgb_occ, average='macro'):.4f}")

    # ---------------------------------------------------------
    # 4. PREVIOUS CLAIMS
    # ---------------------------------------------------------
    print("\n--- 4. PREVIOUS CLAIMS EXPERIMENT ---")
    df_pc = df.dropna(subset=['Previous Claims']).copy()
    candidate_features_pc = [
        'Vehicle Age', 'Insurance Duration', 'Location', 'Age',
        'Policy Type', 'Gender', 'Annual Income', 'Credit Score'
    ]
    X_pc = pd.get_dummies(df_pc[candidate_features_pc], drop_first=True)
    for col in X_pc.columns:
        if X_pc[col].isnull().sum() > 0:
            X_pc[col] = X_pc[col].fillna(X_pc[col].median())
    y_pc = df_pc['Previous Claims']
    
    X_tr_pc, X_te_pc, y_tr_pc, y_te_pc = train_test_split(X_pc, y_pc, test_size=0.2, random_state=42)
    
    # Mode baseline (0.0)
    mode_pc = y_tr_pc.mode()[0]
    y_pred_mode_pc = np.full_like(y_te_pc, mode_pc)
    print(f"Mode Baseline ({mode_pc}): MAE={mean_absolute_error(y_te_pc, y_pred_mode_pc):.4f}, RMSE={np.sqrt(mean_squared_error(y_te_pc, y_pred_mode_pc)):.4f}")
    
    # Median baseline (1.0)
    med_pc = y_tr_pc.median()
    y_pred_med_pc = np.full_like(y_te_pc, med_pc)
    print(f"Median Baseline ({med_pc}): MAE={mean_absolute_error(y_te_pc, y_pred_med_pc):.4f}, RMSE={np.sqrt(mean_squared_error(y_te_pc, y_pred_med_pc)):.4f}")
    
    # Poisson Regressor
    poisson = PoissonRegressor(max_iter=200)
    poisson.fit(X_tr_pc, y_tr_pc)
    y_pred_poi = poisson.predict(X_te_pc)
    print(f"Poisson Regressor (raw):  MAE={mean_absolute_error(y_te_pc, y_pred_poi):.4f}, RMSE={np.sqrt(mean_squared_error(y_te_pc, y_pred_poi)):.4f}")
    print(f"Poisson Regressor (round):MAE={mean_absolute_error(y_te_pc, np.round(y_pred_poi)):.4f}, RMSE={np.sqrt(mean_squared_error(y_te_pc, np.round(y_pred_poi))):.4f}")
    
    # HistGradientBoosting
    hgb_pc = HistGradientBoostingRegressor(max_iter=100, random_state=42)
    hgb_pc.fit(X_tr_pc, y_tr_pc)
    y_pred_hgb_pc = hgb_pc.predict(X_te_pc)
    print(f"HistGradientBoosting:     MAE={mean_absolute_error(y_te_pc, y_pred_hgb_pc):.4f}, RMSE={np.sqrt(mean_squared_error(y_te_pc, y_pred_hgb_pc)):.4f}")
    print(f"HistGradientBoosting (rd):MAE={mean_absolute_error(y_te_pc, np.round(y_pred_hgb_pc)):.4f}, RMSE={np.sqrt(mean_squared_error(y_te_pc, np.round(y_pred_hgb_pc))):.4f}")

if __name__ == '__main__':
    evaluate_models()
