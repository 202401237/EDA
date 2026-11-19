import React, { useState } from 'react';
import {
  Zap,
  RotateCcw,
  ArrowRight,
  MapPin,
  Car,
  AlertTriangle,
  ShieldAlert,
  Info,
  Layers,
  Gauge,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FormField, Input, Select } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { ResultCard } from '../../components/ui/ResultCard';
import { DemoBadge } from '../../components/ui/DemoBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { analyzeClaimBurstRisk } from '../../services/api';
import type { ClaimBurstRiskInput, ClaimBurstRiskResult } from '../../types/features';

const defaultInputs: ClaimBurstRiskInput = {
  vehicleAge: 12,
  previousClaims: 3,
  location: 'Urban',
  policyType: 'Comprehensive',
  age: 42,
  smokingStatus: 'No',
};

export function ClaimBurstRiskPage() {
  const [formData, setFormData] = useState<ClaimBurstRiskInput>(defaultInputs);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClaimBurstRiskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    field: keyof ClaimBurstRiskInput,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await analyzeClaimBurstRisk(formData);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to reach claim burst risk analysis API.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(defaultInputs);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-100">
      <Breadcrumb
        crumbs={[
          { label: 'Admin Portal', to: '/admin/dashboard' },
          { label: 'Claim Burst & Location Risk' },
        ]}
      />

      {/* Header */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Feature: Claim_Burst_Risk
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium">Geospatial & Loss Frequency Cluster</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-indigo-400" />
            Claim Burst & Location-Based Accident Risk
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Identifies cases exhibiting elevated likelihood of severe claim clustering. Evaluates the statistical
            interaction between aging vehicles, prior accident count, and high-density urban traffic exposure.
          </p>
        </div>
        <DemoBadge label="DEMO ACCIDENT RISK PROFILER" />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Analysis Service Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-6 space-y-6">
          <form
            onSubmit={handleAnalyze}
            className="bg-slate-800/90 rounded-2xl border border-slate-700/80 shadow-md p-6 space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Loss Frequency & Territory Variables
              </h2>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>

            <div className="space-y-4">
              <FormField
                label="Vehicle Age"
                unit="Years (0-19)"
                hint="Rule threshold: ≥ 10 years increases mechanical failure hazard and severe loss severity."
                required
                className="text-slate-300"
              >
                <Input
                  type="number"
                  min={0}
                  max={19}
                  value={formData.vehicleAge}
                  onChange={(e) => handleChange('vehicleAge', parseInt(e.target.value) || 0)}
                  className="bg-slate-950 border-slate-700 text-white font-mono focus:border-indigo-500"
                />
              </FormField>

              <FormField
                label="Historical Claim Incidents"
                unit="0 - 8 claims"
                hint="Rule threshold: ≥ 2 prior claims indicates high loss propensity (EDA top 5% claim tail)."
                required
                className="text-slate-300"
              >
                <Input
                  type="number"
                  min={0}
                  max={8}
                  value={formData.previousClaims}
                  onChange={(e) => handleChange('previousClaims', parseInt(e.target.value) || 0)}
                  className="bg-slate-950 border-slate-700 text-white font-mono focus:border-indigo-500"
                />
              </FormField>

              <FormField
                label="Geospatial Classification (Location)"
                hint="Urban locations carry higher collision probability than rural territories."
                required
                className="text-slate-300"
              >
                <Select
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white focus:border-indigo-500"
                  options={[
                    { value: 'Urban', label: 'Urban — High Traffic Density & Congestion' },
                    { value: 'Suburban', label: 'Suburban — Moderate Traffic Flow' },
                    { value: 'Rural', label: 'Rural — Low Density / Open Highway' },
                  ]}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <FormField label="Policy Type Tier" className="text-slate-300">
                  <Select
                    value={formData.policyType}
                    onChange={(e) => handleChange('policyType', e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white text-xs"
                    options={[
                      { value: 'Basic', label: 'Basic' },
                      { value: 'Comprehensive', label: 'Comprehensive' },
                      { value: 'Premium', label: 'Premium' },
                    ]}
                  />
                </FormField>

                <FormField label="Driver Age" unit="Yrs" className="text-slate-300">
                  <Input
                    type="number"
                    min={18}
                    max={64}
                    value={formData.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value) || 18)}
                    className="bg-slate-950 border-slate-700 text-white text-xs font-mono"
                  />
                </FormField>
              </div>
            </div>

            {/* Geographical Granularity Note */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-slate-200">Dataset Mapping Disclosure:</strong> The dataset encodes
                geography as a 3-tier categorization (<code>Urban</code>, <code>Suburban</code>, <code>Rural</code>).
                No granular street-level coordinates or municipal crash databases are present in the dataset.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-500">Interaction Modeling</span>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-indigo-600/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Analyze Claim Burst Risk
              </Button>
            </div>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6">
              <ResultCard
                title="Claim Burst & Territory Evaluation"
                subtitle="Interaction of Vehicle Age, Claims & Geospatial Density"
                demoLabel="DEMO ACCIDENT PROFILER"
                className="bg-slate-800/90 border-slate-700/80 text-white"
              >
                {/* Overall Risk Header */}
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">
                      Composite Risk Classification
                    </span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">
                      {result.overallRisk} Severity Exposure
                    </h3>
                  </div>
                  <RiskBadge risk={result.overallRisk} size="lg" />
                </div>

                {/* Sub-Risk Categorical Matrix */}
                <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Territory Risk</span>
                    <div className="mt-1.5 flex justify-center">
                      <RiskBadge risk={result.locationRisk} size="sm" />
                    </div>
                    <span className="block text-[11px] text-slate-400 mt-1 font-mono">{formData.location}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Vehicle Age Risk</span>
                    <div className="mt-1.5 flex justify-center">
                      <RiskBadge risk={result.vehicleAgeRisk} size="sm" />
                    </div>
                    <span className="block text-[11px] text-slate-400 mt-1 font-mono">{formData.vehicleAge} Yrs</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Loss Frequency</span>
                    <div className="mt-1.5 flex justify-center">
                      <RiskBadge risk={result.claimsRisk} size="sm" />
                    </div>
                    <span className="block text-[11px] text-slate-400 mt-1 font-mono">{formData.previousClaims} Claims</span>
                  </div>
                </div>

                {/* Evaluated Interaction Factors */}
                <div className="mt-5 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Triggered Risk Factors
                  </h4>
                  {result.triggeredFactors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>

                {/* Actuarial Caution Disclaimer */}
                <div className="mt-6 pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 leading-relaxed">
                  <strong>Actuarial Interpretation Note:</strong> An elevated burst classification indicates heightened
                  statistical loss frequency within this cohort; it does <em>not</em> constitute deterministic certainty
                  that an accident or claim will materialize.
                </div>
              </ResultCard>
            </div>
          ) : (
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-8 shadow-md flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Zap className="w-7 h-7" />
              </div>
              <div className="max-w-xs">
                <h3 className="font-bold text-white text-base">Claim Burst Engine Standby</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Configure the territory, vehicle age, and historical claims count, then click{' '}
                  <strong>Analyze Claim Burst Risk</strong> to evaluate cohort loss density.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
