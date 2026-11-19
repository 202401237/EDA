import React, { useState, useEffect } from 'react';
import { BarChart3, Hash, Layers, Filter, Activity, Compass } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchUnivariate } from '../../services/edaApi';
import type { UnivariateResponse, NumericalUnivariateProfile, CategoricalUnivariateProfile } from '../../types/eda';
import { EdaSectionHeader } from '../../components/eda/EdaSectionHeader';
import { EdaCard } from '../../components/eda/EdaCard';
import { EdaMetricCard } from '../../components/eda/EdaMetricCard';
import { EdaLoading } from '../../components/eda/EdaLoading';
import { EdaError } from '../../components/eda/EdaError';
import { EdaFigureCard } from '../../components/eda/EdaFigureCard';

const NUMERICAL_COLS = [
  'Age', 'Annual Income', 'Number of Dependents', 'Health Score',
  'Previous Claims', 'Vehicle Age', 'Credit Score', 'Insurance Duration', 'Premium Amount'
];

const CATEGORICAL_COLS = [
  'Gender', 'Marital Status', 'Education Level', 'Occupation',
  'Location', 'Policy Type', 'Customer Feedback', 'Smoking Status',
  'Exercise Frequency', 'Property Type'
];

export function UnivariateAnalysisPage() {
  const [data, setData] = useState<UnivariateResponse | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string>('Age');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (feat = '', bypass = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUnivariate(feat || undefined, bypass);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load univariate analysis'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedFeature);
  }, [selectedFeature]);

  if (loading && !data) return <EdaLoading message="Computing univariate parametric moments, quantiles, and 15-bin histograms..." />;
  if (error || !data) return <EdaError error={error} onRetry={() => loadData(selectedFeature, true)} />;

  const isNumerical = selectedFeature in data.numerical_profiles;
  const numProfile: NumericalUnivariateProfile | undefined = data.numerical_profiles[selectedFeature];
  const catProfile: CategoricalUnivariateProfile | undefined = data.categorical_profiles[selectedFeature];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <EdaSectionHeader
        dimensionNumber="Dimension 07"
        title="Univariate Distributions, Moments & Frequency Profiles"
        subtitle="Detailed parametric and non-parametric statistics, 15-bin histograms, dispersion moments, and frequency profiles for all 19 predictive attributes."
        badge="15-Bin Moments"
        actions={
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-teal-500 font-semibold"
            >
              <optgroup label="Numerical Predictors (9)">
                {NUMERICAL_COLS.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Categorical Predictors (10)">
                {CATEGORICAL_COLS.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        }
      />

      {isNumerical && numProfile && (
        <>
          {/* Numerical Moments KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <EdaMetricCard label="Mean" value={numProfile.mean.toLocaleString()} subtitle="Expected value" accentColor="teal" />
            <EdaMetricCard label="Median" value={numProfile.median.toLocaleString()} subtitle="Q50 / 50th percentile" accentColor="blue" />
            <EdaMetricCard label="Std Dev" value={numProfile.std.toLocaleString()} subtitle="Dispersion spread" accentColor="indigo" />
            <EdaMetricCard label="IQR" value={numProfile.iqr.toLocaleString()} subtitle="Q75 - Q25" accentColor="emerald" />
            <EdaMetricCard label="Skewness" value={numProfile.skewness} subtitle={numProfile.skewness > 0 ? 'Positive / right' : 'Symmetric'} accentColor="amber" />
            <EdaMetricCard label="Kurtosis" value={numProfile.kurtosis} subtitle={numProfile.kurtosis < -1 ? 'Platykurtic' : 'Mesokurtic'} accentColor="purple" />
          </div>

          {/* Histogram Card */}
          <EdaCard
            title={`${selectedFeature} — 15-Bin Frequency Distribution`}
            subtitle={numProfile.distribution_shape}
            icon={BarChart3}
            badge={`${numProfile.count.toLocaleString()} Valid Records`}
            badgeVariant="teal"
          >
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={numProfile.histogram} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </EdaCard>

          {/* Quantile Percentiles Grid */}
          <EdaCard title="Parametric & Non-Parametric Quantile Percentiles" subtitle="Distribution boundaries and dispersion" icon={Activity}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500">Minimum</span>
                <p className="text-white font-bold text-sm mt-1">{numProfile.min.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500">Q25 (25th %)</span>
                <p className="text-teal-300 font-bold text-sm mt-1">{numProfile.q25.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500">Median (Q50)</span>
                <p className="text-white font-bold text-sm mt-1">{numProfile.median.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500">Q75 (75th %)</span>
                <p className="text-teal-300 font-bold text-sm mt-1">{numProfile.q75.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500">Maximum</span>
                <p className="text-white font-bold text-sm mt-1">{numProfile.max.toLocaleString()}</p>
              </div>
            </div>
          </EdaCard>
        </>
      )}

      {!isNumerical && catProfile && (
        <>
          {/* Categorical KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <EdaMetricCard label="Cardinality" value={catProfile.cardinality} subtitle="Distinct category levels" accentColor="indigo" icon={Layers} />
            <EdaMetricCard label="Mode" value={catProfile.mode} subtitle="Most frequent category" accentColor="teal" icon={Compass} />
            <EdaMetricCard label="Valid Observations" value={catProfile.count.toLocaleString()} subtitle="Non-null records" accentColor="emerald" />
            <EdaMetricCard
              label="Missing Values"
              value={`${catProfile.missing_pct}%`}
              subtitle={`${catProfile.missing_count} null rows`}
              accentColor={catProfile.missing_count > 0 ? 'amber' : 'slate'}
            />
          </div>

          {/* Categorical Bar Chart */}
          <EdaCard
            title={`${selectedFeature} — Categorical Frequency Distribution`}
            subtitle="Frequency counts and portfolio market share percentages"
            icon={BarChart3}
            badge={`${catProfile.cardinality} Levels`}
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catProfile.frequencies} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </EdaCard>

          {/* Categorical Table */}
          <EdaCard title="Category Breakdown Table" subtitle="Exact counts and portfolio representation percentages" icon={Layers}>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="px-4 py-3">Category Level</th>
                    <th className="px-4 py-3">Policyholder Count</th>
                    <th className="px-4 py-3">Portfolio Share (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {catProfile.frequencies.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-white">{f.category}</td>
                      <td className="px-4 py-3 font-mono text-teal-300">{f.count.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-300 font-bold">{f.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </EdaCard>
        </>
      )}

      {/* Publication Univariate Figure */}
      <EdaFigureCard
        title="Comprehensive Univariate Distribution Matrix"
        category="Univariate"
        urlPath="/static/visualizations/univariate/04_numerical_distributions_univariate.png"
        description="Publication figure exhibiting probability density and boxplots across all continuous numerical predictors."
      />
    </div>
  );
}
