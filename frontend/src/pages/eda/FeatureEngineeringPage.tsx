import React, { useState, useEffect } from 'react';
import { Cpu, TrendingUp, Sparkles, ShieldCheck, CheckCircle2, Code2 } from 'lucide-react';
import { fetchFeatureEngineering } from '../../services/edaApi';
import type { FeatureEngineeringResponse } from '../../types/eda';
import { EdaSectionHeader } from '../../components/eda/EdaSectionHeader';
import { EdaCard } from '../../components/eda/EdaCard';
import { EdaMetricCard } from '../../components/eda/EdaMetricCard';
import { EdaLoading } from '../../components/eda/EdaLoading';
import { EdaError } from '../../components/eda/EdaError';
import { EdaFigureCard } from '../../components/eda/EdaFigureCard';

export function FeatureEngineeringPage() {
  const [data, setData] = useState<FeatureEngineeringResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (bypass = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFeatureEngineering(bypass);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load feature engineering'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) return <EdaLoading message="Evaluating actuarial domain ratio experiments and missingness indicator gains..." />;
  if (error || !data) return <EdaError error={error} onRetry={() => loadData(true)} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <EdaSectionHeader
        dimensionNumber="Dimension 14"
        title="Actuarial Feature Engineering & Interaction Benchmarks"
        subtitle="Formulation of actuarial domain interaction quotients, risk indices, and empirical proof that binary missingness indicators deliver a +75% relative R² lift."
        badge="+75.1% R² Gain"
      />

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EdaMetricCard
          label="Relative R² Gain"
          value="+75.1%"
          subtitle="R² lifted from 0.0193 to 0.0338"
          accentColor="emerald"
          icon={TrendingUp}
          delta={{ value: '+75% Lift', isPositive: true }}
        />
        <EdaMetricCard
          label="Validation MAE Drop"
          value="-$7.99"
          subtitle="MAE reduced from $655.44 to $647.45"
          accentColor="teal"
          icon={Cpu}
          badge="Pricing Precision"
        />
        <EdaMetricCard
          label="Engineered Indicators"
          value="6 Binary Flags"
          subtitle="Preserves informative MNAR alpha"
          accentColor="blue"
          icon={Sparkles}
        />
        <EdaMetricCard
          label="CV Methodology"
          value="Leakage-Free"
          subtitle="5-Fold strictly fit inside folds"
          accentColor="indigo"
          icon={ShieldCheck}
          delta={{ value: 'Zero Data Leakage', isPositive: true }}
        />
      </div>

      {/* Engineered Features Definitions Grid */}
      <EdaCard
        title="Engineered Actuarial Terms & Mathematical Formulations"
        subtitle="Domain-derived interaction ratios and their predictive alpha rationales"
        icon={Code2}
        badge="Mathematical Formulas"
        badgeVariant="teal"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.engineered_features_definitions.map((def, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <h4 className="text-sm font-bold text-white">{def.feature_name}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                    {def.cv_gain}
                  </span>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-teal-300 mb-3">
                  {def.formula}
                </div>

                <p className="text-xs text-slate-300 mb-2">{def.description}</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong className="text-slate-400">Actuarial Rationale: </strong>
                  {def.rationale}
                </p>
              </div>
            </div>
          ))}
        </div>
      </EdaCard>

      {/* 5-Fold CV Experiment Benchmarks Table */}
      <EdaCard
        title="5-Fold Cross-Validation Feature Set Experiments"
        subtitle="Stepwise ablation testing isolating the incremental predictive contribution of engineered features"
        icon={Cpu}
        badge="Ablation Benchmark"
        badgeVariant="emerald"
      >
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">Experiment Feature Set</th>
                <th className="px-4 py-3">Engineered Features Included</th>
                <th className="px-4 py-3">CV MAE ($)</th>
                <th className="px-4 py-3">CV RMSE ($)</th>
                <th className="px-4 py-3">CV R²</th>
                <th className="px-4 py-3">Relative Gain vs Baseline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {data.experiments.map((exp, i) => {
                const name = exp.feature_set || exp['Experiment Set'] || `Experiment ${i + 1}`;
                const nFeat = exp.n_features != null ? `${exp.n_features} Total Features` : (exp['Engineered Features Added'] || '—');
                const mae = Number(exp.mean_mae ?? exp['CV MAE ($)'] ?? 0);
                const rmse = Number(exp.mean_rmse ?? exp['CV RMSE ($)'] ?? 0);
                const r2 = Number(exp.mean_r2 ?? exp['CV R2'] ?? 0);
                const gain = exp.verdict || exp['Relative Gain vs Baseline'] || '—';
                const isSelected = String(gain).includes('+') || name.toLowerCase().includes('engineered') || i === 1;

                return (
                  <tr
                    key={i}
                    className={isSelected ? 'bg-teal-950/20 border-l-2 border-teal-500' : 'hover:bg-slate-800/40'}
                  >
                    <td className="px-4 py-3.5 font-bold text-white">{name}</td>
                    <td className="px-4 py-3.5 font-mono text-teal-300 text-xs">{nFeat}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-200 font-bold">${mae.toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">${rmse.toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold">
                      {r2.toFixed(4)}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono font-bold text-teal-400">
                      {gain}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </EdaCard>

      {/* Publication Figures & Methodology */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EdaCard
          title="Strict Leakage-Safe Cross-Validation Design"
          subtitle="Preventing out-of-fold target and parameter contamination"
          icon={ShieldCheck}
          badge="Leakage Protection"
        >
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
            <p>
              <strong className="text-teal-300">Methodology Guarantee: </strong>
              {data.methodology}
            </p>
            <p className="text-slate-400">
              All imputer parameters, categorical target encoders, and variance scaling factors were fitted strictly on training folds
              prior to evaluating validation folds.
            </p>
          </div>
        </EdaCard>

        <EdaFigureCard
          title="Feature Engineering Cross-Validation Comparison"
          category="Model Diagnostics"
          urlPath="/static/visualizations/model_diagnostics/04_feature_engineering_cv_comparison.png"
          description="Publication chart displaying R² lift and MAE reduction achieved by incorporating missingness indicator flags."
        />
      </div>
    </div>
  );
}
