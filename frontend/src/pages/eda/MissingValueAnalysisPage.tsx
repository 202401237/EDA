import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, FileSpreadsheet, ShieldAlert, CheckCircle2, Split, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchMissingValues, fetchMissingnessPatterns, fetchMissingnessMechanisms } from '../../services/edaApi';
import type {
  MissingValuesResponse,
  MissingnessPatternsResponse,
  MissingnessMechanismsResponse,
} from '../../types/eda';
import { EdaSectionHeader } from '../../components/eda/EdaSectionHeader';
import { EdaCard } from '../../components/eda/EdaCard';
import { EdaMetricCard } from '../../components/eda/EdaMetricCard';
import { EdaLoading } from '../../components/eda/EdaLoading';
import { EdaError } from '../../components/eda/EdaError';
import { EdaDataTable } from '../../components/eda/EdaDataTable';
import { EdaFigureCard } from '../../components/eda/EdaFigureCard';

export function MissingValueAnalysisPage() {
  const [missingValues, setMissingValues] = useState<MissingValuesResponse | null>(null);
  const [patterns, setPatterns] = useState<MissingnessPatternsResponse | null>(null);
  const [mechanisms, setMechanisms] = useState<MissingnessMechanismsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (bypass = false) => {
    setLoading(true);
    setError(null);
    try {
      const [mvData, ptData, mcData] = await Promise.all([
        fetchMissingValues(bypass),
        fetchMissingnessPatterns(bypass),
        fetchMissingnessMechanisms(bypass),
      ]);
      setMissingValues(mvData);
      setPatterns(ptData);
      setMechanisms(mcData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load missing values analysis'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <EdaLoading message="Evaluating missing value patterns, Little's MCAR omnibus test, and MNAR target association..." />;
  if (error || !missingValues || !patterns || !mechanisms) return <EdaError error={error} onRetry={() => loadData(true)} />;

  // Prepare chart data for per-feature missingness
  const featureMissingChart = missingValues.summary
    .filter((r) => Number(r['Missing Count'] || 0) > 0)
    .map((r: any) => ({
      feature: r.Column || r.Feature || r.column_name || 'Unknown',
      'Missing %': Number(r['Missing %'] || 0),
      count: Number(r['Missing Count'] || 0),
    }))
    .sort((a, b) => b['Missing %'] - a['Missing %']);

  // Record level distribution chart
  const recordLevelChart = patterns.row_level_distribution.map((d) => ({
    label: `${d.missing_features_count} Missing Features`,
    count: d.row_count,
    percentage: d.percentage,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <EdaSectionHeader
        dimensionNumber="Dimension 04"
        title="Missing Value Architecture, Mechanisms & MCAR Testing"
        subtitle="Comprehensive quantification of 19,910 missing cells, multi-attribute patterns, Little's MCAR omnibus rejection, and actionable MNAR underwriting signals."
        badge="Little's Test: p < 1e-15"
      />

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EdaMetricCard
          label="Total Missing Cells"
          value={missingValues.total_missing_cells.toLocaleString()}
          subtitle={`${missingValues.overall_missing_pct}% of total cells (20k x 21)`}
          accentColor="amber"
          icon={AlertTriangle}
          badge="19,910 Cells"
        />
        <EdaMetricCard
          label="Affected Features"
          value={`${missingValues.features_with_missing} / ${missingValues.total_features}`}
          subtitle="9 features possess missing values"
          accentColor="teal"
          icon={FileSpreadsheet}
        />
        <EdaMetricCard
          label="Row Incompleteness"
          value={`${patterns.incomplete_rows_pct}%`}
          subtitle={`${patterns.incomplete_rows.toLocaleString()} rows missing >= 1 attribute`}
          accentColor="rose"
          icon={ShieldAlert}
          delta={{ value: '67.7% hazard', neutral: true }}
        />
        <EdaMetricCard
          label="Little's MCAR Test"
          value="Reject H0"
          subtitle="χ² = 372.05 (dof = 126), p < 1e-15"
          accentColor="purple"
          icon={AlertCircle}
          badge="Not MCAR"
        />
      </div>

      {/* Chart: Feature-by-Feature Missingness Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EdaCard
          title="Feature-by-Feature Missingness Frequency"
          subtitle="Percentage of null values per partially observed attribute in 20,000-row sample"
          icon={BarChart2}
          badge="Feature Missingness"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureMissingChart} layout="vertical" margin={{ top: 10, right: 30, left: 70, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} unit="%" domain={[0, 35]} />
                <YAxis dataKey="feature" type="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="Missing %" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </EdaCard>

        {/* Chart: Record-Level Missingness Distribution */}
        <EdaCard
          title="Record-Level Missingness Frequency Distribution"
          subtitle="How many attributes are omitted simultaneously per policyholder row"
          icon={Split}
          badge="Row Multiplicity"
          badgeVariant="indigo"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recordLevelChart} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
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
      </div>

      {/* Little's Omnibus Test & Informative Missingness Signals */}
      <EdaCard
        title="Little's MCAR Omnibus Test & Informative MNAR Evidence"
        subtitle="Empirical proof that missingness is not MCAR and conveys predictive underwriting signal"
        icon={AlertCircle}
        badge="MNAR / MAR Audit"
        badgeVariant="purple"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-slate-300 leading-relaxed font-mono">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-1.5 font-bold text-white">
              <span className="text-purple-300 text-sm">{mechanisms.little_mcar_test.test_name}</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {mechanisms.little_mcar_test.verdict}
              </span>
            </div>
            <p className="text-slate-400">
              Test Statistic: <span className="text-teal-300 font-bold">χ² = {mechanisms.little_mcar_test.test_statistic_chi2}</span> (dof ={' '}
              {mechanisms.little_mcar_test.degrees_of_freedom}), p-value:{' '}
              <span className="text-amber-400 font-bold">{mechanisms.little_mcar_test.p_value}</span>.{' '}
              {mechanisms.little_mcar_test.interpretation}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3">Missing %</th>
                  <th className="px-4 py-3">Mean Target (Missing)</th>
                  <th className="px-4 py-3">Mean Target (Observed)</th>
                  <th className="px-4 py-3">Delta ($)</th>
                  <th className="px-4 py-3">Welch t p-value</th>
                  <th className="px-4 py-3">Classified Mechanism</th>
                  <th className="px-4 py-3">Actuarial Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {mechanisms.informative_missingness_evidence.map((ev, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">{ev.feature}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{ev.missing_pct}%</td>
                    <td className="px-4 py-3 font-mono text-amber-300">${ev.mean_target_when_missing.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">${ev.mean_target_when_observed.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono font-bold">
                      <span className={ev.delta_usd < 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {ev.delta_usd > 0 ? '+' : ''}${ev.delta_usd.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-teal-400">{ev.welch_t_pval}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {ev.mechanism}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs">{ev.actuarial_insight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </EdaCard>

      {/* Listwise Hazard Callout & Figures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EdaCard
          title="Catastrophic Listwise Deletion Hazard"
          subtitle="Quantifying the destructive impact of dropping incomplete rows (dropna)"
          icon={AlertCircle}
          badge="Actuarial Warning"
          badgeVariant="rose"
        >
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3 text-xs leading-relaxed">
            <div className="flex justify-between items-center font-mono">
              <span className="text-slate-400">Policy: {patterns.listwise_deletion_hazard.policy}</span>
              <span className="text-rose-400 font-bold">
                {patterns.listwise_deletion_hazard.discard_percentage}% Discarded
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-slate-300 font-mono text-[11px]">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <p className="text-slate-500">Rows Discarded</p>
                <p className="text-rose-400 font-bold text-sm">
                  {patterns.listwise_deletion_hazard.rows_discarded.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <p className="text-slate-500">Downstream Generalization</p>
                <p className="text-rose-400 font-bold text-sm">
                  R² = {patterns.listwise_deletion_hazard.downstream_r2}
                </p>
              </div>
            </div>
            <p className="text-slate-300 mt-2">{patterns.listwise_deletion_hazard.actuarial_verdict}</p>
          </div>
        </EdaCard>

        <EdaFigureCard
          title="Missing Values Bar and Sparsity Matrix"
          category="Missingness"
          urlPath="/static/visualizations/missingness/03_missing_values_bar_and_matrix.png"
          description="Publication visual showing feature missing percentages alongside matrix sparsity pattern."
        />
      </div>
    </div>
  );
}
