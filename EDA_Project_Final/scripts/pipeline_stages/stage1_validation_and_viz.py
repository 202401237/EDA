#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Stage 1 & 2: Data Validation, Missing Value Analysis, and Missingness Visualizations
====================================================================================
This script performs comprehensive data validation on the insurance dataset
and generates professional-quality missingness visualizations.

Sections covered:
  1. Data loading & structural verification
  2. Column classification & missing value summary (exported to CSV)
  3. Eight missingness visualizations (saved to output/figures/missingness/)
"""

# ── Matplotlib backend MUST be set before any pyplot import ──────────────────
import matplotlib
matplotlib.use('Agg')

# ── Standard & third-party imports ───────────────────────────────────────────
import os
import sys
import warnings
import itertools

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
import missingno as msno

warnings.filterwarnings('ignore')

# Fix Windows console encoding for emoji/unicode
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ── Paths (forward slashes only) ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__)).replace('\\', '/')
PROJECT_DIR = os.path.dirname(BASE_DIR).replace('\\', '/')
DATA_PATH = PROJECT_DIR + '/insurance_sample_20000.csv'
OUTPUT_DIR = BASE_DIR  # EDA_PROJECT/output
FIGURES_DIR = OUTPUT_DIR + '/figures/missingness'

os.makedirs(FIGURES_DIR, exist_ok=True)

# ── Seaborn professional theme ───────────────────────────────────────────────
sns.set_theme(style='whitegrid', font_scale=1.15, palette='muted')
PALETTE = sns.color_palette('Set2', 12)

# ═════════════════════════════════════════════════════════════════════════════
# STAGE 1 — DATA VALIDATION  (Sections 1-2)
# ═════════════════════════════════════════════════════════════════════════════

print('=' * 90)
print('  STAGE 1: DATA VALIDATION & MISSING VALUE ANALYSIS')
print('=' * 90)

# ── 1. Load dataset ─────────────────────────────────────────────────────────
df = pd.read_csv(DATA_PATH)
n_rows, n_cols = df.shape

print(f'\n📂 Dataset loaded: {DATA_PATH}')
print(f'   Rows : {n_rows:,}')
print(f'   Cols : {n_cols}')

# ── 2. Verify expected row count ─────────────────────────────────────────────
EXPECTED_ROWS = 20_000
if n_rows == EXPECTED_ROWS:
    print(f'   ✅  Row count verified: {n_rows:,} rows as expected.')
else:
    print(f'   ⚠️  Row count mismatch: expected {EXPECTED_ROWS:,}, got {n_rows:,}')

# ── 3. Column classification ────────────────────────────────────────────────
NUMERICAL = [
    'Age', 'Annual Income', 'Number of Dependents', 'Health Score',
    'Previous Claims', 'Vehicle Age', 'Credit Score', 'Insurance Duration',
]
CATEGORICAL = [
    'Gender', 'Marital Status', 'Education Level', 'Occupation',
    'Location', 'Policy Type', 'Customer Feedback', 'Smoking Status',
    'Exercise Frequency', 'Property Type',
]
DATE = ['Policy Start Date']
IDENTIFIER = ['id']
TARGET = ['Premium Amount']

col_type_map = {}
for c in NUMERICAL:
    col_type_map[c] = 'Numerical'
for c in CATEGORICAL:
    col_type_map[c] = 'Categorical'
for c in DATE:
    col_type_map[c] = 'Date'
for c in IDENTIFIER:
    col_type_map[c] = 'Identifier'
for c in TARGET:
    col_type_map[c] = 'Target'

print(f'\n   Column classifications:')
for ctype in ['Numerical', 'Categorical', 'Date', 'Identifier', 'Target']:
    cols = [c for c, t in col_type_map.items() if t == ctype]
    print(f'     {ctype:12s} ({len(cols):2d}): {cols}')

# Verify all columns are classified
unclassified = [c for c in df.columns if c not in col_type_map]
if unclassified:
    print(f'   ⚠️  Unclassified columns: {unclassified}')
else:
    print('   ✅  All columns classified.')

# ── 4. Pseudo-missing value check ───────────────────────────────────────────
print('\n─── Pseudo-Missing Value Check ───')
PSEUDO_MISSING = ['NA', 'N/A', 'Unknown', 'unknown', 'UNKNOWN', '']
pseudo_counts = {}
for col in df.columns:
    mask = df[col].astype(str).str.strip().isin(PSEUDO_MISSING)
    cnt = mask.sum()
    if cnt > 0:
        pseudo_counts[col] = cnt

if pseudo_counts:
    print('   Pseudo-missing values detected (string placeholders for missing):')
    for col, cnt in sorted(pseudo_counts.items(), key=lambda x: -x[1]):
        print(f'     {col:25s} → {cnt:,} occurrences')
else:
    print('   ✅  No pseudo-missing values ("NA", "N/A", "Unknown", blank) found.')

# ── 5. Duplicate check ──────────────────────────────────────────────────────
print('\n─── Duplicate Check ───')
n_dup_rows = df.duplicated().sum()
n_dup_ids = df['id'].duplicated().sum()
print(f'   Fully duplicated rows : {n_dup_rows:,}')
print(f'   Duplicate IDs         : {n_dup_ids:,}')
if n_dup_rows == 0 and n_dup_ids == 0:
    print('   ✅  No duplicates detected.')
else:
    if n_dup_rows > 0:
        print(f'   ⚠️  {n_dup_rows:,} duplicate rows found.')
    if n_dup_ids > 0:
        print(f'   ⚠️  {n_dup_ids:,} duplicate IDs found.')

# ── 6. Per-column missing value summary ──────────────────────────────────────
print('\n─── Per-Column Missing Value Summary ───')


def recommend_treatment(col_name, col_type, missing_pct, dtype_str):
    """Return a recommended treatment string for a column's missing values."""
    if missing_pct == 0:
        return 'No action needed'
    if col_type == 'Identifier':
        return 'Investigate – identifier should not be missing'
    if col_type == 'Date':
        return 'Impute with mode / derive from related columns'
    if col_type == 'Target':
        return 'Drop rows (target cannot be imputed)'
    if missing_pct > 25:
        if col_type == 'Numerical':
            return 'Consider advanced imputation (KNN/MICE) or drop column'
        return 'Consider advanced imputation or drop column'
    if missing_pct > 5:
        if col_type == 'Numerical':
            return 'Impute with median or KNN'
        return 'Impute with mode or predictive model'
    # <= 5 %
    if col_type == 'Numerical':
        return 'Impute with median'
    return 'Impute with mode'


records = []
for col in df.columns:
    total = n_rows
    missing_cnt = int(df[col].isnull().sum())
    missing_pct = round(missing_cnt / total * 100, 2)
    non_missing_cnt = total - missing_cnt
    non_missing_pct = round(non_missing_cnt / total * 100, 2)
    dtype_str = str(df[col].dtype)
    unique_cnt = int(df[col].nunique(dropna=True))
    c_type = col_type_map.get(col, 'Unknown')
    treatment = recommend_treatment(col, c_type, missing_pct, dtype_str)

    records.append({
        'Column': col,
        'Total Rows': total,
        'Missing Count': missing_cnt,
        'Missing %': missing_pct,
        'Non-Missing Count': non_missing_cnt,
        'Non-Missing %': non_missing_pct,
        'Dtype': dtype_str,
        'Unique Count': unique_cnt,
        'Column Type': c_type,
        'Recommended Treatment': treatment,
    })

summary_df = pd.DataFrame(records).sort_values('Missing %', ascending=False).reset_index(drop=True)

# Display in console
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 200)
print(summary_df.to_string(index=False))

# ── 7. Export summary CSV ────────────────────────────────────────────────────
summary_csv_path = OUTPUT_DIR + '/missing_value_summary.csv'
summary_df.to_csv(summary_csv_path, index=False)
print(f'\n   📄 Missing value summary exported to: {summary_csv_path}')

# ── Quick stats ──────────────────────────────────────────────────────────────
cols_with_missing = summary_df[summary_df['Missing Count'] > 0]
print(f'\n   Columns with missing values: {len(cols_with_missing)} / {n_cols}')
total_cells = n_rows * n_cols
total_missing = summary_df['Missing Count'].sum()
print(f'   Total cells in dataset     : {total_cells:,}')
print(f'   Total missing cells        : {total_missing:,} ({total_missing / total_cells * 100:.2f}%)')
complete_rows = int(df.dropna().shape[0])
print(f'   Complete rows (no NaN)     : {complete_rows:,} / {n_rows:,} ({complete_rows / n_rows * 100:.1f}%)')
incomplete_rows = n_rows - complete_rows
print(f'   Incomplete rows            : {incomplete_rows:,} / {n_rows:,} ({incomplete_rows / n_rows * 100:.1f}%)')


# ═════════════════════════════════════════════════════════════════════════════
# STAGE 2 — MISSINGNESS VISUALIZATIONS  (Section 3)
# ═════════════════════════════════════════════════════════════════════════════

print('\n' + '=' * 90)
print('  STAGE 2: MISSINGNESS VISUALIZATIONS')
print('=' * 90)

# Subset: columns that have missing values (for focused plots)
missing_cols = cols_with_missing['Column'].tolist()
missing_counts = df[missing_cols].isnull().sum().sort_values(ascending=False)
missing_pcts = (missing_counts / n_rows * 100)

# ── Helper ───────────────────────────────────────────────────────────────────
def save_fig(fig, filename):
    """Save figure at high resolution and close it."""
    path = FIGURES_DIR + '/' + filename
    fig.savefig(path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f'   ✅  Saved: {path}')


# ──────────────────────────────────────────────────────────────────────────────
# 1. Missing Value Counts Bar Chart
# ──────────────────────────────────────────────────────────────────────────────
print('\n[1/8] Missing value counts bar chart …')
fig, ax = plt.subplots(figsize=(12, 6))
bars = ax.barh(missing_counts.index[::-1], missing_counts.values[::-1],
               color=sns.color_palette('Reds_r', len(missing_counts)), edgecolor='black', linewidth=0.5)
for bar, val in zip(bars, missing_counts.values[::-1]):
    ax.text(bar.get_width() + 50, bar.get_y() + bar.get_height() / 2,
            f'{val:,}', va='center', fontsize=10, fontweight='bold')
ax.set_xlabel('Number of Missing Values', fontsize=12)
ax.set_title('Missing Value Counts by Column', fontsize=15, fontweight='bold', pad=12)
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'{int(x):,}'))
sns.despine(left=True)
save_fig(fig, '01_missing_count_bar.png')

# ──────────────────────────────────────────────────────────────────────────────
# 2. Missing Percentage Bar Chart
# ──────────────────────────────────────────────────────────────────────────────
print('[2/8] Missing percentage bar chart …')
fig, ax = plt.subplots(figsize=(12, 6))
colors = ['#d32f2f' if p > 25 else '#f57c00' if p > 10 else '#1976d2' for p in missing_pcts.values[::-1]]
bars = ax.barh(missing_pcts.index[::-1], missing_pcts.values[::-1],
               color=colors, edgecolor='black', linewidth=0.5)
for bar, val in zip(bars, missing_pcts.values[::-1]):
    ax.text(bar.get_width() + 0.3, bar.get_y() + bar.get_height() / 2,
            f'{val:.1f}%', va='center', fontsize=10, fontweight='bold')
ax.set_xlabel('Missing Percentage (%)', fontsize=12)
ax.set_title('Missing Value Percentage by Column', fontsize=15, fontweight='bold', pad=12)
ax.axvline(x=5, color='grey', linestyle='--', alpha=0.5, label='5% threshold')
ax.axvline(x=25, color='red', linestyle='--', alpha=0.5, label='25% threshold')
ax.legend(loc='lower right')
sns.despine(left=True)
save_fig(fig, '02_missing_pct_bar.png')

# ──────────────────────────────────────────────────────────────────────────────
# 3. Missingno Matrix
# ──────────────────────────────────────────────────────────────────────────────
print('[3/8] Missingness matrix (missingno) …')
fig_msno = msno.matrix(df, figsize=(16, 8), fontsize=10, sparkline=True, color=(0.25, 0.46, 0.70))
fig = fig_msno.get_figure()
fig.suptitle('Missingness Matrix — Location of Missing Values', fontsize=15, fontweight='bold', y=1.02)
save_fig(fig, '03_missingness_matrix.png')

# ──────────────────────────────────────────────────────────────────────────────
# 4. Missingness Heatmap (co-occurrence via missingno)
# ──────────────────────────────────────────────────────────────────────────────
print('[4/8] Missingness heatmap (missingno) …')
fig_heat = msno.heatmap(df, figsize=(12, 10), fontsize=11, cmap='RdYlBu')
fig = fig_heat.get_figure()
fig.suptitle('Missingness Co-occurrence Heatmap', fontsize=15, fontweight='bold', y=1.02)
save_fig(fig, '04_missingness_heatmap.png')

# ──────────────────────────────────────────────────────────────────────────────
# 5. Top 15 Missingness Patterns (which columns are missing together)
# ──────────────────────────────────────────────────────────────────────────────
print('[5/8] Missingness pattern frequency chart …')

# Build binary pattern: 1 = missing, 0 = present  (only for columns with missing)
miss_binary = df[missing_cols].isnull().astype(int)

# Create a pattern string for each row
pattern_labels = miss_binary.apply(lambda row: ' | '.join(
    [col for col, val in zip(missing_cols, row) if val == 1]
) if row.sum() > 0 else '(Complete)', axis=1)

pattern_freq = pattern_labels.value_counts().head(15).sort_values(ascending=True)

fig, ax = plt.subplots(figsize=(14, 7))
colors_p = sns.color_palette('viridis_r', len(pattern_freq))
bars = ax.barh(range(len(pattern_freq)), pattern_freq.values, color=colors_p, edgecolor='black', linewidth=0.5)
ax.set_yticks(range(len(pattern_freq)))
# Truncate long labels
labels = [l if len(l) < 60 else l[:57] + '…' for l in pattern_freq.index]
ax.set_yticklabels(labels, fontsize=9)
for bar, val in zip(bars, pattern_freq.values):
    ax.text(bar.get_width() + max(pattern_freq.values) * 0.01,
            bar.get_y() + bar.get_height() / 2,
            f'{val:,}', va='center', fontsize=9, fontweight='bold')
ax.set_xlabel('Frequency (rows)', fontsize=12)
ax.set_title('Top 15 Missingness Patterns (Combinations of Missing Columns)',
             fontsize=14, fontweight='bold', pad=12)
sns.despine(left=True)
save_fig(fig, '05_missingness_pattern_freq.png')

# Print patterns
print('   Top 5 missingness patterns:')
for pat, cnt in pattern_freq.sort_values(ascending=False).head(5).items():
    print(f'     {cnt:>6,} rows → {pat}')

# ──────────────────────────────────────────────────────────────────────────────
# 6. Complete vs Incomplete Rows (Donut Chart)
# ──────────────────────────────────────────────────────────────────────────────
print('[6/8] Complete vs incomplete rows donut chart …')
fig, ax = plt.subplots(figsize=(8, 8))
sizes = [complete_rows, incomplete_rows]
labels_pie = [f'Complete\n{complete_rows:,} ({complete_rows/n_rows*100:.1f}%)',
              f'Incomplete\n{incomplete_rows:,} ({incomplete_rows/n_rows*100:.1f}%)']
colors_pie = ['#4caf50', '#f44336']
explode = (0.03, 0.03)
wedges, texts = ax.pie(sizes, labels=labels_pie, colors=colors_pie, startangle=90,
                       explode=explode, textprops={'fontsize': 13, 'fontweight': 'bold'},
                       wedgeprops={'edgecolor': 'white', 'linewidth': 2})
# Donut hole
centre_circle = plt.Circle((0, 0), 0.55, fc='white')
ax.add_artist(centre_circle)
ax.text(0, 0, f'{n_rows:,}\nTotal Rows', ha='center', va='center',
        fontsize=16, fontweight='bold', color='#333333')
ax.set_title('Complete vs Incomplete Rows', fontsize=15, fontweight='bold', pad=15)
save_fig(fig, '06_complete_vs_incomplete_rows.png')

# ──────────────────────────────────────────────────────────────────────────────
# 7. Missingness by Groups (Gender, Location, Policy Type, Age Groups)
# ──────────────────────────────────────────────────────────────────────────────
print('[7/8] Missingness by demographic groups …')

# Create Age groups
df['Age Group'] = pd.cut(df['Age'], bins=[17, 30, 45, 64], labels=['18-30', '31-45', '46-64'])

group_cols = ['Gender', 'Location', 'Policy Type', 'Age Group']
fig, axes = plt.subplots(2, 2, figsize=(18, 14))
axes = axes.flatten()

for idx, grp_col in enumerate(group_cols):
    ax = axes[idx]
    # For each group value, compute missing % across all columns with missing values
    group_miss = (
        df.groupby(grp_col)[missing_cols]
        .apply(lambda g: g.isnull().mean() * 100)
    )
    # group_miss has shape (n_groups, n_missing_cols) — plot as grouped bar
    group_miss_plot = group_miss.T  # columns = groups, rows = missing columns
    group_miss_plot.plot(kind='bar', ax=ax, width=0.75, edgecolor='black', linewidth=0.3)
    ax.set_title(f'Missing % by {grp_col}', fontsize=13, fontweight='bold')
    ax.set_ylabel('Missing %', fontsize=11)
    ax.set_xlabel('')
    ax.tick_params(axis='x', rotation=45)
    ax.legend(title=grp_col, fontsize=8, title_fontsize=9, loc='upper right')
    ax.yaxis.set_major_formatter(mticker.FormatStrFormatter('%.1f%%'))

fig.suptitle('Missingness Percentage Broken Down by Demographic Groups',
             fontsize=16, fontweight='bold', y=1.01)
plt.tight_layout()
save_fig(fig, '07_missingness_by_groups.png')

# Drop temporary column
df.drop(columns=['Age Group'], inplace=True)

# ──────────────────────────────────────────────────────────────────────────────
# 8. Binary Missingness Indicator Correlation Matrix
# ──────────────────────────────────────────────────────────────────────────────
print('[8/8] Binary missingness correlation matrix …')

miss_indicators = df[missing_cols].isnull().astype(int)
miss_corr = miss_indicators.corr()

fig, ax = plt.subplots(figsize=(12, 10))
mask = np.triu(np.ones_like(miss_corr, dtype=bool), k=1)
sns.heatmap(miss_corr, mask=mask, annot=True, fmt='.2f', cmap='coolwarm',
            center=0, vmin=-1, vmax=1, square=True, linewidths=0.5,
            cbar_kws={'shrink': 0.8, 'label': 'Pearson Correlation'},
            ax=ax)
ax.set_title('Binary Missingness Indicator Correlation Matrix',
             fontsize=15, fontweight='bold', pad=15)
ax.tick_params(axis='both', labelsize=10)
save_fig(fig, '08_missingness_correlation.png')

# ── Correlation insights ─────────────────────────────────────────────────────
print('\n─── Missingness Correlation Insights ───')
upper = miss_corr.where(np.triu(np.ones_like(miss_corr, dtype=bool), k=1))
strong_pairs = []
for col in upper.columns:
    for row in upper.index:
        val = upper.loc[row, col]
        if pd.notna(val) and abs(val) > 0.05:
            strong_pairs.append((row, col, val))
strong_pairs.sort(key=lambda x: -abs(x[2]))

if strong_pairs:
    print('   Notable correlations (|r| > 0.05) between missingness indicators:')
    for c1, c2, r in strong_pairs[:10]:
        direction = 'tend to be missing together' if r > 0 else 'inversely missing'
        print(f'     {c1:25s}  ↔  {c2:25s}  r = {r:+.3f}  ({direction})')
else:
    print('   Missingness appears to be largely independent across columns.')

# ═════════════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═════════════════════════════════════════════════════════════════════════════
print('\n' + '=' * 90)
print('  COMPREHENSIVE SUMMARY')
print('=' * 90)
print(f'''
  Dataset: insurance_sample_20000.csv
  Rows: {n_rows:,}  |  Columns: {n_cols}
  Total cells: {total_cells:,}  |  Missing cells: {total_missing:,} ({total_missing/total_cells*100:.2f}%)
  Complete rows: {complete_rows:,} ({complete_rows/n_rows*100:.1f}%)  |  Incomplete rows: {incomplete_rows:,} ({incomplete_rows/n_rows*100:.1f}%)
  Columns with missing data: {len(missing_cols)} of {n_cols}
  Duplicate rows: {n_dup_rows:,}  |  Duplicate IDs: {n_dup_ids:,}
  Pseudo-missing values: {sum(pseudo_counts.values()) if pseudo_counts else 0}

  Highest missing columns:''')
for _, row in summary_df.head(5).iterrows():
    if row['Missing Count'] > 0:
        print(f"    • {row['Column']:25s}  {row['Missing Count']:>6,} ({row['Missing %']:.1f}%)  → {row['Recommended Treatment']}")

print(f'''
  Output files:
    📄 {summary_csv_path}
    📊 {FIGURES_DIR}/01_missing_count_bar.png
    📊 {FIGURES_DIR}/02_missing_pct_bar.png
    📊 {FIGURES_DIR}/03_missingness_matrix.png
    📊 {FIGURES_DIR}/04_missingness_heatmap.png
    📊 {FIGURES_DIR}/05_missingness_pattern_freq.png
    📊 {FIGURES_DIR}/06_complete_vs_incomplete_rows.png
    📊 {FIGURES_DIR}/07_missingness_by_groups.png
    📊 {FIGURES_DIR}/08_missingness_correlation.png
''')
print('  ✅  Stage 1 & 2 complete.\n')
