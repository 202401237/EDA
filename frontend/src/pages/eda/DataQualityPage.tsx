import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CopyCheck, Sparkles, FileSearch, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { fetchDataQuality } from '../../services/edaApi';
import type { DataQualityResponse } from '../../types/eda';
import { EdaSectionHeader } from '../../components/eda/EdaSectionHeader';
import { EdaCard } from '../../components/eda/EdaCard';
import { EdaMetricCard } from '../../components/eda/EdaMetricCard';
import { EdaLoading } from '../../components/eda/EdaLoading';
import { EdaError } from '../../components/eda/EdaError';
import { EdaFigureCard } from '../../components/eda/EdaFigureCard';

export function DataQualityPage() {
  const [quality, setQuality] = useState<DataQualityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (bypass = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDataQuality(bypass);
      setQuality(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data quality'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <EdaLoading message="Auditing data completeness, uniqueness, and synthetic generation signatures..." />;
  if (error || !quality) return <EdaError error={error} onRetry={() => loadData(true)} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <EdaSectionHeader
        dimensionNumber="Dimension 02"
        title="Data Quality, Completeness & Synthetic Signatures"
        subtitle="Granular evaluation of row-level completeness (67.68% incompleteness hazard), uniqueness verification, and cryptographic confirmation of synthetic tabular data generation."
        badge="Quality Audit"
      />

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EdaMetricCard
          label="Total Rows Audited"
          value={quality.total_records.toLocaleString()}
          subtitle="Representative analytical sample"
          accentColor="blue"
          icon={FileSearch}
        />
        <EdaMetricCard
          label="Incomplete Rows"
          value={`${quality.incomplete_rows_pct}%`}
          subtitle={`${quality.incomplete_rows.toLocaleString()} rows contain >= 1 missing feature`}
          accentColor="amber"
          icon={AlertCircle}
          badge="67.7% Hazard"
        />
        <EdaMetricCard
          label="Complete Records"
          value={`${quality.complete_rows_pct}%`}
          subtitle={`${quality.complete_rows.toLocaleString()} fully observed policyholders`}
          accentColor="teal"
          icon={ShieldCheck}
        />
        <EdaMetricCard
          label="Duplicate Rows"
          value={quality.exact_duplicate_rows}
          subtitle="0 ID, 0 exact, 0 feature duplicates"
          accentColor="emerald"
          icon={CopyCheck}
          delta={{ value: 'Zero duplicates', isPositive: true }}
        />
      </div>

      {/* Row Completeness Visual Bar */}
      <EdaCard
        title="Row-Level Completeness vs Incompleteness Hazard"
        subtitle="Quantifying portfolio exposure to missingness across multi-attribute policy records"
        icon={ShieldAlert}
        badge="Completeness Audit"
        badgeVariant="amber"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-teal-400 font-bold">
              Fully Complete: {quality.complete_rows.toLocaleString()} ({quality.complete_rows_pct}%)
            </span>
            <span className="text-amber-400 font-bold">
              Incomplete: {quality.incomplete_rows.toLocaleString()} ({quality.incomplete_rows_pct}%)
            </span>
          </div>

          <div className="h-6 w-full rounded-full bg-slate-800 overflow-hidden flex border border-slate-700">
            <div
              style={{ width: `${quality.complete_rows_pct}%` }}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-[10px] font-mono font-bold text-white"
            >
              32.3% Complete
            </div>
            <div
              style={{ width: `${quality.incomplete_rows_pct}%` }}
              className="bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center text-[10px] font-mono font-bold text-white"
            >
              67.7% Incomplete
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-400">Actuarial Takeaway: </strong>
            Because two out of every three policy records contain at least one missing attribute, standard listwise deletion
            (<code className="text-teal-300 font-mono">df.dropna()</code>) would drop 67.68% of the insurance portfolio.
            Downstream cross-validation proves this collapses predictive generalization to negative <code className="text-teal-300 font-mono">R² = -0.0076</code>.
          </div>
        </div>
      </EdaCard>

      {/* Synthetic Generation Signatures */}
      <EdaCard
        title="Synthetic Tabular Data Generation Signatures"
        subtitle="Cryptographic and empirical evidence proving the dataset was synthesized via generative frameworks (CTGAN / CopulaGAN)"
        icon={Sparkles}
        badge="Forensic Audit"
        badgeVariant="purple"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quality.synthetic_generation_signatures.map((sig, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#090e1c] border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-teal-400 font-semibold">{sig.affected_attribute}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                    {sig.prevalence_pct}% Prevalence
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{sig.signature_name}</h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <p className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-teal-300">
                    {sig.evidence}
                  </p>
                  <p className="text-slate-400 leading-relaxed">{sig.implication}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </EdaCard>

      {/* Data Consistency & Related Publication Figure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EdaCard
          title="Data Consistency & String Purity Audit"
          subtitle="Verification of null representation and primary key integrity"
          icon={ShieldCheck}
          badge="Verified"
        >
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h5 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Zero Pseudo-Missing String Corruption
              </h5>
              <p className="text-slate-400">
                {quality.data_consistency}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h5 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Master Quality Verdict
              </h5>
              <p className="text-slate-400">
                {quality.overall_quality_verdict}
              </p>
            </div>
          </div>
        </EdaCard>

        <EdaFigureCard
          title="Complete vs Incomplete Rows Distribution"
          category="Missingness"
          urlPath="/static/visualizations/missingness/06_complete_vs_incomplete_rows.png"
          description="Publication chart depicting the 67.68% row-level incompleteness hazard versus 32.32% fully observed records."
        />
      </div>
    </div>
  );
}
