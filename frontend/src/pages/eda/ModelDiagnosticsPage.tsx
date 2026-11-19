import React, { useState, useEffect } from 'react';
import { LineChart, Cpu, AlertTriangle, ShieldCheck, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
import { fetchModelDiagnostics } from '../../services/edaApi';
import type { ModelDiagnosticsResponse } from '../../types/eda';
import { EdaSectionHeader } from '../../components/eda/EdaSectionHeader';
import { EdaCard } from '../../components/eda/EdaCard';
import { EdaMetricCard } from '../../components/eda/EdaMetricCard';
import { EdaLoading } from '../../components/eda/EdaLoading';
import { EdaError } from '../../components/eda/EdaError';
import { EdaFigureCard } from '../../components/eda/EdaFigureCard';

export function ModelDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<ModelDiagnosticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (bypass = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchModelDiagnostics(bypass);
      setDiagnostics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load model diagnostics'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !diagnostics) return <EdaLoading message="Evaluating downstream regression pipeline benchmarks and missingness indicator lifts..." />;
  if (error || !diagnostics) return <EdaError error={error} onRetry={() => loadData(true)} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <EdaSectionHeader
        dimensionNumber="Dimension 15"
        title="Downstream Regression Pipeline Diagnostics & Architecture Benchmarks"
        subtitle="Comparative 5-fold cross-validation metrics across 6 distinct imputation and modeling architectures, isolating the value of missingness indicators."
        badge="6 Architectures Benchmarked"
      />

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EdaMetricCard
          label="Best Generalization"
          value="R² = 0.0369"
          subtitle="HistGradientBoosting (Native NaN splits)"
          accentColor="emerald"
          icon={TrendingUp}
          delta={{ value: 'Top Pipeline', isPositive: true }}
        />
        <EdaMetricCard
          label="Indicator Contribution"
          value="+75.1%"
          subtitle="R² lifted from 0.0193 to 0.0338"
          accentColor="teal"
          icon={LineChart}
          badge="MNAR Alpha"
        />
        <EdaMetricCard
          label="MAE Reduction"
          value="-$7.99 / policy"
          subtitle="Direct underwriting pricing savings"
          accentColor="blue"
          icon={Cpu}
        />
        <EdaMetricCard
          label="Listwise Deletion Risk"
          value="R² = -0.0076"
          subtitle="Negative predictive generalization"
          accentColor="rose"
          icon={AlertTriangle}
          badge="Catastrophic"
        />
      </div>

      {/* Scope Clarification Notice */}
      <EdaCard
        title="Architectural Boundary Notice: Historical EDA Benchmarks vs Production Model"
        subtitle="Clarifying the distinct roles of exploratory research diagnostics and the live prediction service"
        icon={ShieldCheck}
        badge="Educational Scope"
        badgeVariant="blue"
      >
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
          <p>
            <strong className="text-teal-300">Exploratory Research Scope: </strong>
            The 6 pipeline benchmarks below represent historical exploratory data analysis (EDA) experiments conducted to evaluate how alternative
            imputation strategies (MICE, Median, KNN, Listwise Deletion) interact with regression architectures.
          </p>
          <p className="text-slate-400">
            These diagnostic benchmarks are preserved for academic evaluation and underwriting methodology documentation. They are strictly separate
            from the live Insurance Intelligence prediction service, which serves calibrated inferences via{' '}
            <code className="text-teal-400 font-mono">POST /api/v1/predict/premium</code>.
          </p>
        </div>
      </EdaCard>

      {/* 6 Downstream Pipelines Benchmark Table */}
      <EdaCard
        title="Comparative Downstream Regression Pipeline Architectures (5-Fold CV)"
        subtitle="Evaluation of predictive metrics (MAE, RMSE, R²) on continuous Premium Amount"
        icon={LineChart}
        badge="6 Architectures"
        badgeVariant="teal"
      >
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">Pipeline Architecture</th>
                <th className="px-4 py-3">Imputation Method</th>
                <th className="px-4 py-3">Feature Space</th>
                <th className="px-4 py-3">CV MAE ($)</th>
                <th className="px-4 py-3">CV RMSE ($)</th>
                <th className="px-4 py-3">CV R²</th>
                <th className="px-4 py-3">Architectural Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {diagnostics.pipelines_benchmarked.map((p, i) => {
                const name = p.pipeline || p.Pipeline || 'Unknown';
                const mae = Number(p.mean_mae ?? p['CV MAE ($)'] ?? 0);
                const rmse = Number(p.mean_rmse ?? p['CV RMSE ($)'] ?? 0);
                const r2 = Number(p.mean_r2 ?? p['CV R2'] ?? 0);
                const isBest = name.toLowerCase().includes('native') || name.toLowerCase().includes('histgradient');
                const isWorst = name.toLowerCase().includes('listwise') || r2 < 0;

                // Derive intuitive imputation & feature descriptions if not present in raw summary
                const imputationDesc = p.Imputation || (
                  name.includes('Native') ? 'Native Tree Splits' :
                  name.includes('Indicators') ? 'Median/Mode + Flags' :
                  name.includes('Iterative') ? 'MICE (Bayesian Ridge)' :
                  name.includes('Simple') ? 'Simple Median/Mode' :
                  name.includes('Listwise') ? 'None (Drops rows)' : 'None (Constant)'
                );

                const featuresDesc = p.Features || (
                  name.includes('Native') ? 'Full 20k rows with NaNs' :
                  name.includes('Indicators') ? '17 Features + 6 Indicators' :
                  name.includes('Listwise') ? '6,465 Complete Rows Only' : '17 Standard Features'
                );

                return (
                  <tr
                    key={i}
                    className={
                      isBest
                        ? 'bg-teal-950/20 border-l-2 border-teal-500'
                        : isWorst
                        ? 'bg-rose-950/20 border-l-2 border-rose-500'
                        : 'hover:bg-slate-800/40'
                    }
                  >
                    <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                      {name}
                      {isBest && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          TOP BENCHMARK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-teal-300 text-xs">{imputationDesc}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-400 text-xs">{featuresDesc}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-200 font-bold">${mae.toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">${rmse.toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-mono font-bold">
                      <span className={r2 > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {r2.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                          isBest
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isWorst
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isBest ? 'Optimal Generalization' : isWorst ? 'Unacceptable Degradation' : 'Viable Baseline'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </EdaCard>

      {/* Indicator Gain & Publication Figure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EdaCard
          title="Missingness Indicator Value Attribution"
          subtitle="Isolating the predictive alpha gained from 'is_missing_*' flags"
          icon={TrendingUp}
          badge="+75.1% Gain"
          badgeVariant="emerald"
        >
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Baseline Median Imputation R²:</span>
              <span className="font-bold text-slate-200">
                {diagnostics.missing_indicator_contribution.baseline_median_r2.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between items-center text-teal-300">
              <span>Augmented with Indicators R²:</span>
              <span className="font-bold text-emerald-400">
                {diagnostics.missing_indicator_contribution.augmented_indicators_r2.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Relative Predictive Lift:</span>
              <span className="font-bold text-teal-400">
                +{diagnostics.missing_indicator_contribution.relative_r2_gain_pct.toFixed(2)}%
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] font-sans text-slate-400 leading-relaxed">
              {diagnostics.missing_indicator_contribution.conclusion}
            </div>
          </div>
        </EdaCard>

        <EdaFigureCard
          title="Downstream Regression Pipeline Benchmark"
          category="Model Diagnostics"
          urlPath="/static/visualizations/model_diagnostics/07_downstream_pipeline_comparison.png"
          description="Publication visual comparing cross-validation R² and RMSE across distinct imputation pipelines."
        />
      </div>
    </div>
  );
}
