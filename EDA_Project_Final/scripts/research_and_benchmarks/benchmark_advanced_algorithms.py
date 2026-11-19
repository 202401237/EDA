import os
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.ensemble import (
    HistGradientBoostingRegressor, 
    ExtraTreesRegressor, 
    VotingRegressor,
    StackingRegressor
)
from sklearn.linear_model import RidgeCV
import warnings

warnings.filterwarnings('ignore')
RANDOM_SEED = 42

def test_advanced_algorithms():
    sample_path = 'EDA_PROJECT/insurance_sample_20000_cleaned.csv'
    if not os.path.exists(sample_path):
        sample_path = 'insurance_sample_20000.csv'
        
    df = pd.read_csv(sample_path)
    
    # Advanced Feature Engineering
    df_feat = df.copy()
    df_feat['income_per_dep'] = df_feat['Annual Income'] / (df_feat['Number of Dependents'] + 1)
    df_feat['income_to_age'] = df_feat['Annual Income'] / (df_feat['Age'] + 1)
    df_feat['claim_rate_per_veh_age'] = df_feat['Previous Claims'] / (df_feat['Vehicle Age'] + 1)
    df_feat['claim_per_duration'] = df_feat['Previous Claims'] / (df_feat['Insurance Duration'] + 1)
    df_feat['policy_loc'] = df_feat['Policy Type'].astype(str) + "_" + df_feat['Location'].astype(str)
    
    exclude_cols = ['id', 'Policy Start Date', 'Premium Amount']
    feat_cols = [c for c in df_feat.columns if c not in exclude_cols]
    
    X = pd.get_dummies(df_feat[feat_cols], drop_first=True)
    y_raw = df_feat['Premium Amount']
    y_trans = np.sqrt(y_raw)
    
    # 80/20 train/val split
    kf = KFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    train_idx, val_idx = next(kf.split(X, y_trans))
    X_train, y_train = X.iloc[train_idx], y_trans.iloc[train_idx]
    X_val, y_val_raw = X.iloc[val_idx], y_raw.iloc[val_idx]
    
    models = {
        "1. HistGradientBoosting (Loss: Absolute Error - MAE Minimizer)": HistGradientBoostingRegressor(
            loss='absolute_error', max_iter=200, learning_rate=0.08, max_leaf_nodes=41, 
            min_samples_leaf=20, random_state=RANDOM_SEED
        ),
        "2. HistGradientBoosting (Loss: Squared Error - RMSE Minimizer)": HistGradientBoostingRegressor(
            loss='squared_error', max_iter=200, learning_rate=0.06, max_leaf_nodes=35,
            min_samples_leaf=25, l2_regularization=1.0, random_state=RANDOM_SEED
        ),
        "3. ExtraTrees Regressor (Variance Reducer)": ExtraTreesRegressor(
            n_estimators=100, max_depth=14, min_samples_split=8, 
            random_state=RANDOM_SEED, n_jobs=-1
        ),
        "4. Stacking Regressor (Super-Learner: HGB + ExtraTrees + Ridge)": StackingRegressor(
            estimators=[
                ('hgb_abs', HistGradientBoostingRegressor(loss='absolute_error', max_iter=150, learning_rate=0.08, random_state=RANDOM_SEED)),
                ('hgb_sq', HistGradientBoostingRegressor(loss='squared_error', max_iter=150, learning_rate=0.06, random_state=RANDOM_SEED)),
                ('et', ExtraTreesRegressor(n_estimators=80, max_depth=12, random_state=RANDOM_SEED, n_jobs=-1))
            ],
            final_estimator=RidgeCV(),
            cv=3,
            n_jobs=-1
        ),
        "5. Blended Voting Ensemble (HGB Absolute + HGB Squared + ExtraTrees)": VotingRegressor(
            estimators=[
                ('hgb_abs', HistGradientBoostingRegressor(loss='absolute_error', max_iter=150, learning_rate=0.08, random_state=RANDOM_SEED)),
                ('hgb_sq', HistGradientBoostingRegressor(loss='squared_error', max_iter=150, learning_rate=0.06, random_state=RANDOM_SEED)),
                ('et', ExtraTreesRegressor(n_estimators=80, max_depth=12, random_state=RANDOM_SEED, n_jobs=-1))
            ],
            weights=[2, 2, 1]
        )
    }
    
    results = []
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        preds_trans = model.predict(X_val)
        preds_dollars = np.square(np.maximum(preds_trans, 0))
        
        mae = mean_absolute_error(y_val_raw, preds_dollars)
        rmse = np.sqrt(mean_squared_error(y_val_raw, preds_dollars))
        r2 = r2_score(y_val_raw, preds_dollars)
        
        results.append({
            "Algorithm / Architecture": name,
            "MAE ($)": round(mae, 2),
            "RMSE ($)": round(rmse, 2),
            "R2": round(r2, 4)
        })
        print(f"  --> MAE: ${mae:.2f} | RMSE: ${rmse:.2f} | R2: {r2:.4f}")
        
    df_res = pd.DataFrame(results)
    print("\n" + "="*80)
    print(df_res.to_string(index=False))
    print("="*80)

if __name__ == '__main__':
    test_advanced_algorithms()
