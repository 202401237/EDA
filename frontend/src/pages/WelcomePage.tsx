import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Scale,
  Zap,
  UserX,
  ShieldCheck,
  CheckCircle2,
  Database,
  BarChart4,
  Layers,
  Sparkles,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export function WelcomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                Insurance Intelligence
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  v2.4
                </span>
              </span>
              <p className="text-xs text-slate-400 font-medium">Actuarial Data Science & Decision Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/eda/overview">
              <Button variant="outline" className="border-teal-500/40 bg-teal-950/40 text-teal-300 hover:bg-teal-900/60 text-xs sm:text-sm font-semibold">
                <BarChart4 className="w-3.5 h-3.5 mr-1 text-teal-400" />
                EDA Research Lab
              </Button>
            </Link>
            <Link to="/customer/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs sm:text-sm">
                Customer Sign In
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" className="border-slate-700 bg-slate-800/80 text-teal-400 hover:bg-slate-800 text-xs sm:text-sm">
                <Lock className="w-3.5 h-3.5 mr-1" />
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-slate-300 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Trained on 1.2M Records • 20k Rigorously Validated SRS Sample</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Smarter Insurance Decisions Through{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-300">
              Actuarial Data & Machine Learning
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Bridging customer transparency and underwriting risk management. Real-time pricing prediction,
            under-insurance warnings, solvency margin analytics, and fraud auditing in one unified platform.
          </p>

          {/* Interactive Role Selection Cards */}
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto text-left">
            {/* Customer Role Card */}
            <div className="group relative bg-gradient-to-b from-slate-800/90 to-slate-800/50 hover:to-slate-800 rounded-2xl p-7 border border-slate-700/80 hover:border-blue-500/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                    Role 01
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                    Consumer Facing
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mt-1.5 mb-2">Continue as Customer</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Evaluate your personalized premium estimation, simulate policy options, and get warned
                  if your selected tier leaves your dependents under-insured.
                </p>

                <div className="mt-5 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Insurance Premium Prediction in Indian Rupees (₹)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Rule-based Under-Insurance Warning Engine</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">Demo-only user: Arjun Sharma</span>
                <Link to="/customer/login">
                  <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Customer Portal
                  </Button>
                </Link>
              </div>
            </div>

            {/* Admin Role Card */}
            <div className="group relative bg-gradient-to-b from-slate-800/90 to-slate-800/50 hover:to-slate-800 rounded-2xl p-7 border border-slate-700/80 hover:border-teal-500/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5 group-hover:scale-110 transition-transform">
                  <BarChart4 className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
                    Role 02
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
                    Corporate / Actuary
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mt-1.5 mb-2">Continue as Admin</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Enterprise dashboard for insurance underwriters. Monitor profit buffer margins, claim burst
                  clusters, geospatial accident frequencies, and fraud flags.
                </p>

                <div className="mt-5 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Underwriting Profit Margin Buffer Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Location Accident & Claim Burst Risk Profiler</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">Demo-only user: admin</span>
                <Link to="/admin/login">
                  <Button variant="teal" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Admin Console
                  </Button>
                </Link>
              </div>
            </div>

            {/* EDA Research Lab Card */}
            <div className="group relative bg-gradient-to-b from-slate-800/90 to-slate-800/50 hover:to-slate-800 rounded-2xl p-7 border border-teal-500/30 hover:border-teal-400 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/20 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 mb-5 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-300">
                    Research
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                    18-Point Audit
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mt-1.5 mb-2">EDA Data Science Lab</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Deep exploratory data analysis on the 1.2M population and 20k SRS-WOR sample. Interactive
                  statistical charts, hypothesis tests, and 23 publication figures.
                </p>

                <div className="mt-5 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
                    <span>Little's MCAR Omnibus Test & Informative MNAR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
                    <span>Outlier Retention & Multi-Method Imputation Audit</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-mono text-teal-400">23 Verified Figures</span>
                <Link to="/eda/overview">
                  <Button className="bg-teal-600 hover:bg-teal-500 text-white font-semibold" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Enter EDA Lab
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-slate-950/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase font-bold text-blue-400 tracking-wider">
              Comprehensive Capabilities
            </span>
            <h2 className="text-3xl font-bold text-white mt-2">Six Dedicated Insurance Intelligence Features</h2>
            <p className="text-sm text-slate-400 mt-2">
              Architected to integrate directly with a Spring Boot REST API and trained scikit-learn / LightGBM models.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureSnippetCard
              icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
              badge="Customer"
              title="Premium Prediction"
              description="Predicts annual policy cost using customer demographics, vehicle characteristics, and credit score metrics."
            />
            <FeatureSnippetCard
              icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
              badge="Customer"
              title="Under-Insurance Warning"
              description="Evaluates whether high-income policyholders with dependents are dangerously exposed on Basic coverage."
            />
            <FeatureSnippetCard
              icon={<Scale className="w-5 h-5 text-teal-400" />}
              badge="Admin"
              title="Underwriting Profit Margin"
              description="Compares collected premiums against risk-adjusted minimum premium benchmarks to flag negative buffers."
            />
            <FeatureSnippetCard
              icon={<Zap className="w-5 h-5 text-indigo-400" />}
              badge="Admin"
              title="Claim Burst & Location Risk"
              description="Identifies multi-claim frequency spikes and urban/suburban accident risk clusters across vehicle age cohorts."
            />
            <FeatureSnippetCard
              icon={<UserX className="w-5 h-5 text-rose-400" />}
              badge="Admin"
              title="Customer Churn Alert"
              description="Detects policyholder churn risk from negative customer feedback and extreme premium rate-hike stress."
            />
            <FeatureSnippetCard
              icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
              badge="Admin"
              title="Fraud Suspicion Audit Flag"
              description="Flags claims with concealed prior loss history, synthetic income anomalies, or sub-450 credit scores."
            />
          </div>
        </div>
      </section>

      {/* Architecture & College Presentation Note */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-teal-950/40 p-8 border border-slate-800 flex flex-col md:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Layers className="w-7 h-7" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-lg font-bold text-white">College Presentation & Enterprise Architecture</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              This frontend adheres strictly to clean architecture principles: decoupling state, views, and the
              service layer (`src/services/api.ts`). When your Spring Boot endpoints are online, simply update{' '}
              <code className="text-teal-400 font-mono">VITE_API_BASE_URL</code> without modifying any UI components.
            </p>
          </div>
          <div className="shrink-0 flex gap-3">
            <Link to="/customer/login">
              <Button size="sm" variant="primary">
                Demo Customer
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button size="sm" variant="outline" className="border-slate-700 text-teal-400 hover:bg-slate-800">
                Demo Admin
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#080d1a] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Insurance Intelligence Platform. Built for Academic Presentation & Capstone Defense.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>React 18</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Recharts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureSnippetCard({
  icon,
  badge,
  title,
  description,
}: {
  icon: React.ReactNode;
  badge: 'Customer' | 'Admin';
  title: string;
  description: string;
}) {
  return (
    <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center">
            {icon}
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
              badge === 'Customer' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
            }`}
          >
            {badge}
          </span>
        </div>
        <h4 className="text-base font-bold text-white mb-1.5">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
