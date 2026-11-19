import React, { useState } from 'react';
import {
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Info,
  Layers,
  Car,
  Users,
  DollarSign,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FormField, Input, Select } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { ResultCard } from '../../components/ui/ResultCard';
import { DemoBadge } from '../../components/ui/DemoBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { checkUnderInsuranceWarning } from '../../services/api';
import type { UnderInsuranceInput, UnderInsuranceResult } from '../../types/features';

const defaultInputs: UnderInsuranceInput = {
  numberOfDependents: 2,
  annualIncome: 35000,
  vehicleAge: 1,
  policyType: 'Basic',
};

export function UnderInsurancePage() {
  const [formData, setFormData] = useState<UnderInsuranceInput>(defaultInputs);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UnderInsuranceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof UnderInsuranceInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await checkUnderInsuranceWarning(formData);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to reach under-insurance API.');
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
    <div className="space-y-6 animate-fade-in font-sans">
      <Breadcrumb
        crumbs={[
          { label: 'Customer Portal', to: '/customer/dashboard' },
          { label: 'Under-Insurance Warning' },
        ]}
      />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Feature: Under_Insurance_Warning
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Rule-Based Actuarial Heuristic</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            Under-Insurance Coverage Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Warns policyholders when their selected coverage tier may be dangerously inadequate relative to
            their household dependency, vehicle replacement cost, and income bracket.
          </p>
        </div>
        <DemoBadge label="DEMO ASSESSMENT — RULE-BASED LOGIC" />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-800">
            <p className="font-bold text-sm">Audit Service Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleCheck} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                Coverage & Household Profile
              </h2>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>

            <div className="space-y-4">
              <FormField
                label="Number of Household Dependents"
                unit="0 - 4"
                hint="Rule threshold: ≥ 2 dependents significantly escalates financial exposure in third-party liability."
                required
              >
                <Select
                  value={formData.numberOfDependents}
                  onChange={(e) => handleChange('numberOfDependents', parseInt(e.target.value))}
                  options={[
                    { value: 0, label: '0 Dependents' },
                    { value: 1, label: '1 Dependent' },
                    { value: 2, label: '2 Dependents (Threshold)' },
                    { value: 3, label: '3 Dependents' },
                    { value: 4, label: '4 Dependents' },
                  ]}
                />
              </FormField>

              <FormField
                label="Annual Household Income"
                unit="USD (Demo threshold: $25,000+)"
                hint="Assesses whether policyholder qualifies as 'good income' with assets to safeguard."
                required
              >
                <Input
                  type="number"
                  min={1}
                  max={150000}
                  step={1000}
                  value={formData.annualIncome}
                  onChange={(e) => handleChange('annualIncome', parseFloat(e.target.value) || 0)}
                />
              </FormField>

              <FormField
                label="Vehicle Age"
                unit="Years (0 - 19)"
                hint="Rule threshold: ≤ 2 years indicates a new or high-replacement-value vehicle."
                required
              >
                <Input
                  type="number"
                  min={0}
                  max={19}
                  value={formData.vehicleAge}
                  onChange={(e) => handleChange('vehicleAge', parseInt(e.target.value) || 0)}
                />
              </FormField>

              <FormField
                label="Current Selected Policy Plan Tier"
                hint="Basic covers minimum statutory liability; Comprehensive & Premium cover collision and theft."
                required
              >
                <Select
                  value={formData.policyType}
                  onChange={(e) => handleChange('policyType', e.target.value)}
                  options={[
                    { value: 'Basic', label: 'Basic Coverage (Minimum Legal Liability)' },
                    { value: 'Comprehensive', label: 'Comprehensive Coverage' },
                    { value: 'Premium', label: 'Premium Full-Protection Coverage' },
                  ]}
                />
              </FormField>
            </div>

            {/* Note on missing columns */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-700">Dataset Observation:</strong> The underlying dataset contains
                the premium charged, but does <em>not</em> contain an explicit &quot;Coverage Limit&quot; column. This rule
                heuristically contrasts policy tier against dependent and asset vulnerability.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Deterministic Rule Engine</span>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-amber-600/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Check Coverage Adequacy
              </Button>
            </div>
          </form>
        </div>

        {/* Audit Results Column */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6">
              <ResultCard
                title="Coverage Adequacy Assessment"
                subtitle="Rule Evaluation Against Underwriting Criteria"
                demoLabel="DEMO RULE EVALUATION"
              >
                {/* Status Banner */}
                {result.isUnderInsured ? (
                  <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                        <h4 className="font-bold text-sm text-rose-900">
                          UNDER-INSURANCE WARNING TRIGGERED
                        </h4>
                      </div>
                      <RiskBadge risk={result.riskLevel} />
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      Your household profile exhibits elevated asset exposure that is not sufficiently protected by the{' '}
                      <strong>{formData.policyType}</strong> plan tier.
                    </p>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <h4 className="font-bold text-sm text-emerald-900">
                          ADEQUATE COVERAGE ALIGNMENT
                        </h4>
                      </div>
                      <RiskBadge risk={result.riskLevel} />
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Based on the supplied profile, your current selection ({formData.policyType}) does not violate
                      our under-insurance alert threshold.
                    </p>
                  </div>
                )}

                {/* Triggered Conditions Breakdown */}
                <div className="mt-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Evaluated Rule Conditions ({result.triggeredConditions.length}/4 Active)
                  </h4>
                  <div className="space-y-2 text-xs">
                    <ConditionRow
                      label="Dependents ≥ 2"
                      satisfied={formData.numberOfDependents >= 2}
                      detail={`${formData.numberOfDependents} Dependents recorded`}
                    />
                    <ConditionRow
                      label="Good Income Bracket (≥ $25,000)"
                      satisfied={formData.annualIncome >= 25000}
                      detail={`$${formData.annualIncome.toLocaleString()} Annual Income`}
                    />
                    <ConditionRow
                      label="New Vehicle (Age ≤ 2 years)"
                      satisfied={formData.vehicleAge <= 2}
                      detail={`${formData.vehicleAge} Years Old`}
                    />
                    <ConditionRow
                      label="Basic Policy Tier Selected"
                      satisfied={formData.policyType === 'Basic'}
                      detail={`Tier: ${formData.policyType}`}
                    />
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Next Recommended Actions
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {result.recommendation}
                  </p>
                </div>
              </ResultCard>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="max-w-xs">
                <h3 className="font-bold text-slate-800 text-base">Coverage Audit Standby</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Verify your vehicle age, dependent count, and policy tier, then click{' '}
                  <strong>Check Coverage Adequacy</strong> to evaluate rule compliance.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-left text-xs text-amber-800 space-y-1.5 w-full">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Deterministic Business Rule Definition
                </p>
                <p className="text-[11px] text-amber-900/80 leading-normal">
                  Flagged when: <code>(Dependents ≥ 2) AND (Income ≥ $25k) AND (Vehicle ≤ 2 yrs) AND (Plan == Basic)</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConditionRow({
  label,
  satisfied,
  detail,
}: {
  label: string;
  satisfied: boolean;
  detail: string;
}) {
  return (
    <div
      className={`p-2.5 rounded-lg border flex items-center justify-between ${
        satisfied ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            satisfied ? 'bg-amber-500 ring-2 ring-amber-300' : 'bg-slate-300'
          }`}
        />
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-mono text-[11px]">{detail}</span>
    </div>
  );
}
