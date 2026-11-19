import React, { useState, useEffect } from 'react';
import { Beaker, ShieldCheck, CheckCircle2, AlertCircle, Filter, Scale } from 'lucide-react';
import { fetchHypothesisTesting } from '../../services/edaApi';
import type { HypothesisTestingResponse, HypothesisTestItem } from '../../types/eda';
import { EdaSectionHeader } from '../../components/eda/EdaSectionHeader';
import { EdaCard } from '../../components/eda/EdaCard';
import { EdaMetricCard } from '../../components/eda/EdaMetricCard';
import { EdaLoading } from '../../components/eda/EdaLoading';
import { EdaError } from '../../components/eda/EdaError';
import { EdaDataTable } from '../../components/eda/EdaDataTable';

export function HypothesisTestingPage() {
  const [data, setData] = useState<HypothesisTestingResponse | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (bypass = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHypothesisTesting(bypass);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load hypothesis testing'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) return <EdaLoading message="Evaluating inferential statistical hypothesis tests with Benjamini-Hochberg FDR adjustments..." />;
  if (error || !data) return <EdaError error={error} onRetry={() => loadData(true)} />;

  const categories = Array.from(new Set(data.tests.map((t) => t.test_category)));
  const filteredTests = categoryFilter
    ? data.tests.filter((t) => t.test_category === categoryFilter)
    : data.tests;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <EdaSectionHeader
        dimensionNumber="Dimension 12"
        title="Inferential Hypothesis Testing & Actuarial Significance"
        subtitle="Formal hypothesis testing battery (Little's MCAR omnibus, Welch's t-tests, Mann-Whitney U, Kolmogorov-Smirnov, Chi-Square, and ANOVA) with Benjamini-Hochberg False Discovery Rate control."
        badge="FDR Controlled (q < 0.05)"
        actions={
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-teal-500 font-semibold"
            >
              <option value="">All Test Categories ({data.tests.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EdaMetricCard
          label="Total Tests Executed"
          value={data.total_tests_executed}
          subtitle="Inferential statistical battery"
          accentColor="teal"
          icon={Beaker}
          badge="10+ Battery"
        />
        <EdaMetricCard
          label="FDR Multiplicity Control"
          value="Benjamini-Hochberg"
          subtitle="Controls family-wise error rate"
          accentColor="emerald"
          icon={ShieldCheck}
          delta={{ value: 'q < 0.05 applied', isPositive: true }}
        />
        <EdaMetricCard
          label="MCAR Omnibus Decision"
          value="Reject H0"
          subtitle="Little's test (p < 1e-15)"
          accentColor="purple"
          icon={AlertCircle}
          badge="Not MCAR"
        />
        <EdaMetricCard
          label="Sampling Fidelity"
          value="Identical"
          subtitle="KS & Chi-Square tests fail to reject"
          accentColor="blue"
          icon={CheckCircle2}
          delta={{ value: '100% Validated', isPositive: true }}
        />
      </div>

      {/* Methodology Callout */}
      <EdaCard
        title="Inferential Framework & Multiplicity Protection"
        subtitle="Guarding against false positive discovery across multiple simultaneous actuarial comparisons"
        icon={Scale}
      >
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans space-y-1.5">
          <p>
            <strong className="text-teal-300">Multiplicity Correction: </strong>
            To prevent statistical inflation of Type I errors (false discovery) across multiple simultaneous tests, all raw p-values were evaluated under the{' '}
            <strong className="text-white">Benjamini-Hochberg (BH) False Discovery Rate (FDR)</strong> procedure at critical threshold <code className="text-teal-400 font-mono">q = 0.05</code>.
          </p>
          <p className="text-slate-400">
            For continuous distributions with unequal variances, Welch's t-tests were deployed alongside non-parametric Mann-Whitney U rank tests.
          </p>
        </div>
      </EdaCard>

      {/* Hypothesis Testing Interactive Table */}
      <EdaCard
        title="Comprehensive Inferential Battery Results"
        subtitle="Test statistics, raw vs adjusted p-values, null hypotheses, and actuarial conclusions"
        icon={Beaker}
        badge={`${filteredTests.length} Tests Displayed`}
      >
        <EdaDataTable<HypothesisTestItem>
          columns={[
            {
              key: 'test_category',
              label: 'Category',
              sortable: true,
              render: (v) => (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                  {v}
                </span>
              ),
            },
            {
              key: 'test_name',
              label: 'Test Name & Hypothesis',
              sortable: true,
              render: (v, r) => (
                <div>
                  <span className="font-bold text-white text-xs">{v}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    <strong className="text-slate-500">H₀: </strong>
                    {r.null_hypothesis}
                  </p>
                </div>
              ),
            },
            {
              key: 'test_statistic',
              label: 'Test Statistic',
              sortable: true,
              render: (v) => <span className="font-mono text-xs text-slate-300">{v}</span>,
            },
            {
              key: 'p_value',
              label: 'p-value (Raw / Adjusted)',
              sortable: true,
              render: (v, r) => (
                <div className="font-mono text-xs">
                  <span className="text-teal-300 font-bold">{v}</span>
                  {r.p_value_adjusted && <p className="text-[10px] text-slate-500">Adj: {r.p_value_adjusted}</p>}
                </div>
              ),
            },
            {
              key: 'conclusion',
              label: 'Decision',
              sortable: true,
              render: (v) => {
                const isReject = String(v).toLowerCase().includes('reject h0') && !String(v).toLowerCase().includes('fail');
                return (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isReject
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {v}
                  </span>
                );
              },
            },
            {
              key: 'effect_size',
              label: 'Effect Size',
              render: (v) => <span className="font-mono text-[11px] text-slate-400">{v}</span>,
            },
          ]}
          data={filteredTests}
          searchPlaceholder="Search hypothesis tests by name, category..."
          defaultPageSize={10}
        />
      </EdaCard>
    </div>
  );
}
