import React, { useState } from 'react';
import {
  UserX,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  HeartHandshake,
  Info,
  DollarSign,
  Clock,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FormField, Input, Select } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { ResultCard } from '../../components/ui/ResultCard';
import { DemoBadge } from '../../components/ui/DemoBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { analyzeCustomerChurn } from '../../services/api';
import { formatCurrency } from '../../lib/utils';
import type { CustomerChurnInput, CustomerChurnResult } from '../../types/features';

const defaultInputs: CustomerChurnInput = {
  customerFeedback: 'Poor',
  currentPremium: 1450,
  previousPremium: 1100,
  insuranceDuration: 3,
  policyType: 'Comprehensive',
  location: 'Urban',
};

export function CustomerChurnPage() {
  const [formData, setFormData] = useState<CustomerChurnInput>(defaultInputs);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CustomerChurnResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    field: keyof CustomerChurnInput,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await analyzeCustomerChurn(formData);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to reach customer churn analysis API.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(defaultInputs);
    setResult(null);
    setError(null);
  };

  const premiumDelta = formData.previousPremium > 0
    ? ((formData.currentPremium - formData.previousPremium) / formData.previousPremium) * 100
    : 0;

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-100">
      <Breadcrumb
        crumbs={[
          { label: 'Admin Portal', to: '/admin/dashboard' },
          { label: 'Customer Churn Alert' },
        ]}
      />

      {/* Header */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Feature: Customer_Churn_Alert
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium">Policyholder Retention Predictor</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <UserX className="w-6 h-6 text-amber-400" />
            Customer Churn & Non-Renewal Risk Alert
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Identifies policyholders with high probability of policy cancellation or defection to a competitor.
            Evaluates the disjunctive relationship: <strong>Poor Customer Feedback OR Excessive Premium Rate Shock</strong>.
          </p>
        </div>
        <DemoBadge label="DEMO RETENTION ENGINE" />
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Satisfaction & Pricing Shock Signals
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
                label="Customer Feedback Classification"
                hint="Dataset verified: Feedback missingness was also associated with +$103 higher premium."
                required
                className="text-slate-300"
              >
                <Select
                  value={formData.customerFeedback}
                  onChange={(e) => handleChange('customerFeedback', e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white focus:border-amber-500"
                  options={[
                    { value: 'Poor', label: 'Poor — Dissatisfied / Unresolved Service Complaints' },
                    { value: 'Average', label: 'Average — Moderate Satisfaction' },
                    { value: 'Good', label: 'Good — Highly Satisfied Customer' },
                  ]}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Current Policy Premium"
                  unit="₹ (INR)"
                  required
                  className="text-slate-300"
                >
                  <Input
                    type="number"
                    min={1}
                    value={formData.currentPremium}
                    onChange={(e) => handleChange('currentPremium', parseFloat(e.target.value) || 0)}
                    className="bg-slate-950 border-slate-700 text-white font-mono focus:border-amber-500"
                  />
                </FormField>

                <FormField
                  label="Previous Year Premium"
                  unit="₹ (INR)"
                  hint={`Rate delta: ${premiumDelta >= 0 ? `+${premiumDelta.toFixed(1)}%` : `${premiumDelta.toFixed(1)}%`}`}
                  required
                  className="text-slate-300"
                >
                  <Input
                    type="number"
                    min={1}
                    value={formData.previousPremium}
                    onChange={(e) => handleChange('previousPremium', parseFloat(e.target.value) || 0)}
                    className="bg-slate-950 border-slate-700 text-white font-mono focus:border-amber-500"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <FormField label="Tenure (Duration)" unit="1-9 Yrs" className="text-slate-300">
                  <Input
                    type="number"
                    min={1}
                    max={9}
                    value={formData.insuranceDuration}
                    onChange={(e) => handleChange('insuranceDuration', parseInt(e.target.value) || 1)}
                    className="bg-slate-950 border-slate-700 text-white text-xs font-mono"
                  />
                </FormField>

                <FormField label="Policy Type" className="text-slate-300">
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

                <FormField label="Location" className="text-slate-300">
                  <Select
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white text-xs"
                    options={[
                      { value: 'Urban', label: 'Urban' },
                      { value: 'Suburban', label: 'Suburban' },
                      { value: 'Rural', label: 'Rural' },
                    ]}
                  />
                </FormField>
              </div>
            </div>

            {/* Churn Proxy Note */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-slate-200">Dataset Mapping Disclosure:</strong> The Kaggle insurance dataset
                contains no historical &quot;Did Churn&quot; ground-truth label. This module simulates retention risk through
                actuarially sound proxies: customer sentiment scores combined with rate-increase stress indicators.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-500">Heuristic Evaluation</span>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-amber-600/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Analyze Churn Risk
              </Button>
            </div>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6">
              <ResultCard
                title="Customer Retention & Defection Risk"
                subtitle="Calculated via Sentiment & Rate-Hike Shock Signals"
                demoLabel="DEMO RETENTION ASSESSMENT"
                className="bg-slate-800/90 border-slate-700/80 text-white"
              >
                {/* Churn Risk Level Header */}
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">
                      Calculated Defection Probability
                    </span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">
                      {result.churnRisk} Retention Hazard
                    </h3>
                  </div>
                  <div className="text-right">
                    <RiskBadge risk={result.churnRisk} size="lg" />
                    <span className="block font-mono text-[11px] text-slate-400 mt-1">
                      {result.churnProbability !== null && result.churnProbability !== undefined
                        ? `~${result.churnProbability}% probability`
                        : "Deterministic Rule (Uncalibrated)"}
                    </span>
                  </div>
                </div>

                {/* Contributing Stress Factors */}
                <div className="mt-5 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Contributing Factors Identified
                  </h4>
                  {result.triggeredFactors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>

                {/* Retention Action Strategies */}
                <div className="mt-5 pt-4 border-t border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4" />
                    Recommended Account Retention Protocol
                  </h4>
                  <div className="space-y-1.5">
                    {result.retentionSuggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-800/50 text-xs text-teal-200 flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ResultCard>
            </div>
          ) : (
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-8 shadow-md flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <UserX className="w-7 h-7" />
              </div>
              <div className="max-w-xs">
                <h3 className="font-bold text-white text-base">Retention Monitor Standby</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Configure the policyholder feedback grade and premium trajectory, then click{' '}
                  <strong>Analyze Churn Risk</strong> to estimate defection likelihood.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
