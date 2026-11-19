import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { DemoBadge } from '../../components/ui/DemoBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency } from '../../lib/utils';
import type { PremiumPredictionResult } from '../../types/features';

export function CustomerDashboard() {
  const { user } = useAuth();
  const customerName = user && user.role === 'customer' ? user.name : 'Policyholder';

  // State to hold recent demo prediction if one has been run during this browser session
  const [recentPrediction, setRecentPrediction] = useState<PremiumPredictionResult | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('ii_recent_premium_prediction');
      if (stored) {
        setRecentPrediction(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleClearHistory = () => {
    sessionStorage.removeItem('ii_recent_premium_prediction');
    setRecentPrediction(null);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Risk Scoring Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {customerName}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Access transparent, statistical premium forecasting based on actuarial benchmarks.
            Select an assessment tool below to calculate your estimated annual rates or audit your current plan coverage.
          </p>
        </div>
      </div>

      {/* Two Large Customer Feature Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Personalized Risk & Pricing Tools</h2>
            <p className="text-xs text-slate-500">Customer self-service assessment features</p>
          </div>
          <DemoBadge label="Interactive Client Mock" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 1: Premium Prediction */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calculator className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                  ML Prediction Model
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">Insurance Premium Prediction</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Estimate the fair annual insurance premium for your vehicle and household. Incorporates verified
                actuarial factors such as age, credit standing, income, and previous claim records.
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Output calibrated in Indian Rupees (₹) with 85%–115% confidence bands</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Supports multi-tier policy comparison (Basic, Comprehensive, Premium)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Estimated time: 1 min</span>
              <Link to="/customer/premium-prediction">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start Prediction
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature 2: Under-Insurance Warning */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-100">
                  Coverage Audit Engine
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">Under-Insurance Warning</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Determine whether your selected policy plan provides adequate protection against major loss.
                Identifies high-income policyholders with dependents at risk of financial exposure.
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Evaluates dependent ratio against selected policy coverage ceiling</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Automated recommendation to upgrade to Comprehensive or Premium tiers</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Estimated time: 30 secs</span>
              <Link to="/customer/under-insurance-warning">
                <Button variant="outline" size="md" className="border-amber-400 text-amber-800 hover:bg-amber-50" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Audit My Policy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity / Session Predictions Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recent Demo Session Predictions
            </h3>
          </div>
          {recentPrediction && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="mt-5">
          {recentPrediction ? (
            <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-600 text-white font-mono">
                    {recentPrediction.policyType} Plan
                  </span>
                  <span className="text-xs text-slate-500">Predicted during current session</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {formatCurrency(recentPrediction.estimatedPremium)}
                  </span>
                  <span className="text-xs text-slate-500">/ annual premium</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Confidence range: {formatCurrency(recentPrediction.confidenceLow)} – {formatCurrency(recentPrediction.confidenceHigh)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/customer/premium-prediction">
                  <Button variant="outline" size="sm">
                    Re-calculate
                  </Button>
                </Link>
                <Link to="/customer/under-insurance-warning">
                  <Button variant="primary" size="sm">
                    Check Coverage Fit
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Calculator className="w-6 h-6 text-slate-400" />}
              title="No demo predictions generated yet"
              description="Click 'Start Prediction' above to configure your driver profile and calculate your first simulated annual premium."
              action={
                <Link to="/customer/premium-prediction">
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Launch Premium Estimator
                  </Button>
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
