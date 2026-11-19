import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Scale,
  Zap,
  UserX,
  ShieldCheck,
  LogOut,
  Building2,
  Menu,
  X,
  ChevronRight,
  Database,
  BarChart3,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const adminNavItems: NavItem[] = [
  { label: 'Executive Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Underwriting Profit Margin', path: '/admin/underwriting-margin', icon: Scale, badge: 'Financial' },
  { label: 'Claim Burst & Location Risk', path: '/admin/claim-burst-risk', icon: Zap, badge: 'Geospatial' },
  { label: 'Customer Churn Alert', path: '/admin/customer-churn', icon: UserX, badge: 'Retention' },
  { label: 'Fraud Suspicion Audit Flag', path: '/admin/fraud-audit', icon: ShieldCheck, badge: 'Audit' },
  { label: 'EDA Data Science Lab', path: '/eda/overview', icon: BarChart3, badge: 'Research' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminUsername = user && user.role === 'admin' ? user.username : 'Chief Actuary';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-[#080d1a] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-72 shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-base">InsurTech</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Actuarial Intelligence</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Analyst Profile Header */}
        <div className="p-4 mx-4 my-4 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm shrink-0">
            {adminUsername.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-white truncate capitalize">{adminUsername}</p>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-teal-400 font-mono">Underwriting Analyst</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Risk Intelligence</span>
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  active
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={cn('w-4.5 h-4.5 shrink-0', active ? 'text-white' : 'text-slate-400 group-hover:text-teal-400')} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold',
                      active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-teal-300'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Dataset Pipeline Status */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 text-teal-400 font-semibold mb-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Telemetry & Ingestion</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Population:</span>
              <span className="text-slate-300 font-bold">1,200,000</span>
            </div>
            <div className="flex justify-between">
              <span>Working Sample:</span>
              <span className="text-emerald-400 font-bold">20,000 (Seed 42)</span>
            </div>
            <div className="flex justify-between">
              <span>Features:</span>
              <span className="text-slate-300">21 Columns</span>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Admin Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0c1222]">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#080d1a]/95 backdrop-blur-sm border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                Underwriting & Portfolio Risk Center
                <span className="text-[10px] bg-slate-800 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/20 font-mono">
                  SaaS Analytics
                </span>
              </h2>
              <p className="text-xs text-slate-400">Macro-level claim clustering, churn alerting & solvency margins</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700 font-mono">
              <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
              API: Mock Ready (VITE_USE_MOCK=true)
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-teal-300 bg-teal-950/60 border border-teal-800/60">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Admin Mode
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
