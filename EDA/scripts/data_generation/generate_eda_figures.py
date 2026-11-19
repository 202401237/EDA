"""
generate_figures.py
Generates all 12 publication-quality visualizations for the insurance dataset EDA project.
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# Set styling
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 10
plt.rcParams['axes.titlesize'] = 12
plt.rcParams['axes.titleweight'] = 'bold'
plt.rcParams['axes.labelsize'] = 11
plt.rcParams['xtick.labelsize'] = 9
plt.rcParams['ytick.labelsize'] = 9
plt.rcParams['legend.fontsize'] = 9
plt.rcParams['figure.titlesize'] = 14

os.makedirs('figures', exist_ok=True)

print("Loading data...")
sample_paths = [
    os.path.join('..', 'dataset', 'sampled_dataset', 'insurance_sample_20000.csv'),
    os.path.join('dataset', 'sampled_dataset', 'insurance_sample_20000.csv'),
    'insurance_sample_20000.csv'
]
sample_path = next((p for p in sample_paths if os.path.exists(p)), 'insurance_sample_20000.csv')
df_samp = pd.read_csv(sample_path)
print(f"Sample dataset loaded: {df_samp.shape[0]:,} rows x {df_samp.shape[1]} cols")

train_paths = [
    os.path.join('..', 'dataset', 'original_dataset', 'train.csv'),
    'train.csv'
]
train_path = next((p for p in train_paths if os.path.exists(p)), None)
if train_path:
    df_orig = pd.read_csv(train_path)
    print(f"Population dataset loaded: {df_orig.shape[0]:,} rows")
else:
    df_orig = None
    print("Note: train.csv not found locally (excluded for GitHub storage). Figures 3-12 can be generated from sample.")

# -------------------------------------------------------------
# Figure 1: Sampling Validation Distributions
# -------------------------------------------------------------
if df_orig is not None:
    print("Generating Figure 1: Sampling Validation Distributions...")
fig, axes = plt.subplots(2, 2, figsize=(14, 10), dpi=300)

features_to_plot = [
    ('Premium Amount', 'Premium Amount ($)', axes[0, 0]),
    ('Annual Income', 'Annual Income ($)', axes[0, 1]),
    ('Health Score', 'Health Score Index', axes[1, 0]),
    ('Age', 'Age (Years)', axes[1, 1])
]

for col, xlabel, ax in features_to_plot:
    sns.kdeplot(df_orig[col].dropna(), ax=ax, label=f'Original (N=1.2M)\nMean={df_orig[col].mean():.1f}, Med={df_orig[col].median():.1f}',
                color='#1f77b4', linewidth=2.2, fill=True, alpha=0.15)
    sns.kdeplot(df_samp[col].dropna(), ax=ax, label=f'Sample (n=20k)\nMean={df_samp[col].mean():.1f}, Med={df_samp[col].median():.1f}',
                color='#ff7f0e', linewidth=2.0, linestyle='--')
    ax.set_title(f'Distribution Alignment: {col}')
    ax.set_xlabel(xlabel)
    ax.set_ylabel('Density')
    ax.legend(loc='upper right', frameon=True)

plt.suptitle('Figure 1: Distribution Fidelity - Population (1.2M) vs. Representative Sample (20k)', fontsize=15, weight='bold', y=0.99)
plt.tight_layout()
plt.savefig('figures/01_sampling_validation_distributions.png', dpi=300, bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# Figure 2: Sampling Validation Categorical Proportions
# -------------------------------------------------------------
print("Generating Figure 2: Sampling Validation Categorical Proportions...")
cat_cols = ['Policy Type', 'Location', 'Marital Status', 'Occupation', 'Education Level', 'Customer Feedback']
fig, axes = plt.subplots(2, 3, figsize=(16, 10), dpi=300)
axes = axes.flatten()

for i, col in enumerate(cat_cols):
    ax = axes[i]
    o_vc = (df_orig[col].fillna('Missing').value_counts(normalize=True) * 100).rename('Original')
    s_vc = (df_samp[col].fillna('Missing').value_counts(normalize=True) * 100).rename('Sample')
    comp_df = pd.concat([o_vc, s_vc], axis=1).sort_index()
    
    comp_df.plot(kind='bar', ax=ax, color=['#2b5c8f', '#e66101'], width=0.75, alpha=0.9)
    ax.set_title(f'{col} Proportions (%)')
    ax.set_ylabel('Percentage (%)')
    ax.set_xlabel('')
    ax.set_xticklabels(comp_df.index, rotation=25, ha='right')
    ax.legend(['Original (1.2M)', 'Sample (20k)'])
    
    # Add difference text annotations
    for p_idx, (idx_val, row) in enumerate(comp_df.iterrows()):
        diff = row['Sample'] - row['Original']
        ax.text(p_idx, max(row['Original'], row['Sample']) + 0.8, f"Δ:{diff:+.2f}%", 
                ha='center', fontsize=8, weight='bold', color='#333333')
    ax.set_ylim(0, comp_df.values.max() * 1.2)

plt.suptitle('Figure 2: Categorical Stratum Preservation - Proportions and Percentage Point Differences (Δ)', fontsize=15, weight='bold', y=0.99)
plt.tight_layout()
plt.savefig('figures/02_sampling_validation_categories.png', dpi=300, bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# Figure 3: Missing Value Bar Chart and Co-occurrence Heatmap
# -------------------------------------------------------------
print("Generating Figure 3: Missing Values...")
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7), dpi=300)

# Bar chart of missingness
miss_orig = (df_orig.isnull().mean() * 100).sort_values(ascending=False)
miss_cols = miss_orig[miss_orig > 0].index.tolist()

miss_comp = pd.DataFrame({
    'Original (1.2M)': (df_orig[miss_cols].isnull().mean() * 100),
    'Sample (20k)': (df_samp[miss_cols].isnull().mean() * 100)
})

miss_comp.plot(kind='barh', ax=ax1, color=['#4575b4', '#d73027'], width=0.75)
ax1.set_title('A: Missing Value Prevalence by Column (Sample vs Population)', fontsize=12, weight='bold')
ax1.set_xlabel('Missingness Percentage (%)')
ax1.invert_yaxis()
ax1.legend(loc='lower right')
for i, (col, row) in enumerate(miss_comp.iterrows()):
    ax1.text(row['Sample (20k)'] + 0.5, i, f"{row['Sample (20k)']:.2f}%", va='center', fontsize=9)
ax1.set_xlim(0, 35)

# Missingness correlation heatmap in sample
null_matrix = df_samp[miss_cols].isnull().astype(int)
null_corr = null_matrix.corr()
mask = np.triu(np.ones_like(null_corr, dtype=bool))
sns.heatmap(null_corr, mask=mask, annot=True, fmt='.3f', cmap='coolwarm', vmin=-0.05, vmax=0.05,
            ax=ax2, cbar_kws={'label': 'Pearson Correlation of Missingness Indicators'})
ax2.set_title('B: Missingness Co-occurrence & Indicator Correlation Heatmap', fontsize=12, weight='bold')
ax2.set_xticklabels(ax2.get_xticklabels(), rotation=45, ha='right')

plt.suptitle('Figure 3: Missing Value Structure and Co-occurrence Patterns (MCAR Evaluation)', fontsize=15, weight='bold', y=0.99)
plt.tight_layout()
plt.savefig('figures/03_missing_values_bar_and_matrix.png', dpi=300, bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# Figure 4: Numerical Distributions Univariate (3x3 grid)
# -------------------------------------------------------------
print("Generating Figure 4: Numerical Distributions...")
num_cols = ['Age', 'Annual Income', 'Number of Dependents', 'Health Score', 
            'Previous Claims', 'Vehicle Age', 'Credit Score', 'Insurance Duration', 'Premium Amount']

fig, axes = plt.subplots(3, 3, figsize=(16, 12), dpi=300)
axes = axes.flatten()

for i, col in enumerate(num_cols):
    ax = axes[i]
    s = df_samp[col].dropna()
    is_discrete = col in ['Number of Dependents', 'Previous Claims', 'Insurance Duration', 'Vehicle Age']
    
    if is_discrete:
        sns.histplot(s, ax=ax, discrete=True, color='#2b5c8f', alpha=0.75, stat='density')
    else:
        sns.histplot(s, ax=ax, kde=True, color='#2b5c8f', alpha=0.6, stat='density', bins=35)
    
    mean_val = s.mean()
    median_val = s.median()
    skew_val = s.skew()
    
    ax.axvline(mean_val, color='#d95f02', linestyle='-', linewidth=2, label=f'Mean: {mean_val:.1f}')
    ax.axvline(median_val, color='#1b9e77', linestyle='--', linewidth=2, label=f'Median: {median_val:.1f}')
    ax.set_title(f'{col} (Skew: {skew_val:+.2f})')
    ax.set_ylabel('Density')
    ax.legend(loc='upper right', frameon=True)

plt.suptitle('Figure 4: Univariate Numerical Feature Distributions (Representative 20,000 Sample)', fontsize=15, weight='bold', y=0.99)
plt.tight_layout()
plt.savefig('figures/04_numerical_distributions_univariate.png', dpi=300, bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# Figure 5: Categorical Distributions Univariate (4x2 grid)
# -------------------------------------------------------------
print("Generating Figure 5: Categorical Distributions...")
cat_analysis_cols = ['Gender', 'Marital Status', 'Education Level', 'Occupation', 
                     'Location', 'Policy Type', 'Customer Feedback', 'Smoking Status']

fig, axes = plt.subplots(4, 2, figsize=(15, 14), dpi=300)
axes = axes.flatten()

for i, col in enumerate(cat_analysis_cols):
    ax = axes[i]
    counts = df_samp[col].fillna('Missing').value_counts()
    pcts = (counts / len(df_samp)) * 100
    
    bars = ax.bar(pcts.index, pcts.values, color='#386cb0', width=0.6, edgecolor='black', alpha=0.85)
    ax.set_title(f'Category Share: {col}')
    ax.set_ylabel('Percentage of Sample (%)')
    ax.set_ylim(0, pcts.max() * 1.25)
    ax.set_xticklabels(pcts.index, rotation=20, ha='right')
    
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height:.1f}%',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 4), textcoords="offset points",
                    ha='center', va='bottom', fontsize=9, weight='bold')

plt.suptitle('Figure 5: Univariate Categorical Profiles and Prevalence Frequencies (20,000 Sample)', fontsize=15, weight='bold', y=0.99)
plt.tight_layout()
plt.savefig('figures/05_categorical_distributions_univariate.png', dpi=300, bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# Figure 6: Outlier Box Plots
# -------------------------------------------------------------
print("Generating Figure 6: Outlier Boxplots...")
outlier_features = ['Age', 'Annual Income', 'Health Score', 'Credit Score', 'Vehicle Age', 'Previous Claims', 'Premium Amount']
fig, axes = plt.subplots(2, 4, figsize=(18, 9), dpi=300)
axes = axes.flatten()

for i, col in enumerate(outlier_features):
    ax = axes[i]
    s = df_samp[col].dropna()
    q25, q75 = s.quantile(0.25), s.quantile(0.75)
    iqr = q75 - q25
    upper_fence = q75 + 1.5 * iqr
    outliers_count = (s > upper_fence).sum()
    
    sns.boxplot(y=s, ax=ax, color='#a6bddb', flierprops={'marker': 'o', 'markersize': 3, 'alpha': 0.5, 'color': '#d95f02'})
    ax.axhline(upper_fence, color='red', linestyle=':', linewidth=1.5, label=f'Upper Fence: {upper_fence:.1f}')
    ax.set_title(f'{col}\nOutliers: {outliers_count} ({outliers_count/len(s)*100:.1f}%)')
    ax.set_ylabel(col)
    ax.legend(loc='upper right', fontsize=8)

# Remove empty 8th subplot
fig.delaxes(axes[7])

plt.suptitle('Figure 6: Tukey Outlier Boxplots with 1.5x IQR Fences Across Core Numerical Features', fontsize=15, weight='bold', y=0.99)
plt.tight_layout()
plt.savefig('figures/06_outlier_boxplots.png', dpi=300, bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# Figure 7: Premium Amount Distribution and Transformations
# -------------------------------------------------------------
print("Generating Figure 7: Target Distribution and Transformations...")
fig, axes = plt.subplots(2, 3, figsize=(16, 9), dpi=300)

p_raw = df_samp['Premium Amount'].dropna()
p_sqrt = np.sqrt(p_raw)
p_log = np.log1p(p_raw)

transforms = [
    ('Raw Premium Amount ($)', p_raw, axes[0, 0], axes[1, 0], 'steelblue'),
    ('Square Root Transform: sqrt(Premium)', p_sqrt, axes[0, 1], axes[1, 1], 'darkseagreen'),
    ('Log Transform: log1p(Premium)', p_log, axes[0, 2], axes[1, 2], 'salmon')
]

for title, data, hist_ax, qq_ax, color in transforms:
    # Histogram & KDE
    sns.histplot(data, ax=hist_ax, kde=True, color=color, stat='density', bins=35)
    hist_ax.set_title(f'{title}\nSkewness: {data.skew():+.3f} | Kurtosis: {data.kurtosis():+.3f}')
    hist_ax.set_ylabel('Density')
    hist_ax.set_xlabel('Transformed Value')
    
    # Q-Q plot against normal distribution
    stats.probplot(data, dist="norm", plot=qq_ax)
    qq_ax.set_title(f'Normal Q-Q Plot: {title.split(":")[0]}')
    qq_ax.get_lines()[0].set_color(color)
    qq_ax.get_lines()[0].set_markersize(3)
    qq_ax.get_lines()[1].set_color('black')

plt.suptitle('Figure 7: Target Variable (Premium Amount) Distribution Analysis and Power Transformations', fontsize=15, weight='bold', y=0.99)
plt.tight_layout()
plt.savefig('figures/07_premium_distribution_and_transform.png', dpi=300, bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# Figure 8: Pearson and Spearman Correlation Heatmaps
# -------------------------------------------------------------
print("Generating Figure 8: Correlation Heatmaps...")
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(17, 7), dpi=300)

corr_cols = [c for c in num_cols if c != 'id']
p_corr = df_samp[corr_cols].corr(method='pearson')
s_corr = df_samp[corr_cols].corr(method='spearman')
mask = np.triu(np.ones_like(p_corr, dtype=bool))

sns.heatmap(p_corr, mask=mask, annot=True, fmt='.3f', cmap='vlag', vmin=-0.15, vmax=0.15,
            ax=ax1, cbar_kws={'label': 'Pearson Correlation (r)'})
ax1.set_title('A: Pearson Linear Correlation Matrix', fontsize=13, weight='bold')
ax1.set_xticklabels(ax1.get_xticklabels(), rotation=45, ha='right')

sns.heatmap(s_corr, mask=mask, annot=True, fmt='.3f', cmap='vlag', vmin=-0.15, vmax=0.15,
            ax=ax2, cbar_kws={'label': 'Spearman Rank Correlation (rho)'})
ax2.set_title('B: Spearman Monotonic Rank Correlation Matrix', fontsize=13, weight='bold')
ax2.set_xticklabels(ax2.get_xticklabels(), rotation=45, ha='right')

plt.suptitle('Figure 8: Pairwise Feature Correlation Structures (Linear vs. Rank)', fontsize=15, weight='bold', y=0.99)
plt.tight_layout()
plt.savefig('figures/08_correlation_heatmaps.png', dpi=300, bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# Figure 9: Premium vs Numerical Features (Bivariate)
# -------------------------------------------------------------
print("Generating Figure 9: Bivariate Numerical vs Premium...")
fig, axes = plt.subplots(2, 2, figsize=(15, 11), dpi=300)

# 1. Previous Claims vs Premium (Boxplot + Median trend line)
ax1 = axes[0, 0]
claims_df = df_samp.dropna(subset=['Previous Claims'])
sns.boxplot(x='Previous Claims', y='Premium Amount', data=claims_df, ax=ax1, palette='Blues_r', showmeans=True,
            meanprops={'marker':'o', 'markerfacecolor':'red', 'markeredgecolor':'black', 'markersize':6})
ax1.set_title('A: Premium Amount by Previous Claims (r = +0.044, p < 0.001)')
ax1.set_ylabel('Premium Amount ($)')

# 2. Annual Income vs Premium (Hexbin + Quantile Bins)
ax2 = axes[0, 1]
inc_clean = df_samp.dropna(subset=['Annual Income', 'Premium Amount'])
hb = ax2.hexbin(inc_clean['Annual Income'], inc_clean['Premium Amount'], gridsize=35, cmap='Blues', mincnt=1)
cb = fig.colorbar(hb, ax=ax2)
cb.set_label('Point Density')
# Binned median curve
inc_clean_binned = inc_clean.copy()
inc_clean_binned['Income_Bin'] = pd.qcut(inc_clean_binned['Annual Income'], 10)
bin_stats = inc_clean_binned.groupby('Income_Bin', observed=False).agg({'Annual Income': 'median', 'Premium Amount': 'median'})
ax2.plot(bin_stats['Annual Income'], bin_stats['Premium Amount'], color='red', marker='s', linewidth=2.5, label='Binned Median Trend')
ax2.set_title('B: Premium Amount vs Annual Income (Hexbin & Medians)')
ax2.set_xlabel('Annual Income ($)')
ax2.set_ylabel('Premium Amount ($)')
ax2.legend(loc='upper right')

# 3. Credit Score vs Premium
ax3 = axes[1, 0]
cred_clean = df_samp.dropna(subset=['Credit Score', 'Premium Amount'])
hb3 = ax3.hexbin(cred_clean['Credit Score'], cred_clean['Premium Amount'], gridsize=35, cmap='BuPu', mincnt=1)
cb3 = fig.colorbar(hb3, ax=ax3)
cb3.set_label('Point Density')
cred_clean_binned = cred_clean.copy()
cred_clean_binned['Credit_Bin'] = pd.qcut(cred_clean_binned['Credit Score'], 10)
c_bin_stats = cred_clean_binned.groupby('Credit_Bin', observed=False).agg({'Credit Score': 'median', 'Premium Amount': 'median'})
ax3.plot(c_bin_stats['Credit Score'], c_bin_stats['Premium Amount'], color='darkorange', marker='o', linewidth=2.5, label='Binned Median Trend')
ax3.set_title('C: Premium Amount vs Credit Score (Spearman rho = -0.052)')
ax3.set_xlabel('Credit Score')
ax3.set_ylabel('Premium Amount ($)')
ax3.legend(loc='upper right')

# 4. Health Score vs Premium
ax4 = axes[1, 1]
health_clean = df_samp.dropna(subset=['Health Score', 'Premium Amount'])
hb4 = ax4.hexbin(health_clean['Health Score'], health_clean['Premium Amount'], gridsize=35, cmap='YlGnBu', mincnt=1)
cb4 = fig.colorbar(hb4, ax=ax4)
cb4.set_label('Point Density')
health_clean_binned = health_clean.copy()
health_clean_binned['Health_Bin'] = pd.qcut(health_clean_binned['Health Score'], 10)
h_bin_stats = health_clean_binned.groupby('Health_Bin', observed=False).agg({'Health Score': 'median', 'Premium Amount': 'median'})
ax4.plot(h_bin_stats['Health Score'], h_bin_stats['Premium Amount'], color='crimson', marker='^', linewidth=2.5, label='Binned Median Trend')
ax4.set_title('D: Premium Amount vs Health Score (Spearman rho = +0.010)')
ax4.set_xlabel('Health Score')
ax4.set_ylabel('Premium Amount ($)')
ax4.legend(loc='upper right')

plt.suptitle('Figure 9: Bivariate Relationships - Premium Amount vs. Key Numerical Drivers', fontsize=15, weight='bold', y=0.99)
plt.tight_layout()
plt.savefig('figures/09_premium_vs_numerical_bivariate.png', dpi=300, bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# Figure 10: Premium vs Categorical Features (Bivariate)
# -------------------------------------------------------------
print("Generating Figure 10: Bivariate Categorical vs Premium...")
fig, axes = plt.subplots(2, 3, figsize=(17, 10), dpi=300)
axes = axes.flatten()

biv_cat_cols = [
    ('Policy Type', axes[0]),
    ('Location', axes[1]),
    ('Occupation', axes[2]),
    ('Smoking Status', axes[3]),
    ('Customer Feedback', axes[4]),
    ('Marital Status', axes[5])
]

for col, ax in biv_cat_cols:
    df_temp = df_samp.copy()
    df_temp[col] = df_temp[col].fillna('Missing')
    order = df_temp.groupby(col)['Premium Amount'].median().sort_values(ascending=False).index
    sns.boxplot(x=col, y='Premium Amount', data=df_temp, order=order, ax=ax, palette='Set2', showmeans=True,
                meanprops={'marker':'D', 'markerfacecolor':'red', 'markeredgecolor':'black', 'markersize':5})
    ax.set_title(f'Premium Amount by {col}')
    ax.set_ylabel('Premium Amount ($)')
    ax.set_xlabel('')
    ax.set_xticklabels(ax.get_xticklabels(), rotation=20, ha='right')

plt.suptitle('Figure 10: Premium Distribution Across Categorical Strata (Red Diamond = Group Mean)', fontsize=15, weight='bold', y=0.99)
plt.tight_layout()
plt.savefig('figures/10_premium_vs_categorical_bivariate.png', dpi=300, bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# Figure 11: Multivariate Feature Relationships
# -------------------------------------------------------------
print("Generating Figure 11: Multivariate Feature Relationships...")
fig, axes = plt.subplots(1, 3, figsize=(18, 5.5), dpi=300)

# Panel 1: Premium by Policy Type and Location
p1_df = df_samp.groupby(['Policy Type', 'Location'])['Premium Amount'].median().unstack()
p1_df.plot(kind='bar', ax=axes[0], color=['#66c2a5', '#fc8d62', '#8da0cb'], width=0.8)
axes[0].set_title('A: Median Premium: Policy Type × Location', weight='bold')
axes[0].set_ylabel('Median Premium ($)')
axes[0].set_xlabel('Policy Type')
axes[0].set_xticklabels(axes[0].get_xticklabels(), rotation=0)
axes[0].legend(title='Location')

# Panel 2: Premium across Age Groups by Smoking Status
df_temp = df_samp.copy()
df_temp['Age_Group'] = pd.cut(df_temp['Age'], bins=[17, 30, 45, 65], labels=['18-30', '31-45', '46-64'])
sns.barplot(x='Age_Group', y='Premium Amount', hue='Smoking Status', data=df_temp.dropna(subset=['Age_Group']),
            ax=axes[1], palette=['#386cb0', '#f0027f'], errorbar=None)
axes[1].set_title('B: Mean Premium: Age Group × Smoking Status', weight='bold')
axes[1].set_ylabel('Mean Premium ($)')
axes[1].set_xlabel('Age Cohort')
axes[1].legend(title='Smoking Status')

# Panel 3: Premium across Previous Claims by Vehicle Age Category
df_temp['Vehicle_Category'] = pd.cut(df_temp['Vehicle Age'], bins=[-1, 5, 12, 20], labels=['New (0-5y)', 'Mid (6-12y)', 'Old (13-19y)'])
claims_veh = df_temp[df_temp['Previous Claims'] <= 4].dropna(subset=['Vehicle_Category', 'Previous Claims'])
sns.lineplot(x='Previous Claims', y='Premium Amount', hue='Vehicle_Category', data=claims_veh,
             ax=axes[2], marker='o', palette='Dark2', errorbar=None, linewidth=2.2)
axes[2].set_title('C: Premium Escalation: Claims × Vehicle Age', weight='bold')
axes[2].set_ylabel('Mean Premium ($)')
axes[2].set_xlabel('Previous Claims (0-4)')
axes[2].legend(title='Vehicle Age Group')

plt.suptitle('Figure 11: Multivariate Interaction Structures on Policy Pricing Dynamics', fontsize=15, weight='bold', y=0.99)
plt.tight_layout()
plt.savefig('figures/11_multivariate_interactions.png', dpi=300, bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# Figure 12: Temporal Analysis (Policy Start Date)
# -------------------------------------------------------------
print("Generating Figure 12: Date Analysis...")
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(15, 9), dpi=300)

df_dates = df_samp.copy()
df_dates['Policy Start Date'] = pd.to_datetime(df_dates['Policy Start Date'])
df_dates['YearMonth'] = df_dates['Policy Start Date'].dt.to_period('M')

monthly_stats = df_dates.groupby('YearMonth').agg({
    'id': 'count',
    'Premium Amount': ['mean', 'median']
})
monthly_stats.columns = ['Policy_Count', 'Premium_Mean', 'Premium_Median']
monthly_stats.index = monthly_stats.index.to_timestamp()

# Monthly policy volume
ax1.plot(monthly_stats.index, monthly_stats['Policy_Count'], color='#2b5c8f', marker='o', linewidth=2.0, markersize=4)
ax1.set_title('A: Monthly Policy Inception Volume (2019-2024)', fontsize=12, weight='bold')
ax1.set_ylabel('New Policies Issued')
ax1.grid(True, linestyle='--', alpha=0.5)

# Monthly premium trends
ax2.plot(monthly_stats.index, monthly_stats['Premium_Mean'], color='#d95f02', marker='s', linewidth=2.0, markersize=4, label='Monthly Mean Premium ($)')
ax2.plot(monthly_stats.index, monthly_stats['Premium_Median'], color='#1b9e77', marker='^', linewidth=2.0, markersize=4, linestyle='--', label='Monthly Median Premium ($)')
ax2.set_title('B: Premium Amount Trajectory Over Time (Inflation / Pricing Stability)', fontsize=12, weight='bold')
ax2.set_ylabel('Premium Amount ($)')
ax2.set_xlabel('Policy Inception Date')
ax2.legend(loc='upper right')
ax2.grid(True, linestyle='--', alpha=0.5)

plt.suptitle('Figure 12: Longitudinal Temporal Patterns and Pricing Trajectory Over Five Years', fontsize=15, weight='bold', y=0.99)
plt.tight_layout()
plt.savefig('figures/12_temporal_trends_dates.png', dpi=300, bbox_inches='tight')
plt.close()

print("All 12 figures successfully generated!")
