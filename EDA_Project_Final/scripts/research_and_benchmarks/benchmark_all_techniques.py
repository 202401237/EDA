"""
COMPREHENSIVE MISSING VALUE TECHNIQUE BENCHMARK
Tests EVERY available technique for each column individually.
"""
import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.metrics import accuracy_score, f1_score, balanced_accuracy_score
from sklearn.ensemble import (
    HistGradientBoostingRegressor, HistGradientBoostingClassifier,
    RandomForestRegressor, RandomForestClassifier,
    ExtraTreesRegressor, ExtraTreesClassifier
)
from sklearn.linear_model import PoissonRegressor, RidgeCV
from sklearn.neighbors import KNeighborsRegressor, KNeighborsClassifier
from sklearn.experimental import enable_iterative_imputer  # noqa
from sklearn.impute import KNNImputer, SimpleImputer, IterativeImputer
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
import warnings
warnings.filterwarnings('ignore')

SEED = 42

def print_header(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def run_full_benchmark():
    df = pd.read_csv('EDA_PROJECT/insurance_sample_20000.csv')
    
    print_header("COLUMN DATA TYPE CLASSIFICATION")
    targets = {
        'Health Score':    {'type': 'Continuous Numerical (Float)', 'range': '[2.35, 55.96]', 'missing': df['Health Score'].isnull().sum(), 'pct': f"{df['Health Score'].isnull().mean()*100:.2f}%", 'task': 'Regression'},
        'Credit Score':   {'type': 'Continuous Numerical (Float)', 'range': '[300.0, 849.0]', 'missing': df['Credit Score'].isnull().sum(), 'pct': f"{df['Credit Score'].isnull().mean()*100:.2f}%", 'task': 'Regression'},
        'Occupation':     {'type': 'Categorical (Nominal Text)',   'range': '3 classes',      'missing': df['Occupation'].isnull().sum(), 'pct': f"{df['Occupation'].isnull().mean()*100:.2f}%", 'task': 'Classification'},
        'Previous Claims':{'type': 'Discrete Count (Integer)',     'range': '[0, 8]',         'missing': df['Previous Claims'].isnull().sum(), 'pct': f"{df['Previous Claims'].isnull().mean()*100:.2f}%", 'task': 'Count Regression'},
    }
    for col, info in targets.items():
        print(f"  {col:<20} | Type: {info['type']:<30} | Range: {info['range']:<12} | Missing: {info['missing']:,} ({info['pct']}) | ML Task: {info['task']}")
    
    # Common feature prep
    cat_cols = ['Gender','Smoking Status','Exercise Frequency','Education Level',
                'Location','Policy Type','Property Type','Marital Status']
    num_cols = ['Age','Annual Income','Number of Dependents','Vehicle Age',
                'Insurance Duration']

    def prep_X(df_sub, extra_num=[], extra_cat=[]):
        X = df_sub[num_cols + extra_num].copy()
        for c in X.columns:
            X[c] = X[c].fillna(X[c].median())
        cats = df_sub[cat_cols + extra_cat].copy()
        for c in cats.columns:
            cats[c] = cats[c].fillna('Missing')
        X_enc = pd.concat([X, pd.get_dummies(cats, drop_first=True)], axis=1)
        return X_enc

    # =====================================================================
    # 1. HEALTH SCORE (Continuous Numerical - Regression)
    # =====================================================================
    print_header("1. HEALTH SCORE — Continuous Numerical (Float) — Regression Task")
    df_hs = df.dropna(subset=['Health Score']).copy()
    X_hs = prep_X(df_hs, extra_num=['Credit Score'])
    y_hs = df_hs['Health Score']
    X_tr, X_te, y_tr, y_te = train_test_split(X_hs, y_hs, test_size=0.2, random_state=SEED)

    techniques_hs = {}

    # A. Statistical Techniques
    techniques_hs['A1. Mean Imputation'] = np.full_like(y_te, y_tr.mean())
    techniques_hs['A2. Median Imputation'] = np.full_like(y_te, y_tr.median())
    techniques_hs['A3. Mode Imputation'] = np.full_like(y_te, y_tr.mode()[0])
    techniques_hs['A4. Random Sample (Bootstrap)'] = np.random.RandomState(SEED).choice(y_tr.values, size=len(y_te))

    # B. Sklearn Imputer Library Techniques
    knn_imp = KNNImputer(n_neighbors=5)
    X_tr_knn = X_tr.copy(); X_tr_knn['_target'] = y_tr.values
    X_te_knn = X_te.copy(); X_te_knn['_target'] = np.nan
    knn_imp.fit(X_tr_knn)
    knn_result = knn_imp.transform(X_te_knn)
    techniques_hs['B1. KNN Imputer (k=5)'] = knn_result[:, -1]

    knn_imp3 = KNNImputer(n_neighbors=3)
    knn_imp3.fit(X_tr_knn)
    techniques_hs['B2. KNN Imputer (k=3)'] = knn_imp3.transform(X_te_knn)[:, -1]

    knn_imp10 = KNNImputer(n_neighbors=10)
    knn_imp10.fit(X_tr_knn)
    techniques_hs['B3. KNN Imputer (k=10)'] = knn_imp10.transform(X_te_knn)[:, -1]

    iter_imp = IterativeImputer(estimator=DecisionTreeRegressor(max_depth=5, random_state=SEED), max_iter=10, random_state=SEED)
    iter_imp.fit(X_tr_knn)
    techniques_hs['B4. Iterative Imputer (MICE - DecisionTree)'] = iter_imp.transform(X_te_knn)[:, -1]

    iter_imp_ridge = IterativeImputer(max_iter=10, random_state=SEED)
    iter_imp_ridge.fit(X_tr_knn)
    techniques_hs['B5. Iterative Imputer (MICE - BayesianRidge)'] = iter_imp_ridge.transform(X_te_knn)[:, -1]

    # C. ML Regression Algorithms
    for name, model in [
        ('C1. KNN Regressor (k=5)', KNeighborsRegressor(n_neighbors=5)),
        ('C2. KNN Regressor (k=10)', KNeighborsRegressor(n_neighbors=10)),
        ('C3. Decision Tree (depth=6)', DecisionTreeRegressor(max_depth=6, random_state=SEED)),
        ('C4. Random Forest (depth=8)', RandomForestRegressor(n_estimators=100, max_depth=8, random_state=SEED, n_jobs=-1)),
        ('C5. ExtraTrees (depth=10)', ExtraTreesRegressor(n_estimators=100, max_depth=10, random_state=SEED, n_jobs=-1)),
        ('C6. HistGradientBoosting (squared_error)', HistGradientBoostingRegressor(max_iter=100, random_state=SEED)),
        ('C7. HistGradientBoosting (absolute_error)', HistGradientBoostingRegressor(loss='absolute_error', max_iter=100, random_state=SEED)),
        ('C8. Ridge Regression', RidgeCV()),
    ]:
        model.fit(X_tr, y_tr)
        techniques_hs[name] = model.predict(X_te)

    print(f"\n{'Technique':<52} | {'MAE':>8} | {'RMSE':>8} | {'R²':>8}")
    print("-"*85)
    best_mae_hs = 999
    best_name_hs = ""
    for name, preds in sorted(techniques_hs.items(), key=lambda x: mean_absolute_error(y_te, x[1])):
        mae = mean_absolute_error(y_te, preds)
        rmse = np.sqrt(mean_squared_error(y_te, preds))
        r2 = r2_score(y_te, preds)
        marker = " <-- BEST" if mae < best_mae_hs else ""
        if mae < best_mae_hs:
            best_mae_hs = mae
            best_name_hs = name
        print(f"{name:<52} | {mae:>8.4f} | {rmse:>8.4f} | {r2:>+8.5f}{marker}")

    # =====================================================================
    # 2. CREDIT SCORE (Continuous Numerical - Regression)
    # =====================================================================
    print_header("2. CREDIT SCORE — Continuous Numerical (Float) — Regression Task")
    df_cs = df.dropna(subset=['Credit Score']).copy()
    X_cs = prep_X(df_cs, extra_num=['Previous Claims'])
    y_cs = df_cs['Credit Score']
    X_tr_cs, X_te_cs, y_tr_cs, y_te_cs = train_test_split(X_cs, y_cs, test_size=0.2, random_state=SEED)

    techniques_cs = {}
    techniques_cs['A1. Mean Imputation'] = np.full_like(y_te_cs, y_tr_cs.mean())
    techniques_cs['A2. Median Imputation'] = np.full_like(y_te_cs, y_tr_cs.median())
    techniques_cs['A3. Random Sample'] = np.random.RandomState(SEED).choice(y_tr_cs.values, size=len(y_te_cs))

    X_tr_knn_cs = X_tr_cs.copy(); X_tr_knn_cs['_target'] = y_tr_cs.values
    X_te_knn_cs = X_te_cs.copy(); X_te_knn_cs['_target'] = np.nan
    for k in [3, 5, 10]:
        imp = KNNImputer(n_neighbors=k); imp.fit(X_tr_knn_cs)
        techniques_cs[f'B1. KNN Imputer (k={k})'] = imp.transform(X_te_knn_cs)[:, -1]

    iter_dt = IterativeImputer(estimator=DecisionTreeRegressor(max_depth=5, random_state=SEED), max_iter=10, random_state=SEED)
    iter_dt.fit(X_tr_knn_cs)
    techniques_cs['B2. Iterative Imputer (MICE-DT)'] = iter_dt.transform(X_te_knn_cs)[:, -1]

    iter_br = IterativeImputer(max_iter=10, random_state=SEED)
    iter_br.fit(X_tr_knn_cs)
    techniques_cs['B3. Iterative Imputer (MICE-BayesRidge)'] = iter_br.transform(X_te_knn_cs)[:, -1]

    for name, model in [
        ('C1. KNN Regressor (k=5)', KNeighborsRegressor(n_neighbors=5)),
        ('C2. Decision Tree (depth=6)', DecisionTreeRegressor(max_depth=6, random_state=SEED)),
        ('C3. Random Forest (depth=8)', RandomForestRegressor(n_estimators=100, max_depth=8, random_state=SEED, n_jobs=-1)),
        ('C4. ExtraTrees (depth=10)', ExtraTreesRegressor(n_estimators=100, max_depth=10, random_state=SEED, n_jobs=-1)),
        ('C5. HistGradientBoosting (squared)', HistGradientBoostingRegressor(max_iter=100, random_state=SEED)),
        ('C6. HistGradientBoosting (absolute)', HistGradientBoostingRegressor(loss='absolute_error', max_iter=100, random_state=SEED)),
        ('C7. Ridge Regression', RidgeCV()),
    ]:
        model.fit(X_tr_cs, y_tr_cs)
        techniques_cs[name] = model.predict(X_te_cs)

    print(f"\n{'Technique':<52} | {'MAE':>8} | {'RMSE':>8} | {'R²':>8}")
    print("-"*85)
    best_mae_cs = 999
    best_name_cs = ""
    for name, preds in sorted(techniques_cs.items(), key=lambda x: mean_absolute_error(y_te_cs, x[1])):
        mae = mean_absolute_error(y_te_cs, preds)
        rmse = np.sqrt(mean_squared_error(y_te_cs, preds))
        r2 = r2_score(y_te_cs, preds)
        marker = " <-- BEST" if mae < best_mae_cs else ""
        if mae < best_mae_cs:
            best_mae_cs = mae
            best_name_cs = name
        print(f"{name:<52} | {mae:>8.2f} | {rmse:>8.2f} | {r2:>+8.5f}{marker}")

    # =====================================================================
    # 3. OCCUPATION (Categorical - Classification)
    # =====================================================================
    print_header("3. OCCUPATION — Categorical (Nominal Text) — Classification Task")
    df_occ = df.dropna(subset=['Occupation']).copy()
    X_occ = prep_X(df_occ, extra_num=['Credit Score'])
    y_occ = df_occ['Occupation']
    X_tr_oc, X_te_oc, y_tr_oc, y_te_oc = train_test_split(X_occ, y_occ, test_size=0.2, stratify=y_occ, random_state=SEED)

    techniques_occ = {}
    maj = y_tr_oc.mode()[0]
    techniques_occ["A1. Mode (Most Frequent = '" + maj + "')"] = [maj]*len(y_te_oc)
    techniques_occ["A2. Random Proportional Sampling"] = np.random.RandomState(SEED).choice(y_tr_oc.values, size=len(y_te_oc))

    for name, model in [
        ('C1. KNN Classifier (k=5)', KNeighborsClassifier(n_neighbors=5)),
        ('C2. KNN Classifier (k=10)', KNeighborsClassifier(n_neighbors=10)),
        ('C3. Decision Tree (depth=6)', DecisionTreeClassifier(max_depth=6, random_state=SEED)),
        ('C4. Random Forest Classifier', RandomForestClassifier(n_estimators=100, max_depth=8, random_state=SEED, n_jobs=-1)),
        ('C5. ExtraTrees Classifier', ExtraTreesClassifier(n_estimators=100, max_depth=10, random_state=SEED, n_jobs=-1)),
        ('C6. HistGradientBoosting Classifier', HistGradientBoostingClassifier(max_iter=100, random_state=SEED)),
    ]:
        model.fit(X_tr_oc, y_tr_oc)
        techniques_occ[name] = model.predict(X_te_oc)

    print(f"\n{'Technique':<52} | {'Accuracy':>8} | {'Bal.Acc':>8} | {'Macro-F1':>8}")
    print("-"*85)
    best_acc = 0
    for name, preds in sorted(techniques_occ.items(), key=lambda x: accuracy_score(y_te_oc, x[1]), reverse=True):
        acc = accuracy_score(y_te_oc, preds)
        bal = balanced_accuracy_score(y_te_oc, preds)
        f1 = f1_score(y_te_oc, preds, average='macro')
        marker = " <-- BEST" if acc > best_acc else ""
        if acc > best_acc:
            best_acc = acc
        print(f"{name:<52} | {acc:>8.4f} | {bal:>8.4f} | {f1:>8.4f}{marker}")

    # =====================================================================
    # 4. PREVIOUS CLAIMS (Discrete Count - Count Regression)
    # =====================================================================
    print_header("4. PREVIOUS CLAIMS — Discrete Count (Integer) — Count Prediction")
    df_pc = df.dropna(subset=['Previous Claims']).copy()
    X_pc = prep_X(df_pc, extra_num=['Credit Score'])
    y_pc = df_pc['Previous Claims']
    X_tr_pc, X_te_pc, y_tr_pc, y_te_pc = train_test_split(X_pc, y_pc, test_size=0.2, random_state=SEED)

    techniques_pc = {}
    techniques_pc['A1. Mean Imputation'] = np.full_like(y_te_pc, y_tr_pc.mean())
    techniques_pc['A2. Median Imputation (1.0)'] = np.full_like(y_te_pc, y_tr_pc.median())
    techniques_pc['A3. Mode Imputation (0.0)'] = np.full_like(y_te_pc, y_tr_pc.mode()[0])

    X_tr_knn_pc = X_tr_pc.copy(); X_tr_knn_pc['_target'] = y_tr_pc.values
    X_te_knn_pc = X_te_pc.copy(); X_te_knn_pc['_target'] = np.nan
    for k in [3, 5, 10]:
        imp = KNNImputer(n_neighbors=k); imp.fit(X_tr_knn_pc)
        res = imp.transform(X_te_knn_pc)[:, -1]
        techniques_pc[f'B1. KNN Imputer (k={k}) Raw'] = res
        techniques_pc[f'B2. KNN Imputer (k={k}) Rounded'] = np.clip(np.round(res), 0, 8)

    iter_pc = IterativeImputer(estimator=DecisionTreeRegressor(max_depth=5, random_state=SEED), max_iter=10, random_state=SEED)
    iter_pc.fit(X_tr_knn_pc)
    mice_res = iter_pc.transform(X_te_knn_pc)[:, -1]
    techniques_pc['B3. MICE (DecisionTree) Raw'] = mice_res
    techniques_pc['B4. MICE (DecisionTree) Rounded'] = np.clip(np.round(mice_res), 0, 8)

    for name, model in [
        ('C1. KNN Regressor (k=5)', KNeighborsRegressor(n_neighbors=5)),
        ('C2. Decision Tree (depth=6)', DecisionTreeRegressor(max_depth=6, random_state=SEED)),
        ('C3. Random Forest (depth=8)', RandomForestRegressor(n_estimators=100, max_depth=8, random_state=SEED, n_jobs=-1)),
        ('C4. ExtraTrees (depth=10)', ExtraTreesRegressor(n_estimators=100, max_depth=10, random_state=SEED, n_jobs=-1)),
        ('C5. HistGradientBoosting', HistGradientBoostingRegressor(max_iter=100, random_state=SEED)),
        ('C6. Poisson Regressor', PoissonRegressor(max_iter=200)),
    ]:
        model.fit(X_tr_pc, y_tr_pc)
        raw_preds = model.predict(X_te_pc)
        techniques_pc[f'{name} Raw'] = raw_preds
        techniques_pc[f'{name} Rounded'] = np.clip(np.round(raw_preds), 0, 8)

    print(f"\n{'Technique':<52} | {'MAE':>8} | {'RMSE':>8} | {'R²':>8}")
    print("-"*85)
    best_mae_pc = 999
    for name, preds in sorted(techniques_pc.items(), key=lambda x: mean_absolute_error(y_te_pc, x[1])):
        mae = mean_absolute_error(y_te_pc, preds)
        rmse = np.sqrt(mean_squared_error(y_te_pc, preds))
        r2 = r2_score(y_te_pc, preds)
        marker = " <-- BEST" if mae < best_mae_pc else ""
        if mae < best_mae_pc:
            best_mae_pc = mae
        print(f"{name:<52} | {mae:>8.4f} | {rmse:>8.4f} | {r2:>+8.5f}{marker}")

if __name__ == '__main__':
    run_full_benchmark()
