import React, { useState, useEffect } from 'react';
import { Network, TrendingUp, TrendingDown, Layers, ShieldCheck, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { fetchCorrelation } from '../../services/edaApi';
import type { CorrelationResponse, TargetCorrelationItem } from '../../types/eda';
import { EdaSectionHeader } from '../../components/eda/EdaSectionHeader';
import { EdaCard } from '../../components/eda/EdaCard';
import { EdaMetricCard } from '../../components/eda/EdaMetricCard';
import { EdaLoading } from '../../components/eda/EdaLoading';
import { EdaError } from '../../components/eda/EdaError';
import { EdaFigureCard } from '../../components/eda/EdaFigureCard';

export function CorrelationAnalysisPage() {
  const [data, setData] = useState<CorrelationResponse | null>(null);
  const [method, setMethod] = useState<'pearson' | 'spearman'>('pearson');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (bypass = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCorrelation(undefined, bypass);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load correlation matrices'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) return <EdaLoading message="Computing 9x9 linear and monotonic correlation matrices with p-values..." />;
  if (error || !data) return <EdaError error={error} onRetry={() => loadData(true)} />;

  const activeMatrix = method === 'pearson' ? data.pearson_matrix : data.spearman_matrix;

  // Chart data for predictor-to-target ranking
  const targetChartData = data.target_correlations
    .map((item) => ({
      feature: item.feature,
      correlation: method === 'pearson' ? item.pearson_r : item.spearman_rho,
      pValue: method === 'pearson' ? item.pearson_pval : item.spearman_pval,
    }))
    .sort((a, b) => b.correlation - a.correlation);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <EdaSectionHeader
        dimensionNumber="Dimension 09"
        title="Linear (Pearson) & Monotonic (Spearman) Correlation Matrices"
        subtitle="Full 9x9 bivariate dependency evaluations, hypothesis testing for significance, and empirical ranking of predictor influences on Premium Amount."
        badge="Zero Collinearity"
        actions={
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setMethod('pearson')}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                method === 'pearson' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pearson (Linear)
            </button>
            <button
              onClick={() => setMethod('spearman')}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                method === 'spearman' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Spearman (Rank)
            </button>
          </div>
        }
      />

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EdaMetricCard
          label="Top Positive Linear Driver"
          value="+0.0441"
          subtitle="Previous Claims (p = 1.8e-7)"
          accentColor="teal"
          icon={TrendingUp}
          badge="Significant"
        />
        <EdaMetricCard
          label="Top Negative Monotonic Driver"
          value="-0.0522"
          subtitle="Credit Score (p = 1.5e-12)"
          accentColor="blue"
          icon={TrendingDown}
          badge="Significant"
        />
        <EdaMetricCard
          label="Predictor Orthogonality"
          value="|r| <= 0.018"
          subtitle="Zero pairwise predictor collinearity"
          accentColor="emerald"
          icon={ShieldCheck}
          delta={{ value: 'Ideal Orthogonality', isPositive: true }}
        />
        <EdaMetricCard
          label="Target Influence Scale"
          value="Weak Linear (r < 0.05)"
          subtitle="Non-linear tree architectures required"
          accentColor="amber"
          icon={Activity}
          badge="Tabular Nature"
        />
      </div>

      {/* Target Correlation Ranking Bar Chart */}
      <EdaCard
        title={`Predictor Rankings vs Premium Amount (${method.toUpperCase()})`}
        subtitle="Ranked correlation coefficients showing direction and magnitude of target relationship"
        icon={Network}
        badge={`${targetChartData.length} Predictors`}
        badgeVariant="teal"
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={targetChartData} layout="vertical" margin={{ top: 10, right: 30, left: 70, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} domain={[-0.06, 0.06]} />
              <YAxis dataKey="feature" type="category" stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                itemStyle={{ fontSize: '12px' }}
                formatter={(val: any) => [Number(val).toFixed(4), 'Correlation']}
              />
              <Bar dataKey="correlation" radius={[4, 4, 4, 4]}>
                {targetChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.correlation >= 0 ? '#14b8a6' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </EdaCard>

      {/* Full 9x9 Correlation Heatmap Table */}
      <EdaCard
        title={`9x9 ${method === 'pearson' ? 'Pearson Linear' : 'Spearman Rank'} Correlation Matrix`}
        subtitle="Complete pairwise dependency evaluations across all 9 numerical features"
        icon={Network}
      >
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                <th className="px-3 py-2 text-left">Feature</th>
                {data.features.map((col) => (
                  <th key={col} className="px-2 py-2 truncate max-w-[85px]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {data.features.map((rowCol) => (
                <tr key={rowCol} className="hover:bg-slate-800/40">
                  <td className="px-3 py-2 font-bold text-left text-white whitespace-nowrap bg-slate-900/40">
                    {rowCol}
                  </td>
                  {data.features.map((col) => {
                    const val = activeMatrix[rowCol]?.[col] ?? 0;
                    const isDiag = rowCol === col;
                    const isPositive = val > 0.02;
                    const isNegative = val < -0.02;

                    return (
                      <td
                        key={col}
                        className={`px-2 py-2 ${
                          isDiag
                            ? 'bg-slate-800 font-bold text-slate-200'
                            : isPositive
                            ? 'bg-teal-950/40 text-teal-300 font-bold'
                            : isNegative
                            ? 'bg-rose-950/40 text-rose-300 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {val.toFixed(3)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EdaCard>

      {/* Target Correlations Detailed Table & Publication Figure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EdaCard
          title="Predictor Target Significance & Domain Rationales"
          subtitle="P-values and actuarial interpretations for all numerical features"
          icon={TrendingUp}
          badge="Significance"
          badgeVariant="teal"
        >
          <div className="space-y-3">
            {data.target_correlations.map((tc, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-start gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-xs">{tc.feature}</strong>
                    <span className="text-[10px] font-mono text-slate-400">
                      p = {tc.pearson_pval}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{tc.relationship}</p>
                </div>
                <div className="text-right font-mono text-xs shrink-0">
                  <span className={tc.pearson_r >= 0 ? 'text-teal-400 font-bold' : 'text-rose-400 font-bold'}>
                    r = {tc.pearson_r.toFixed(4)}
                  </span>
                  <p className="text-[10px] text-slate-500">ρ = {tc.spearman_rho.toFixed(4)}</p>
                </div>
              </div>
            ))}
          </div>
        </EdaCard>

        <EdaFigureCard
          title="Dual Correlation Heatmaps (Pearson vs Spearman)"
          category="Correlation"
          urlPath="/static/visualizations/correlation/08_correlation_heatmaps.png"
          description="Publication heatmaps illustrating global linear versus monotonic rank structures."
        />
      </div>
    </div>
  );
}
