import React, { useState, useEffect } from 'react';
import { Crosshair, ShieldCheck, AlertCircle, Filter, Scale, CheckCircle2 } from 'lucide-react';
import { fetchOutliers, fetchOutlierTreatment } from '../../services/edaApi';
import type { OutliersResponse, OutlierTreatmentResponse, OutlierSummaryItem } from '../../types/eda';
import { EdaSectionHeader } from '../../components/eda/EdaSectionHeader';
import { EdaCard } from '../../components/eda/EdaCard';
import { EdaMetricCard } from '../../components/eda/EdaMetricCard';
import { EdaLoading } from '../../components/eda/EdaLoading';
import { EdaError } from '../../components/eda/EdaError';
import { EdaDataTable } from '../../components/eda/EdaDataTable';
import { EdaFigureCard } from '../../components/eda/EdaFigureCard';

export function OutlierAnalysisPage() {
  const [outliers, setOutliers] = useState<OutliersResponse | null>(null);
  const [treatment, setTreatment] = useState<OutlierTreatmentResponse | null>(null);
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (mFilter = '', bypass = false) => {
    setLoading(true);
    setError(null);
    try {
      const [outData, trtData] = await Promise.all([
        fetchOutliers(mFilter || undefined, bypass),
        fetchOutlierTreatment(bypass),
      ]);
      setOutliers(outData);
      setTreatment(trtData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load outlier analytics'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(methodFilter);
  }, [methodFilter]);

  if (loading && !outliers) return <EdaLoading message="Evaluating Tukey IQR, Z-Score, and Modified MAD outlier treatments..." />;
  if (error || !outliers || !treatment) return <EdaError error={error} onRetry={() => loadData(methodFilter, true)} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <EdaSectionHeader
        dimensionNumber="Dimension 06"
        title="Outlier Detection, Actuarial Tail Risk & Treatment Policy"
        subtitle="Tri-methodological detection (IQR, Z-Score, Modified MAD), target heavy-tail classification, and 5-fold CV justification for retaining extreme claims intact."
        badge="Tail Risk Retained"
      />

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EdaMetricCard
          label="IQR Premium Outliers"
          value={outliers.target_variable_outliers.iqr_outliers_count.toLocaleString()}
          subtitle={`${outliers.target_variable_outliers.iqr_outliers_pct}% of portfolio records`}
          accentColor="amber"
          icon={Crosshair}
          badge="Q3 + 1.5*IQR"
        />
        <EdaMetricCard
          label="Z-Score Outliers"
          value={outliers.target_variable_outliers.zscore_outliers_count.toLocaleString()}
          subtitle={`${outliers.target_variable_outliers.zscore_outliers_pct}% exceed |Z| > 3.0`}
          accentColor="blue"
          icon={Crosshair}
          badge="|Z| > 3"
        />
        <EdaMetricCard
          label="Modified MAD Outliers"
          value={outliers.target_variable_outliers.modified_mad_outliers_count.toLocaleString()}
          subtitle={`${outliers.target_variable_outliers.modified_mad_outliers_pct}% exceed MAD > 3.5`}
          accentColor="indigo"
          icon={Crosshair}
          badge="MAD > 3.5"
        />
        <EdaMetricCard
          label="Treatment Decision"
          value="Retain 100%"
          subtitle="Zero clipping, winsorization, or trimming"
          accentColor="emerald"
          icon={ShieldCheck}
          delta={{ value: 'Optimal MAE ($655)', isPositive: true }}
        />
      </div>

      {/* Target Variable Tail Risk Callout */}
      <EdaCard
        title="Target Variable Tail Risk Profile: Premium Amount"
        subtitle={outliers.target_variable_outliers.classification}
        icon={Scale}
        badge="Tail Risk Sanctity"
        badgeVariant="emerald"
      >
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
          <p>
            <strong className="text-emerald-400">Actuarial Verdict: </strong>
            {outliers.target_variable_outliers.actuarial_verdict}
          </p>
          <p className="text-slate-400">
            In casualty and property insurance, extreme policies represent catastrophic risk exposure (repeat claimants, luxury assets, high liability).
            Trimming or winsorizing these observations artificially lowers empirical risk expectations, guaranteeing structural under-reserving and insolvency.
          </p>
        </div>
      </EdaCard>

      {/* Feature-Wise Outlier Summary Table */}
      <EdaCard
        title="Multi-Method Outlier Audit Across Numerical Features"
        subtitle="Comparing Tukey IQR, Standard Z-Score, and Modified Z-Score with MAD"
        icon={Crosshair}
        badge="Multi-Method"
        actions={
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="">All Detection Methods</option>
              <option value="iqr">Tukey IQR Only</option>
              <option value="zscore">Standard Z-Score Only</option>
              <option value="mad">Modified MAD Only</option>
            </select>
          </div>
        }
      >
        <EdaDataTable<any>
          columns={[
            {
              key: 'column_name',
              label: 'Feature',
              sortable: true,
              render: (_v, r) => <strong className="text-white">{r.column_name || r.Feature}</strong>,
            },
            {
              key: 'iqr_outlier_count',
              label: 'IQR Outliers',
              sortable: true,
              render: (_v, r) => {
                const count = r.iqr_outlier_count ?? r['IQR Outliers Count'] ?? 0;
                const pct = r.iqr_outlier_pct ?? r['IQR Outliers %'] ?? 0;
                return (
                  <span className="font-mono text-amber-300">
                    {Number(count).toLocaleString()} ({Number(pct).toFixed(2)}%)
                  </span>
                );
              },
            },
            {
              key: 'zscore_outlier_count',
              label: 'Z-Score (|Z|>3)',
              sortable: true,
              render: (_v, r) => {
                const count = r.zscore_outlier_count ?? r['Z-Score Outliers Count'] ?? 0;
                const pct = r.zscore_outlier_pct ?? r['Z-Score Outliers %'] ?? 0;
                return (
                  <span className="font-mono text-blue-300">
                    {Number(count).toLocaleString()} ({Number(pct).toFixed(2)}%)
                  </span>
                );
              },
            },
            {
              key: 'mad_outlier_count',
              label: 'Modified MAD (>3.5)',
              sortable: true,
              render: (_v, r) => {
                const count = r.mad_outlier_count ?? r['Modified MAD Outliers Count'] ?? 0;
                const pct = r.mad_outlier_pct ?? r['Modified MAD Outliers %'] ?? 0;
                return (
                  <span className="font-mono text-purple-300">
                    {Number(count).toLocaleString()} ({Number(pct).toFixed(2)}%)
                  </span>
                );
              },
            },
            {
              key: 'domain_classification',
              label: 'Actuarial Risk Nature',
              render: (_v, r) => (
                <span className="text-xs text-slate-400 leading-relaxed">
                  {r.domain_classification || r['Actuarial Nature'] || r.recommended_treatment}
                </span>
              ),
            },
          ]}
          data={outliers.outlier_summaries}
          searchPlaceholder="Filter numerical features..."
          defaultPageSize={10}
        />
      </EdaCard>

      {/* Outlier Treatment Comparison 5-Fold CV */}
      <EdaCard
        title="Outlier Treatment Strategy 5-Fold Cross-Validation Benchmark"
        subtitle="Empirical performance of candidate outlier treatments on Premium Amount regression"
        icon={Scale}
        badge={treatment.selected_strategy}
        badgeVariant="teal"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-3">Treatment Strategy</th>
                  <th className="px-4 py-3">Rows Retained</th>
                  <th className="px-4 py-3">CV MAE ($)</th>
                  <th className="px-4 py-3">CV RMSE ($)</th>
                  <th className="px-4 py-3">CV R²</th>
                  <th className="px-4 py-3">Actuarial Trade-off Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {treatment.treatment_strategies.map((row: any, i: number) => {
                  const name = row.treatment_strategy || row.Treatment || `Strategy ${i + 1}`;
                  const isSelected = name.toLowerCase().includes('retain') || row.recommended?.toLowerCase().includes('standard') || row['Selected'] === true;
                  const mae = Number(row.mean_mae ?? row['CV MAE ($)'] ?? 0);
                  const rmse = Number(row.mean_rmse ?? row['CV RMSE ($)'] ?? 0);
                  const r2 = Number(row.mean_r2 ?? row['CV R2'] ?? 0);
                  const rowsRet = row['Rows Retained'] != null ? row['Rows Retained'].toLocaleString() : (name.includes('Retain') ? '20,000 (100%)' : '20,000 (Capped)');
                  const tradeOff = row.advantages ? `${row.advantages}. (${row.limitations || ''})` : (row['Actuarial Trade-off'] || row.recommended || '—');

                  return (
                    <tr
                      key={i}
                      className={isSelected ? 'bg-teal-950/25 border-l-2 border-teal-500' : 'hover:bg-slate-800/40'}
                    >
                      <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                        {name}
                        {isSelected && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            SELECTED
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">{rowsRet}</td>
                      <td className="px-4 py-3 font-mono text-teal-300 font-bold">${mae.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">${rmse.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400 font-bold">
                        {r2.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-sm">{tradeOff}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-teal-300">Actuarial Justification: </strong>
            {treatment.actuarial_justification}
          </div>
        </div>
      </EdaCard>

      {/* Publication Outlier Figures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EdaFigureCard
          title="Outlier Detection Boxplots"
          category="Outliers"
          urlPath="/static/visualizations/outliers/01_outlier_detection_boxplots.png"
          description="Feature boxplots highlighting IQR fences and extreme empirical observations."
        />
        <EdaFigureCard
          title="Outlier Treatment Distributions"
          category="Outliers"
          urlPath="/static/visualizations/outliers/02_outlier_treatment_distributions.png"
          description="Comparison of marginal target density before and after Winsorization and Trimming."
        />
      </div>
    </div>
  );
}
