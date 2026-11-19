import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  Zap,
  UserX,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Database,
  BarChart3,
  PieChart as PieIcon,
  ShieldAlert,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { KPICard } from '../../components/ui/KPICard';
import { DemoBadge } from '../../components/ui/DemoBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { Button } from '../../components/ui/Button';
import {
  adminKPIs,
  claimRiskDistribution,
  locationRiskData,
  churnTrendData,
  premiumVsRiskData,
  fraudFlagData,
  recentAnalyses,
} from '../../lib/mockDashboardData';

export function AdminDashboard() {
  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950/80 rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-mono font-semibold mb-3 border border-teal-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>InsurTech Actuarial Engine • Telemetry v2.4</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Executive Underwriting & Risk Intelligence
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Consolidated macro portfolio metrics, geospatial frequency clusters, and predictive risk indicators.
              All sample analytics are calibrated against our 20,000-row representative dataset sample.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <DemoBadge label="DEMO ANALYTICS DATASET" />
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminKPIs.map((kpi, idx) => (
          <KPICard
            key={idx}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            positive={kpi.positive}
            note={kpi.note}
            accentColor={idx === 1 ? 'rose' : idx === 2 ? 'amber' : idx === 3 ? 'teal' : 'blue'}
            className="bg-slate-800/90 border-slate-700/80 text-white"
          />
        ))}
      </div>

      {/* Four Feature Navigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Actuarial Decision Modalities</h2>
            <p className="text-xs text-slate-400">Launch in-depth underwriting assessment workflows</p>
          </div>
          <span className="text-xs text-teal-400 font-mono">4 Enterprise Modules Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Underwriting Profit Margin */}
          <AdminFeatureCard
            to="/admin/underwriting-margin"
            icon={<Scale className="w-5 h-5 text-teal-400" />}
            badge="Solvency"
            title="Underwriting Margin"
            description="Audit customer-paid premium against actuarially adjusted minimum required buffer."
          />

          {/* Card 2: Claim Burst Risk */}
          <AdminFeatureCard
            to="/admin/claim-burst-risk"
            icon={<Zap className="w-5 h-5 text-indigo-400" />}
            badge="Geospatial"
            title="Claim Burst Risk"
            description="Identify urban accident density and multi-claim spikes in older vehicle cohorts."
          />

          {/* Card 3: Customer Churn Alert */}
          <AdminFeatureCard
            to="/admin/customer-churn"
            icon={<UserX className="w-5 h-5 text-amber-400" />}
            badge="Retention"
            title="Customer Churn Alert"
            description="Detect policy non-renewal risk from negative feedback sentiment and rate shocks."
          />

          {/* Card 4: Fraud Audit Flag */}
          <AdminFeatureCard
            to="/admin/fraud-audit"
            icon={<ShieldCheck className="w-5 h-5 text-rose-400" />}
            badge="Audit"
            title="Fraud Suspicion Audit"
            description="Flag suspicious claims with concealed prior losses, income clipping, or sub-450 credit."
          />
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Claim Risk Distribution */}
        <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Claim Frequency Risk Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Categorized across 2,847 sample policyholders</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              Demo Data
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={claimRiskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {claimRiskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Location Accident Risk Index */}
        <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Location Risk & Claim Density
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Urban vs Suburban vs Rural risk indices</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              EDA Mapped
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="location" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="claims" name="Claim Incidents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="risk" name="Risk Exposure Index" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Monthly Churn Risk Trajectory */}
        <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Customer Churn Risk Trajectory (6 Months)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">High vs Medium churn cohorts over time</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              Demo Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={churnTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="high" name="High Churn Risk" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="medium" name="Medium Churn Risk" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Premium vs Risk-Adjusted Buffer */}
        <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Collected Premium vs Risk-Adjusted Minimum
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Underwriting margin buffer by risk cohort (USD)</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              Demo Model
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={premiumVsRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="paid" name="Avg Paid Premium ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="minRequired" name="Min Required Buffer ($)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Analysis Table */}
      <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Underwriting Audits & Case Telemetry
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Sample claims evaluated during active actuarial session</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
            5 Recent Cases
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Case Identifier</th>
                <th className="py-3 px-4">Analysis Modality</th>
                <th className="py-3 px-4">Policyholder</th>
                <th className="py-3 px-4">Calculated Risk</th>
                <th className="py-3 px-4">Evaluation Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-300">
              {recentAnalyses.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-teal-300">{item.id}</td>
                  <td className="py-3.5 px-4 font-medium text-white">{item.type}</td>
                  <td className="py-3.5 px-4 text-slate-400">{item.customer}</td>
                  <td className="py-3.5 px-4">
                    <RiskBadge risk={item.risk} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">{item.date}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={
                        item.type.includes('Claim')
                          ? '/admin/claim-burst-risk'
                          : item.type.includes('Churn')
                          ? '/admin/customer-churn'
                          : item.type.includes('Fraud')
                          ? '/admin/fraud-audit'
                          : '/admin/underwriting-margin'
                      }
                      className="text-teal-400 hover:text-teal-300 font-semibold"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminFeatureCard({
  to,
  icon,
  badge,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="bg-slate-800/90 rounded-xl p-5 border border-slate-700/80 hover:border-teal-500/60 hover:bg-slate-800 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            {icon}
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
            {badge}
          </span>
        </div>
        <h4 className="text-base font-bold text-white mb-1.5 group-hover:text-teal-300 transition-colors">
          {title}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>Launch Module</span>
        <ArrowRight className="w-3.5 h-3.5 text-teal-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
