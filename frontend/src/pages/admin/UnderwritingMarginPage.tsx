import React, { useState } from 'react';
import {
  Scale,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FormField, Input, Select } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { ResultCard } from '../../components/ui/ResultCard';
import { DemoBadge } from '../../components/ui/DemoBadge';
import { analyzeUnderwritingMargin } from '../../services/api';
import { formatCurrency, getStatusColor } from '../../lib/utils';
import type {
  UnderwritingMarginInput,
  UnderwritingMarginResult,
} from '../../types/features';

const defaultInputs: UnderwritingMarginInput = {
  customerPaidPremium: 1450,
  riskAdjustedMinPremium: 1200,
  policyType: 'Comprehensive',
  previousClaims: 1,
  vehicleAge: 5,
};

export function UnderwritingMarginPage() {
  const [formData, setFormData] = useState<UnderwritingMarginInput>(defaultInputs);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UnderwritingMarginResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    field: keyof UnderwritingMarginInput,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await analyzeUnderwritingMargin(formData);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to reach underwriting margin analysis API.');
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
          { label: 'Underwriting Profit Margin' },
        ]}
      />

      {/* Header */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Feature: Underwriting_Profit_Margin
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium">Actuarial Buffer Analysis</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-teal-400" />
            Underwriting Profit Margin & Buffer Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Evaluates whether the customer-collected premium provides a sufficient solvency buffer above the
            risk-adjusted minimum required premium calculated for this policy profile.
          </p>
        </div>
        <DemoBadge label="DEMO UNDERWRITING AUDIT" />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                Premium & Actuarial Assumptions
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
                label="Customer-Paid Annual Premium"
                unit="₹ (INR / year)"
                hint="Actual premium billed to policyholder. EDA Dataset Mean: ₹1,098; Median: ₹867."
                required
                className="text-slate-300"
              >
                <Input
                  type="number"
                  min={1}
                  step={50}
                  value={formData.customerPaidPremium}
                  onChange={(e) => handleChange('customerPaidPremium', parseFloat(e.target.value) || 0)}
                  className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-teal-500 focus:ring-teal-500 font-mono"
                />
              </FormField>

              <FormField
                label="Risk-Adjusted Minimum Required Premium"
                unit="₹ (INR / year)"
                hint="Actuarially required baseline premium considering loss expectancy and solvency requirements."
                required
                className="text-slate-300"
              >
                <Input
                  type="number"
                  min={1}
                  step={50}
                  value={formData.riskAdjustedMinPremium}
                  onChange={(e) => handleChange('riskAdjustedMinPremium', parseFloat(e.target.value) || 0)}
                  className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-teal-500 focus:ring-teal-500 font-mono"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <FormField label="Policy Type" className="text-slate-300">
                  <Select
                    value={formData.policyType}
                    onChange={(e) => handleChange('policyType', e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white text-xs focus:border-teal-500"
                    options={[
                      { value: 'Basic', label: 'Basic' },
                      { value: 'Comprehensive', label: 'Comprehensive' },
                      { value: 'Premium', label: 'Premium' },
                    ]}
                  />
                </FormField>

                <FormField label="Vehicle Age" unit="Yrs" className="text-slate-300">
                  <Input
                    type="number"
                    min={0}
                    max={19}
                    value={formData.vehicleAge}
                    onChange={(e) => handleChange('vehicleAge', parseInt(e.target.value) || 0)}
                    className="bg-slate-950 border-slate-700 text-white text-xs font-mono"
                  />
                </FormField>

                <FormField label="Past Claims" unit="Count" className="text-slate-300">
                  <Input
                    type="number"
                    min={0}
                    max={8}
                    value={formData.previousClaims}
                    onChange={(e) => handleChange('previousClaims', parseInt(e.target.value) || 0)}
                    className="bg-slate-950 border-slate-700 text-white text-xs font-mono"
                  />
                </FormField>
              </div>
            </div>

            {/* Actuarial Disclosure Note */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-slate-200">Financial Integrity Note:</strong> The calculated premium
                difference represents an <em>underwriting margin-buffer indicator</em>, not actual company net profit.
                True underwriting profit requires comprehensive claim loss costs and expense ratio accounting.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-500">Margin Buffer Heuristic</span>
              <Button
                type="submit"
                variant="teal"
                size="lg"
                loading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Analyze Margin Buffer
              </Button>
            </div>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6">
              <ResultCard
                title="Underwriting Buffer Evaluation"
                subtitle="Customer Collected vs Minimum Solvency Premium"
                demoLabel="DEMO CALCULATION"
                className="bg-slate-800/90 border-slate-700/80 text-white"
              >
                {/* Status Indicator Card */}
                <div
                  className={`p-5 rounded-xl border flex items-center justify-between ${
                    result.status === 'Above'
                      ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                      : result.status === 'At'
                      ? 'bg-blue-950/60 border-blue-800/80 text-blue-300'
                      : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.status === 'Above' ? (
                      <TrendingUp className="w-6 h-6 text-emerald-400" />
                    ) : result.status === 'At' ? (
                      <CheckCircle2 className="w-6 h-6 text-blue-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-rose-400" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {result.status === 'Above'
                          ? 'ABOVE MINIMUM PREMIUM (POSITIVE BUFFER)'
                          : result.status === 'At'
                          ? 'AT MINIMUM PREMIUM (NEUTRAL BUFFER)'
                          : 'BELOW MINIMUM PREMIUM (DEFICIT RISK)'}
                      </h4>
                      <p className="text-xs opacity-90 mt-0.5">
                        {result.status === 'Above'
                          ? 'Collected premium exceeds actuarial floor, generating protective surplus buffer.'
                          : result.status === 'At'
                          ? 'Collected premium matches baseline actuarial requirement exactly.'
                          : 'Under-priced policy: Collected premium falls below risk-adjusted baseline.'}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-base font-bold px-3 py-1 rounded-lg bg-black/30 border border-white/10 shrink-0">
                    {result.marginPercent > 0 ? `+${result.marginPercent}%` : `${result.marginPercent}%`}
                  </span>
                </div>

                {/* Numerical Financial Breakdown */}
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Collected</span>
                    <p className="text-lg font-bold text-white font-mono mt-1">
                      {formatCurrency(result.customerPaidPremium)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Min Required</span>
                    <p className="text-lg font-bold text-teal-400 font-mono mt-1">
                      {formatCurrency(result.riskAdjustedMinPremium)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Net Buffer</span>
                    <p
                      className={`text-lg font-bold font-mono mt-1 ${
                        result.difference >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {result.difference >= 0 ? `+${formatCurrency(result.difference)}` : formatCurrency(result.difference)}
                    </p>
                  </div>
                </div>

                {/* Visual Buffer Bar */}
                <div className="mt-5 pt-4 border-t border-slate-700/60 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Solvency Buffer Ratio:</span>
                    <span className="font-mono text-white font-bold">
                      {result.customerPaidPremium} / {result.riskAdjustedMinPremium}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.difference >= 0 ? 'bg-teal-500' : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(10, (result.customerPaidPremium / (result.riskAdjustedMinPremium * 1.5)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </ResultCard>
            </div>
          ) : (
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-8 shadow-md flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                <Scale className="w-7 h-7" />
              </div>
              <div className="max-w-xs">
                <h3 className="font-bold text-white text-base">Underwriting Auditor Ready</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enter the policyholder collected premium and risk-adjusted floor, then click{' '}
                  <strong>Analyze Margin Buffer</strong> to inspect solvency status.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
