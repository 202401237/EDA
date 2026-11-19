import React, { useState, useEffect } from 'react';
import { Database, Layers, Hash, Table2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { fetchEdaOverview, fetchDatasetSchema } from '../../services/edaApi';
import type { DatasetOverviewResponse, DatasetSchemaResponse, FeatureSchemaItem } from '../../types/eda';
import { EdaSectionHeader } from '../../components/eda/EdaSectionHeader';
import { EdaCard } from '../../components/eda/EdaCard';
import { EdaMetricCard } from '../../components/eda/EdaMetricCard';
import { EdaLoading } from '../../components/eda/EdaLoading';
import { EdaError } from '../../components/eda/EdaError';
import { EdaDataTable } from '../../components/eda/EdaDataTable';

export function DatasetOverviewPage() {
  const [overview, setOverview] = useState<DatasetOverviewResponse | null>(null);
  const [schema, setSchema] = useState<DatasetSchemaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (bypass = false) => {
    setLoading(true);
    setError(null);
    try {
      const [ovData, scData] = await Promise.all([
        fetchEdaOverview(bypass),
        fetchDatasetSchema(bypass),
      ]);
      setOverview(ovData);
      setSchema(scData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load schema'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <EdaLoading message="Loading data dictionary schema and pipeline stages..." />;
  if (error || !overview || !schema) return <EdaError error={error} onRetry={() => loadData(true)} />;

  // Chart data: features with missingness comparing Pop vs Sample
  const missingComparisonData = schema.features
    .filter((f) => f.missing_count_pop > 0 || f.missing_count_sample > 0)
    .map((f) => ({
      feature: f.column_name,
      'Population Missing %': f.missing_pct_pop,
      'Sample Missing %': f.missing_pct_sample,
    }))
    .sort((a, b) => b['Sample Missing %'] - a['Sample Missing %']);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <EdaSectionHeader
        dimensionNumber="Dimension 01"
        title="Dataset Architecture & Feature Schema"
        subtitle="Structural metadata across all 4 pipeline stages (Population, Sample, Cleaned, Imputed) and comprehensive data dictionary for all 21 features."
        badge="Data Dictionary"
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EdaMetricCard
          label="Total Attributes"
          value={schema.total_features}
          subtitle="Full actuarial feature space"
          accentColor="teal"
          icon={Database}
        />
        <EdaMetricCard
          label="Numerical Predictors"
          value={schema.numerical_features.length}
          subtitle="Continuous & discrete variables"
          accentColor="blue"
          icon={Hash}
        />
        <EdaMetricCard
          label="Categorical Features"
          value={schema.categorical_features.length}
          subtitle="Nominal & ordinal factors"
          accentColor="indigo"
          icon={Layers}
        />
        <EdaMetricCard
          label="Target Variable"
          value="Premium Amount"
          subtitle="Continuous regression target (USD)"
          accentColor="emerald"
          badge="Target"
        />
      </div>

      {/* 4 Pipeline Stages In-depth */}
      <EdaCard
        title="Pipeline Stages & Data Provenance"
        subtitle="Tracking feature dimensions, transformations, and missingness reduction across project lifecycle"
        icon={Layers}
        badge="Provenance Audit"
      >
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">Stage Name</th>
                <th className="px-4 py-3">Canonical File Path</th>
                <th className="px-4 py-3">Rows</th>
                <th className="px-4 py-3">Columns</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Technical Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {overview.stages.map((stage, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-white">{stage.stage_name}</td>
                  <td className="px-4 py-3.5 font-mono text-teal-400 text-[11px]">{stage.file_path}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-200">{stage.row_count.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-200">{stage.column_count}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {stage.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 max-w-xs">{stage.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EdaCard>

      {/* Population vs Sample Missingness Chart */}
      <EdaCard
        title="Population vs Sample Missingness Proportion Drift"
        subtitle="Comparing missingness percentages between 1.2M population and 20k SRS-WOR sample"
        icon={Table2}
        badge="Fidelity Audit"
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={missingComparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="feature" stroke="#64748b" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" domain={[0, 35]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Population Missing %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Sample Missing %" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </EdaCard>

      {/* Data Dictionary Interactive Table */}
      <EdaCard
        title="Comprehensive Data Dictionary (All 21 Features)"
        subtitle="Searchable feature catalog: data types, domain roles, boundary values, cardinality, and recommended treatments"
        icon={FileSpreadsheet}
        badge="Data Dictionary"
        badgeVariant="emerald"
      >
        <EdaDataTable<FeatureSchemaItem>
          columns={[
            {
              key: 'column_name',
              label: 'Feature Name',
              sortable: true,
              render: (val, r) => (
                <div>
                  <span className="font-bold text-white">{val}</span>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{r.data_type}</p>
                </div>
              ),
            },
            {
              key: 'role',
              label: 'Actuarial Role',
              sortable: true,
              render: (val) => {
                const isTarget = String(val).toLowerCase().includes('target');
                const isNum = String(val).toLowerCase().includes('numerical');
                const isCat = String(val).toLowerCase().includes('categorical');
                return (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                      isTarget
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : isNum
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        : isCat
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {val}
                  </span>
                );
              },
            },
            {
              key: 'cardinality',
              label: 'Cardinality',
              sortable: true,
              render: (val) => <span className="font-mono text-slate-300">{val}</span>,
            },
            {
              key: 'min_value',
              label: 'Min / Max Bounds',
              render: (_, r) => (
                <span className="font-mono text-[11px] text-slate-400">
                  {r.min_value ? `${r.min_value} → ${r.max_value}` : 'Categorical levels'}
                </span>
              ),
            },
            {
              key: 'missing_pct_sample',
              label: 'Sample Missing',
              sortable: true,
              render: (val, r) => (
                <div className="font-mono text-[11px]">
                  <span className={val > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                    {val.toFixed(2)}%
                  </span>
                  <span className="text-slate-500 ml-1">({r.missing_count_sample})</span>
                </div>
              ),
            },
            {
              key: 'recommended_treatment',
              label: 'Recommended Imputation / Treatment',
              render: (val) => <span className="text-xs text-teal-300/90 font-mono">{val}</span>,
            },
            {
              key: 'description',
              label: 'Description',
              render: (val) => <span className="text-xs text-slate-400 leading-relaxed">{val}</span>,
            },
          ]}
          data={schema.features}
          searchPlaceholder="Search features by name, role, treatment..."
          defaultPageSize={10}
        />
      </EdaCard>
    </div>
  );
}
