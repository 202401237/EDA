import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, BarChart3, Scale, ShieldCheck, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchTargetAnalysis } from '../../services/edaApi';
import type { TargetAnalysisResponse } from '../../types/eda';
import { EdaSectionHeader } from '../../components/eda/EdaSectionHeader';
import { EdaCard } from '../../components/eda/EdaCard';
import { EdaMetricCard } from '../../components/eda/EdaMetricCard';
import { EdaLoading } from '../../components/eda/EdaLoading';
import { EdaError } from '../../components/eda/EdaError';
import { EdaFigureCard } from '../../components/eda/EdaFigureCard';

export function TargetAnalysisPage() {
  const [target, setTarget] = useState<TargetAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (bypass = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTargetAnalysis(bypass);
      setTarget(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load target variable analysis'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !target) return <EdaLoading message="Evaluating Premium Amount regression surface, percentiles, and transformation benchmarks..." />;
  if (error || !target) return <EdaError error={error} onRetry={() => loadData(true)} />;

  const stats = target.sample_statistics;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <EdaSectionHeader
        dimensionNumber="Dimension 13"
        title="Target Variable Analysis: Premium Amount Profile"
        subtitle="Detailed parametric profile of the continuous regression target, tail risk quantiles (P1-P99), and empirical 5-fold CV transformation benchmark."
        badge="Continuous Target (USD)"
      />

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <EdaMetricCard label="Mean Premium" value={`$${stats.mean_usd.toLocaleString()}`} subtitle="Sample expected value" accentColor="teal" icon={Target} />
        <EdaMetricCard label="Median Premium" value={`$${stats.median_usd.toLocaleString()}`} subtitle="Q50 / 50th percentile" accentColor="blue" />
        <EdaMetricCard label="Std Deviation" value={`$${stats.std_usd.toLocaleString()}`} subtitle="Loss severity variance" accentColor="indigo" />
        <EdaMetricCard label="IQR Spread" value={`$${stats.iqr_usd.toLocaleString()}`} subtitle="Q75 - Q25 range" accentColor="emerald" />
        <EdaMetricCard label="Skewness" value={stats.skewness} subtitle="Right-skewed positive tail" accentColor="amber" />
        <EdaMetricCard label="Kurtosis" value={stats.kurtosis} subtitle="Leptokurtic heavy tail" accentColor="purple" />
      </div>

      {/* 15-Bin Target Histogram */}
      <EdaCard
        title="Premium Amount — 15-Bin Continuous Target Histogram"
        subtitle="Empirical frequency distribution displaying positive actuarial loss skew"
        icon={BarChart3}
        badge="15 Bins"
        badgeVariant="teal"
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={target.histogram} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                itemStyle={{ fontSize: '12px' }}
                formatter={(val: any) => [val.toLocaleString(), 'Policy Count']}
              />
              <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </EdaCard>

      {/* Percentiles Tail Risk Grid */}
      <EdaCard
        title="Comprehensive Tail Risk Percentile Thresholds (P1 through P99)"
        subtitle="Empirical bounds from minimum rate floor to extreme tail policies"
        icon={Activity}
        badge="Percentiles"
      >
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5 font-mono text-xs">
          {Object.entries(target.percentiles).map(([p, val]) => (
            <div key={p} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase">{p}</span>
              <p className="text-white font-bold text-sm mt-1">${val.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </EdaCard>

      {/* Transformation Benchmark Table */}
      <EdaCard
        title="Target Transformation 5-Fold Cross-Validation Benchmark"
        subtitle="Comparing Raw Untransformed Target vs Square-Root and Logarithm transforms"
        icon={Scale}
        badge="Raw Target Recommended"
        badgeVariant="emerald"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-3">Target Representation</th>
                  <th className="px-4 py-3">Skewness</th>
                  <th className="px-4 py-3">Kurtosis</th>
                  <th className="px-4 py-3">Mean CV MAE ($)</th>
                  <th className="px-4 py-3">Mean CV RMSE ($)</th>
                  <th className="px-4 py-3">Out-of-Fold R²</th>
                  <th className="px-4 py-3">Recommendation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {target.transformations.map((t, i) => {
                  const isRec = t.recommendation.toLowerCase().includes('recommended');
                  const isRej = t.recommendation.toLowerCase().includes('rejected') || t.out_of_fold_r2 < 0;
                  return (
                    <tr key={i} className={isRec ? 'bg-teal-950/20 border-l-2 border-teal-500' : 'hover:bg-slate-800/40'}>
                      <td className="px-4 py-3 font-bold text-white">{t.transformation}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{t.skewness.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{t.kurtosis.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-teal-300 font-bold">${t.mean_cv_mae.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">${t.mean_cv_rmse.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono font-bold">
                        <span className={t.out_of_fold_r2 > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {t.out_of_fold_r2.toFixed(4)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                            isRec
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isRej
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}
                        >
                          {t.recommendation}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </EdaCard>

      {/* Publication Transformation Figure */}
      <EdaFigureCard
        title="Premium Amount Distribution and Log/Sqrt Transformations"
        category="Univariate"
        urlPath="/static/visualizations/univariate/07_premium_distribution_and_transform.png"
        description="Visualizing the positive tail and probability densities under identity, sqrt, and logarithmic scaling."
      />
    </div>
  );
}
