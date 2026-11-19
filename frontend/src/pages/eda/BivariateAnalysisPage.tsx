import React, { useState, useEffect } from 'react';
import { Split, Filter, BarChart3, TrendingUp, CheckCircle2, Table2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { fetchBivariate } from '../../services/edaApi';
import type { BivariateResponse, BivariateNumericalBin, BivariateCategoricalGroup } from '../../types/eda';
import { EdaSectionHeader } from '../../components/eda/EdaSectionHeader';
import { EdaCard } from '../../components/eda/EdaCard';
import { EdaLoading } from '../../components/eda/EdaLoading';
import { EdaError } from '../../components/eda/EdaError';
import { EdaFigureCard } from '../../components/eda/EdaFigureCard';

const NUMERICAL_PREDICTORS = [
  'Previous Claims', 'Credit Score', 'Age', 'Annual Income',
  'Vehicle Age', 'Insurance Duration', 'Health Score', 'Number of Dependents'
];

const CATEGORICAL_PREDICTORS = [
  'Policy Type', 'Smoking Status', 'Location', 'Occupation',
  'Education Level', 'Customer Feedback', 'Gender', 'Marital Status',
  'Exercise Frequency', 'Property Type'
];

export function BivariateAnalysisPage() {
  const [data, setData] = useState<BivariateResponse | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string>('Previous Claims');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (feat = '', bypass = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBivariate(feat || undefined, bypass);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load bivariate analysis'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedFeature);
  }, [selectedFeature]);

  if (loading && !data) return <EdaLoading message="Stratifying predictors against continuous Premium Amount target..." />;
  if (error || !data) return <EdaError error={error} onRetry={() => loadData(selectedFeature, true)} />;

  const isNum = selectedFeature in data.numerical_bivariate;
  const numBins: BivariateNumericalBin[] = data.numerical_bivariate[selectedFeature] || [];
  const catGroups: BivariateCategoricalGroup[] = data.categorical_bivariate[selectedFeature] || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <EdaSectionHeader
        dimensionNumber="Dimension 08"
        title="Bivariate Predictor-to-Target Stratification"
        subtitle="Quantile-binned conditioning of numerical predictors and categorical stratification across the continuous Premium Amount response surface."
        badge="Target Stratification"
        actions={
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-teal-500 font-semibold"
            >
              <optgroup label="Numerical Predictors (8)">
                {NUMERICAL_PREDICTORS.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Categorical Predictors (10)">
                {CATEGORICAL_PREDICTORS.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        }
      />

      {/* Chart: Mean and Median Premium across Strata */}
      <EdaCard
        title={`${selectedFeature} vs Premium Amount Response`}
        subtitle={
          isNum
            ? 'Quantile-binned predictor intervals conditioned on expected and median pricing'
            : 'Categorical market levels evaluated across target premium distribution'
        }
        icon={BarChart3}
        badge={isNum ? 'Quantile Bins' : 'Categorical Levels'}
        badgeVariant="teal"
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={
                isNum
                  ? numBins.map((b) => ({
                      strata: b.bin_range,
                      'Mean Premium ($)': b.mean_premium,
                      'Median Premium ($)': b.median_premium,
                      count: b.count,
                    }))
                  : catGroups.map((c) => ({
                      strata: c.category,
                      'Mean Premium ($)': c.mean_premium,
                      'Median Premium ($)': c.median_premium,
                      count: c.count,
                    }))
              }
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="strata" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="$" domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Mean Premium ($)" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Median Premium ($)" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </EdaCard>

      {/* Stratification Data Table */}
      <EdaCard
        title={`${selectedFeature} — Stratification Data Table`}
        subtitle="Empirical pricing metrics per conditioning segment"
        icon={Table2}
      >
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">{isNum ? 'Quantile Interval' : 'Category'}</th>
                <th className="px-4 py-3">Sample Count</th>
                <th className="px-4 py-3">Mean Premium ($)</th>
                <th className="px-4 py-3">Median Premium ($)</th>
                {!isNum && <th className="px-4 py-3">Std Dev ($)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {isNum
                ? numBins.map((b, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-white font-mono">{b.bin_range}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{b.count.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-teal-300 font-bold">${b.mean_premium.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-indigo-300 font-bold">${b.median_premium.toFixed(2)}</td>
                    </tr>
                  ))
                : catGroups.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-white">{c.category}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{c.count.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-teal-300 font-bold">${c.mean_premium.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-indigo-300 font-bold">${c.median_premium.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">${c.std_premium.toFixed(2)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </EdaCard>

      {/* Key Findings List & Publication Figures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EdaCard
          title="Empirical Bivariate Findings"
          subtitle="Key actuarial associations uncovered across predictor-to-target slices"
          icon={TrendingUp}
          badge="Actuarial Findings"
          badgeVariant="teal"
        >
          <div className="space-y-3">
            {data.key_findings.map((finding, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{finding}</p>
              </div>
            ))}
          </div>
        </EdaCard>

        <EdaFigureCard
          title="Premium vs Numerical Bivariate Stratification"
          category="Bivariate"
          urlPath="/static/visualizations/bivariate/09_premium_vs_numerical_bivariate.png"
          description="Publication panel displaying conditional mean and median premium curves across all continuous variables."
        />
      </div>
    </div>
  );
}
