import React, { useState } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  AlertOctagon,
  ShieldAlert,
  Info,
  Sliders,
  DollarSign,
  FileSearch,
  CreditCard,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FormField, Input, Select } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { ResultCard } from '../../components/ui/ResultCard';
import { DemoBadge } from '../../components/ui/DemoBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { analyzeFraudSuspicion } from '../../services/api';
import type { FraudSuspicionInput, FraudSuspicionResult } from '../../types/features';

const defaultInputs: FraudSuspicionInput = {
  claimReference: 'CLM-2026-8841',
  previousClaimsCount: null, // missing/concealed
  annualIncome: 85, // below 100 threshold
  creditScore: 410, // below 450 threshold
  policyType: 'Comprehensive',
  vehicleAge: 8,
};

export function FraudAuditPage() {
  const [formData, setFormData] = useState<FraudSuspicionInput>(defaultInputs);
  const [isClaimsMissing, setIsClaimsMissing] = useState(true);
  const [claimsCountValue, setClaimsCountValue] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FraudSuspicionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClaimsToggle = (missing: boolean) => {
    setIsClaimsMissing(missing);
    setFormData((prev) => ({
      ...prev,
      previousClaimsCount: missing ? null : claimsCountValue,
    }));
  };

  const handleClaimsCountChange = (count: number) => {
    setClaimsCountValue(count);
    if (!isClaimsMissing) {
      setFormData((prev) => ({ ...prev, previousClaimsCount: count }));
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await analyzeFraudSuspicion(formData);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to reach fraud audit analysis API.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(defaultInputs);
    setIsClaimsMissing(true);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-100">
      <Breadcrumb
        crumbs={[
          { label: 'Admin Portal', to: '/admin/dashboard' },
          { label: 'Fraud Suspicion Audit Flag' },
        ]}
      />

      {/* Header */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Feature: Fraud_Suspicion_Audit_Flag
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium">Underwriting Integrity Triage</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-rose-400" />
            Fraud Suspicion & Documentation Audit Flag
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Identifies insurance claims exhibiting anomaly patterns that warrant secondary documentation verification
            or specialized underwriting review. Evaluates prior loss concealment, income floor clipping, and subprime credit.
          </p>
        </div>
        <DemoBadge label="DEMO AUDIT TRIAGE ENGINE" />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Audit Service Error</p>
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rose-400" />
                Claim Record & Integrity Parameters
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
                label="Claim Tracking Reference"
                hint="Assigned claim audit file identifier"
                required
                className="text-slate-300"
              >
                <Input
                  type="text"
                  value={formData.claimReference}
                  onChange={(e) => setFormData((prev) => ({ ...prev, claimReference: e.target.value }))}
                  className="bg-slate-950 border-slate-700 text-white font-mono focus:border-rose-500"
                />
              </FormField>

              {/* Indicator 1: Previous Claims Missing / Concealed */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <FileSearch className="w-4 h-4 text-rose-400" />
                    Indicator 01: Prior Loss Record Status
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">EDA 30% Missingness</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="claimsStatus"
                      checked={isClaimsMissing}
                      onChange={() => handleClaimsToggle(true)}
                      className="text-rose-600 focus:ring-rose-500 bg-slate-950 border-slate-700"
                    />
                    <span className="font-semibold text-rose-300">Missing / Concealed Record</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="claimsStatus"
                      checked={!isClaimsMissing}
                      onChange={() => handleClaimsToggle(false)}
                      className="text-rose-600 focus:ring-rose-500 bg-slate-950 border-slate-700"
                    />
                    <span>Verified Claims Count</span>
                  </label>
                </div>
                {!isClaimsMissing && (
                  <div className="pt-2">
                    <Input
                      type="number"
                      min={0}
                      max={8}
                      value={claimsCountValue}
                      onChange={(e) => handleClaimsCountChange(parseInt(e.target.value) || 0)}
                      placeholder="Enter verified claims count"
                      className="bg-slate-950 border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Indicator 2: Annual Income <= 100 */}
              <FormField
                label="Reported Annual Income"
                unit="USD / Demo Unit"
                hint="Indicator 02: Values ≤ 100 represent synthetic clipping artifacts or implausible declarations."
                required
                className="text-slate-300"
              >
                <Input
                  type="number"
                  min={1}
                  step={10}
                  value={formData.annualIncome}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      annualIncome: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="bg-slate-950 border-slate-700 text-white font-mono focus:border-rose-500"
                />
              </FormField>

              {/* Indicator 3: Credit Score < 450 */}
              <FormField
                label="Credit Score (FICO Index)"
                unit="300 - 849"
                hint="Indicator 03: Values < 450 fall into extreme subprime territory with severe default history."
                required
                className="text-slate-300"
              >
                <Input
                  type="number"
                  min={300}
                  max={849}
                  value={formData.creditScore}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      creditScore: parseInt(e.target.value) || 300,
                    }))
                  }
                  className="bg-slate-950 border-slate-700 text-white font-mono focus:border-rose-500"
                />
              </FormField>
            </div>

            {/* Threshold Ambiguity Notice */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-slate-200">Critical Threshold Integrity Notice:</strong> The rule condition{' '}
                <code>Annual Income ≤ 100</code> originates from the project brief. In our EDA inspection of the
                20,000-row sample, income ranges from $1.00 to $149,974 with a median of $23,897. The $1.00 floor is an
                artifact of synthetic data generation. This threshold is provisional and configurable.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-500">Heuristic Triage Rules</span>
              <Button
                type="submit"
                variant="danger"
                size="lg"
                loading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Analyze Claim Integrity
              </Button>
            </div>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6">
              <ResultCard
                title="Claim Audit Triage Classification"
                subtitle={`Ref: ${formData.claimReference} • Indicator Trigger Count: ${result.indicatorCount}/3`}
                demoLabel="DEMO AUDIT EVALUATION"
                className="bg-slate-800/90 border-slate-700/80 text-white"
              >
                {/* Main Classification Banner */}
                <div
                  className={`p-5 rounded-xl border flex items-center justify-between ${
                    result.status === 'Potentially Suspicious'
                      ? 'bg-rose-950/70 border-rose-800 text-rose-200'
                      : result.status === 'Further Verification'
                      ? 'bg-amber-950/70 border-amber-800 text-amber-200'
                      : 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertOctagon
                      className={`w-6 h-6 ${
                        result.status === 'Potentially Suspicious'
                          ? 'text-rose-400'
                          : result.status === 'Further Verification'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{result.status.toUpperCase()}</h4>
                      <p className="text-xs opacity-90 mt-0.5">
                        {result.indicatorCount >= 2
                          ? 'Multiple risk indicators triggered simultaneously. Secondary documentation check required.'
                          : result.indicatorCount === 1
                          ? 'Single anomalous indicator detected. Routine validation recommended.'
                          : 'No configured anomaly indicators flagged in this submission.'}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-black/40 border border-white/10 shrink-0">
                    {result.indicatorCount} Flag{result.indicatorCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Triggered Indicator Checklist */}
                <div className="mt-5 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Evaluated Audit Indicators
                  </h4>
                  <IndicatorRow
                    label="1. Prior Claim History Concealed or Missing"
                    triggered={formData.previousClaimsCount === null}
                    detail={formData.previousClaimsCount === null ? 'Missing / Concealed' : 'Verified'}
                  />
                  <IndicatorRow
                    label="2. Reported Income ≤ 100 (Anomaly Threshold)"
                    triggered={formData.annualIncome <= 100}
                    detail={`Income = ${formData.annualIncome}`}
                  />
                  <IndicatorRow
                    label="3. Credit Score < 450 (Severe Subprime)"
                    triggered={formData.creditScore < 450}
                    detail={`Score = ${formData.creditScore}`}
                  />
                </div>

                {/* Recommended Underwriting Action */}
                <div className="mt-5 pt-4 border-t border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Recommended Audit Protocol
                  </h4>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 leading-relaxed">
                    {result.recommendedAction}
                  </div>
                </div>

                {/* Professional Compliance Disclaimer */}
                <div className="mt-4 pt-3 border-t border-slate-700/40 text-[11px] text-slate-400 leading-relaxed">
                  <strong>Compliance & Ethical AI Disclaimer:</strong> This heuristic flag highlights documentation
                  inconsistencies for human underwriter triage. It does <em>not</em> constitute legal or factual proof
                  of fraudulent intent. Final claim disposition must follow formal actuarial and forensic verification.
                </div>
              </ResultCard>
            </div>
          ) : (
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-8 shadow-md flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="max-w-xs">
                <h3 className="font-bold text-white text-base">Audit Triage Standby</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Set the claim parameters on the left and click <strong>Analyze Claim Integrity</strong> to run
                  heuristic indicator evaluation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IndicatorRow({
  label,
  triggered,
  detail,
}: {
  label: string;
  triggered: boolean;
  detail: string;
}) {
  return (
    <div
      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
        triggered ? 'bg-rose-950/40 border-rose-800/60 text-rose-200' : 'bg-slate-900 border-slate-800 text-slate-400'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            triggered ? 'bg-rose-500 ring-2 ring-rose-400' : 'bg-slate-600'
          }`}
        />
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-mono text-[11px]">{detail}</span>
    </div>
  );
}
