#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Master Test Runner: Executes backend pytest test suite, validates ML model inference,
verifies dataset integrity (ensuring train.csv is absent and samples are intact),
and tests EDA artifact availability.
"""
import os
import sys
import subprocess
import joblib
import pandas as pd

def run_tests():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    backend_dir = os.path.join(root, 'backend')
    
    print("=" * 80)
    print("INSURANCE INTELLIGENCE MASTER PROJECT TEST SUITE")
    print(f"Project Root: {root}")
    print("=" * 80)
    
    overall_passed = True
    
    # Test 1: Verify train.csv is strictly absent
    print("\n[TEST 1] Checking train.csv exclusion compliance...")
    train_found = []
    for r, _, files in os.walk(root):
        for f in files:
            if f.lower() == 'train.csv':
                train_found.append(os.path.join(r, f))
    if train_found:
        print(f"FAILED: Found train.csv at: {train_found}")
        overall_passed = False
    else:
        print("PASSED: Verified train.csv is completely absent (storage compliance).")

    # Test 2: Verify sample datasets exist and have 20,000 rows
    print("\n[TEST 2] Verifying sample datasets...")
    sample_csv = os.path.join(root, 'EDA', 'dataset', 'sampled_dataset', 'insurance_sample_20000.csv')
    imputed_csv = os.path.join(root, 'EDA', 'dataset', 'processed_data', 'insurance_sample_20000_imputed.csv')
    if os.path.exists(sample_csv) and os.path.exists(imputed_csv):
        df_samp = pd.read_csv(sample_csv)
        df_imp = pd.read_csv(imputed_csv)
        print(f"  Sample dataset rows: {len(df_samp):,}, cols: {df_samp.shape[1]}")
        print(f"  Imputed dataset rows: {len(df_imp):,}, cols: {df_imp.shape[1]}")
        if len(df_samp) == 20000 and len(df_imp) == 20000:
            print("PASSED: Sample and imputed datasets match exactly 20,000 rows.")
        else:
            print("FAILED: Row count mismatch in sample datasets.")
            overall_passed = False
    else:
        print("FAILED: Sample datasets missing.")
        overall_passed = False

    # Test 3: Verify ML model artifact loading and inference
    print("\n[TEST 3] Testing ML model loading and inference...")
    model_path = os.path.join(backend_dir, 'app', 'ml', 'artifacts', 'premium_model.joblib')
    if os.path.exists(model_path):
        try:
            model = joblib.load(model_path)
            print(f"  Successfully loaded model: {type(model).__name__}")
            sample_df = pd.DataFrame([{
                'Age': 42.0,
                'Annual Income': 55000.0,
                'Number of Dependents': 2.0,
                'Health Score': 25.0,
                'Previous Claims': 1.0,
                'Vehicle Age': 6.0,
                'Credit Score': 650.0,
                'Insurance Duration': 4.0,
                'Gender': 'Male',
                'Marital Status': 'Married',
                'Education Level': "Bachelor's",
                'Occupation': 'Employed',
                'Location': 'Suburban',
                'Policy Type': 'Comprehensive',
                'Smoking Status': 'No',
                'Exercise Frequency': 'Weekly',
                'Property Type': 'House'
            }])
            pred = model.predict(sample_df)[0]
            print(f"  Test prediction output: ${pred:.2f} USD")
            if pred > 0:
                print("PASSED: Model loaded and generated positive premium prediction.")
            else:
                print("FAILED: Prediction is non-positive.")
                overall_passed = False
        except Exception as e:
            print(f"FAILED: Model prediction error: {e}")
            overall_passed = False
    else:
        print(f"FAILED: Model artifact not found at {model_path}")
        overall_passed = False

    # Test 4: Run backend unit tests via pytest
    print("\n[TEST 4] Running backend pytest test suite...")
    env = os.environ.copy()
    env['PYTHONPATH'] = backend_dir
    env['PYTHONDONTWRITEBYTECODE'] = '1'
    res = subprocess.run([
        sys.executable, '-B', '-m', 'pytest',
        os.path.join(backend_dir, 'tests'),
        '-q',
        '-p', 'no:cacheprovider'
    ], env=env)
    if res.returncode == 0:
        print("PASSED: All backend unit tests passed.")
    else:
        print(f"FAILED: Pytest exited with code {res.returncode}")
        overall_passed = False

    print("\n" + "=" * 80)
    if overall_passed:
        print("ALL TESTS PASSED SUCCESSFULLY! PROJECT IS GITHUB-READY.")
    else:
        print("SOME TESTS FAILED. PLEASE REVIEW LOGS ABOVE.")
    print("=" * 80)
    return 0 if overall_passed else 1

if __name__ == '__main__':
    sys.exit(run_tests())
