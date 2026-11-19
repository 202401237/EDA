import React, { useState, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EdaLoading } from '../components/eda/EdaLoading';
import {
  LayoutDashboard,
  Database,
  ShieldCheck,
  GitCompare,
  AlertTriangle,
  Sparkles,
  Crosshair,
  BarChart3,
  Split,
  Network,
  Layers,
  Calendar,
  Beaker,
  Target,
  Cpu,
  LineChart,
  Compass,
  Image as ImageIcon,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { config } from '../config';

interface EdaNavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  group: 'Foundation' | 'Integrity' | 'Distributions' | 'Inference' | 'Synthesis';
}

const edaNavItems: EdaNavItem[] = [
  // Foundation
  { id: 'overview', label: 'Executive Overview', path: '/eda/overview', icon: LayoutDashboard, badge: 'Summary', group: 'Foundation' },
  { id: 'dataset', label: 'Dataset & Pipeline Stages', path: '/eda/dataset', icon: Database, badge: '4 Stages', group: 'Foundation' },
  { id: 'quality', label: 'Data Quality & Signatures', path: '/eda/data-quality', icon: ShieldCheck, badge: 'Audit', group: 'Foundation' },
  { id: 'sampling', label: 'Sampling & Validation', path: '/eda/sampling', icon: GitCompare, badge: 'SRS-WOR', group: 'Foundation' },

  // Integrity & Preprocessing
  { id: 'missing', label: 'Missing Values & MCAR', path: '/eda/missing-values', icon: AlertTriangle, badge: 'MNAR', group: 'Integrity' },
  { id: 'imputation', label: 'Imputation & Audit Log', path: '/eda/imputation', icon: Sparkles, badge: '19.9k cells', group: 'Integrity' },
  { id: 'outliers', label: 'Outliers & Tail Risks', path: '/eda/outliers', icon: Crosshair, badge: 'IQR/MAD', group: 'Integrity' },

  // Distributions & Relationships
  { id: 'univariate', label: 'Univariate Moments', path: '/eda/univariate', icon: BarChart3, badge: '15 Bins', group: 'Distributions' },
  { id: 'bivariate', label: 'Bivariate Stratification', path: '/eda/bivariate', icon: Split, badge: 'Target', group: 'Distributions' },
  { id: 'correlation', label: 'Correlation Matrices', path: '/eda/correlation', icon: Network, badge: '9x9', group: 'Distributions' },
  { id: 'multivariate', label: 'Multivariate & VIF', path: '/eda/multivariate', icon: Layers, badge: 'VIF < 1.05', group: 'Distributions' },
  { id: 'temporal', label: 'Temporal Trends & Time', path: '/eda/temporal', icon: Calendar, badge: '15:21:39', group: 'Distributions' },

  // Inference & Modeling
  { id: 'hypothesis', label: 'Hypothesis Testing', path: '/eda/hypothesis-testing', icon: Beaker, badge: 'FDR Adjusted', group: 'Inference' },
  { id: 'target', label: 'Target Variable Analysis', path: '/eda/target-analysis', icon: Target, badge: 'P1-P99', group: 'Inference' },
  { id: 'feature_eng', label: 'Feature Engineering', path: '/eda/feature-engineering', icon: Cpu, badge: 'Ratios', group: 'Inference' },
  { id: 'diagnostics', label: 'Model Diagnostics', path: '/eda/model-diagnostics', icon: LineChart, badge: '6 Pipelines', group: 'Inference' },

  // Synthesis & Figures
  { id: 'insights', label: 'Insights & Coverage', path: '/eda/insights', icon: Compass, badge: '100% Audit', group: 'Synthesis' },
  { id: 'visualizations', label: 'Visualizations Gallery', path: '/eda/visualizations', icon: ImageIcon, badge: '23 Figures', group: 'Synthesis' },
];

export function EdaLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const groups = ['Foundation', 'Integrity', 'Distributions', 'Inference', 'Synthesis'] as const;

  const currentItem = edaNavItems.find(
    (item) => location.pathname === item.path || (item.path === '/eda/overview' && location.pathname === '/eda')
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-teal-500 selection:text-white">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* EDA Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-[#080d1a] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-72 shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-emerald-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-base">InsurTech</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  EDA LAB
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Actuarial Data Science</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dataset Pipeline Badge */}
        <div className="px-4 py-3 mx-4 my-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 font-medium">Telemetry Baseline</span>
            <span className="text-emerald-400 font-mono text-[11px] font-bold">Verified</span>
          </div>
          <div className="flex justify-between items-baseline font-mono text-[11px] text-slate-300">
            <span>Population: 1.2M</span>
            <span className="text-teal-400">Sample: 20k</span>
          </div>
        </div>

        {/* Scrollable Navigation Categories */}
        <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto custom-scrollbar">
          {groups.map((group) => {
            const items = edaNavItems.filter((i) => i.group === group);
            return (
              <div key={group} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  {group}
                </div>
                {items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    location.pathname === item.path ||
                    (item.path === '/eda/overview' && (location.pathname === '/eda' || location.pathname === '/eda/'));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                        active
                          ? 'bg-teal-600 text-white font-semibold shadow-sm shadow-teal-600/30'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0 transition-colors',
                            active ? 'text-white' : 'text-slate-500 group-hover:text-teal-400'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0',
                            active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-400'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Quick External Links Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-[#060a14]">
          <Link
            to="/customer/premium-prediction"
            className="flex items-center justify-between text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <span>Production ML Pricing</span>
            <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
          </Link>
          <Link
            to="/admin/dashboard"
            className="flex items-center justify-between text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <span>Underwriting Center</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0c1222]">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <Link to="/eda/overview" className="text-slate-400 hover:text-white transition-colors">
                EDA Lab
              </Link>
              {currentItem && currentItem.path !== '/eda/overview' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-teal-400 font-semibold">{currentItem.label}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 text-xs border border-slate-700/80 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              FastAPI: {config.apiBaseUrl ? 'Connected' : 'Local :8000'}
            </div>
            <a
              href={`${config.apiBaseUrl || 'http://127.0.0.1:8000'}/docs`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-teal-300 bg-teal-950/60 border border-teal-800/60 hover:bg-teal-900/60 transition-colors"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Swagger API
            </a>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Suspense fallback={<EdaLoading message="Loading analysis module from backend..." />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
