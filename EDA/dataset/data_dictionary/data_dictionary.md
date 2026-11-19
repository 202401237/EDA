# Insurance Premium Prediction Dataset - Master Data Dictionary

This data dictionary formally defines all 21 features in the Insurance Premium Prediction dataset, including statistical roles, data types, observed domain ranges, missingness prevalences (population vs. representative sample), cardinality, and actuarial preprocessing recommendations.

| # | Column Name | Data Type | Analytical Role | Description | Observed Domain Range | Missing % (Pop / Sample) | Cardinality | Recommended Actuarial Preprocessing |
| :-: | :--- | :---: | :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | **`id`** | `int64` | Identifier | Unique integer identifier for each policy record | `0` to `1,199,999` | 0.00% / 0.00% | 20,000 | Retain as primary key; exclude from actuarial feature vectors |
| 2 | **`Age`** | `float64` | Numerical Predictor | Age of primary policyholder in years | `18.0` to `64.0` | 1.56% / 1.50% | 47 | Median imputation (41.0); uniform distribution preserves central tendency |
| 3 | **`Gender`** | `object` | Categorical Predictor | Gender of policyholder ('Male', 'Female') | `Female` to `Male` | 0.00% / 0.00% | 2 | One-hot / binary encoding (50.05% Male, 49.95% Female) |
| 4 | **`Annual Income`** | `float64` | Numerical Predictor | Annual gross income of policyholder in USD | `1.00` to `149,974.00` | 3.75% / 3.66% | 11,552 | Median imputation ($23,897) + retain binary missingness indicator (MNAR signal: -$175.63 lower premium, p < 1e-6); retain legitimate upper tail outliers |
| 5 | **`Marital Status`** | `object` | Categorical Predictor | Marital status of policyholder ('Single', 'Married', 'Divorced') | `Divorced` to `Single` | 1.54% / 1.50% | 3 | Treat missing values as explicit 'Missing' category (strong MNAR signal: +$197.88 premium lift, p = 1.8e-5) |
| 6 | **`Number of Dependents`** | `float64` | Numerical Predictor | Count of dependent individuals supported by policyholder | `0.0` to `4.0` | 9.14% / 8.91% | 5 | Median imputation (2.0) + binary missingness indicator |
| 7 | **`Education Level`** | `object` | Categorical Predictor | Highest completed education ('High School', 'Bachelor's', 'Master's', 'PhD') | `Bachelor's` to `PhD` | 0.00% / 0.00% | 4 | Ordinal or one-hot encoding; perfectly balanced distribution (~25% each) |
| 8 | **`Occupation`** | `object` | Categorical Predictor | Employment status ('Employed', 'Self-Employed', 'Unemployed') | `Employed` to `Unemployed` | 29.84% / 29.70% | 3 | Treat missing values as explicit 'Missing' category; mode imputation would artificially distort class balance by 30% |
| 9 | **`Health Score`** | `float64` | Numerical Predictor | Actuarial health index score from biometric underwriting | `2.01` to `58.98` | 6.17% / 5.87% | 17,892 | Iterative Bayesian Ridge imputation + retain binary missingness indicator (missing health score = +$86.91 premium lift, p = 3e-4) |
| 10 | **`Location`** | `object` | Categorical Predictor | Geographical environment of policyholder residence ('Urban', 'Suburban', 'Rural') | `Rural` to `Urban` | 0.00% / 0.00% | 3 | One-hot encoding; uniform distribution (~33.3% each) |
| 11 | **`Policy Type`** | `object` | Categorical Predictor | Insurance policy tier ('Basic', 'Comprehensive', 'Premium') | `Basic` to `Premium` | 0.00% / 0.00% | 3 | One-hot encoding; uniform distribution (~33.3% each) |
| 12 | **`Previous Claims`** | `float64` | Numerical Predictor | Number of insurance claims filed prior to current policy | `0.0` to `8.0` | 30.34% / 30.01% | 8 | Median imputation (1.0) + binary missingness indicator; strongest linear predictor of Premium Amount (r = +0.0441, p = 1.8e-7); retain extreme counts |
| 13 | **`Vehicle Age`** | `float64` | Numerical Predictor | Age of insured vehicle in years | `0.0` to `19.0` | 0.00% / 0.00% | 20 | No imputation required in 20k sample; platykurtic uniform distribution |
| 14 | **`Credit Score`** | `float64` | Numerical Predictor | Actuarial credit risk score (FICO-like scale) | `300.0` to `849.0` | 11.49% / 11.73% | 550 | Iterative Bayesian Ridge imputation + binary missingness indicator; monotonic negative relationship with premium (Spearman rho = -0.0522, p = 1.5e-12) |
| 15 | **`Insurance Duration`** | `float64` | Numerical Predictor | Years of continuous tenure as a customer with insurer | `1.0` to `9.0` | 0.00% / 0.00% | 9 | No imputation required in 20k sample; uniform distribution (1-9 years) |
| 16 | **`Policy Start Date`** | `object` | Temporal Predictor | Timestamp when policy commenced coverage | `2020-01-01` to `2023-12-31` | 0.00% / 0.00% | 17,489 | Extract Policy Year, Policy Month, Day of Week; note fixed timestamp artifact '15:21:39.xxxxxx' across 100% of rows |
| 17 | **`Customer Feedback`** | `object` | Categorical Predictor | Customer satisfaction sentiment ('Good', 'Average', 'Poor') | `Average` to `Poor` | 6.49% / 6.68% | 3 | Treat missing values as explicit 'Missing' category; missing feedback associated with +$102.56 higher premium |
| 18 | **`Smoking Status`** | `object` | Categorical Predictor | Tobacco user indicator ('Yes', 'No') | `No` to `Yes` | 0.00% / 0.00% | 2 | Binary encoding (50.00% Yes, 50.00% No) |
| 19 | **`Exercise Frequency`** | `object` | Categorical Predictor | Reported physical exercise frequency ('Daily', 'Weekly', 'Monthly', 'Rarely') | `Daily` to `Weekly` | 0.00% / 0.00% | 4 | Ordinal or one-hot encoding; balanced distribution (~25% each) |
| 20 | **`Property Type`** | `object` | Categorical Predictor | Residential home structure ('Apartment', 'House', 'Condo') | `Apartment` to `House` | 0.00% / 0.00% | 3 | One-hot encoding; balanced distribution (~33.3% each) |
| 21 | **`Premium Amount`** | `float64` | Target Variable | Annual insurance premium amount in USD (Continuous regression target) | `20.00` to `4,999.00` | 0.00% / 0.00% | 3,113 | Retain 100% untouched without clipping; apply square-root transform sqrt(Premium Amount) for homoscedastic regression; preserve 856 IQR extreme outliers |

---

### Column Taxonomy Summary
- **Total Columns:** 21
- **Identifier:** 1 (`id`)
- **Continuous Actuarial Target:** 1 (`Premium Amount`)
- **Numerical Features:** 9 (`Age`, `Annual Income`, `Number of Dependents`, `Health Score`, `Previous Claims`, `Vehicle Age`, `Credit Score`, `Insurance Duration`, `Premium Amount`)
- **Categorical Features:** 10 (`Gender`, `Marital Status`, `Education Level`, `Occupation`, `Location`, `Policy Type`, `Customer Feedback`, `Smoking Status`, `Exercise Frequency`, `Property Type`)
- **Temporal Feature:** 1 (`Policy Start Date`)
- **Features with Missing Values:** 11 in Population (`train.csv`), 9 in 20,000 Sample (`insurance_sample_20000.csv`)
