import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, Lock, User, ArrowRight, ShieldAlert, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { Button } from '../../components/ui/Button';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and administrative access key.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Validate against configured demo credentials
      if (
        username.trim().toLowerCase() === config.demoAdmin.username.toLowerCase() &&
        password.trim() === config.demoAdmin.password
      ) {
        loginAdmin(username.trim());
        navigate('/admin/dashboard');
      } else {
        setError('Invalid administrative credentials. Hint: use Demo Pre-fill for presentation.');
      }
    }, 600);
  };

  const handleFillDemo = () => {
    setUsername(config.demoAdmin.username);
    setPassword(config.demoAdmin.password);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/30 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">InsurTech Enterprise</span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">Underwriting & Actuarial Console</h2>
        <p className="mt-2 text-xs text-slate-400">Restricted to authorized actuarial personnel only</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900/90 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800">
          {/* Demo Quick-Fill Pill */}
          <div className="mb-6 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between text-xs">
            <div className="text-teal-300">
              <span className="font-semibold text-teal-200">Demo-Only Presentation Account</span>
              <p className="text-[11px] text-teal-400/80">Pre-fill demo-only admin credentials (not a real user account)</p>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition-colors flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Admin Demo</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Staff Username
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Access Security Key
                </label>
                <span className="text-[11px] text-slate-400">Demo only (not real account): Admin@1234</span>
              </div>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="teal"
              className="w-full py-2.5"
              loading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Authenticate & Unlock Analytics
            </Button>
          </form>

          {/* Architectural Notice */}
          <div className="mt-6 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-300">Demo-Only Credentials Notice:</strong> Browser-side credentials
              simulate role access for presentation and UI walkthroughs only. These are strictly demo-only credentials and not real user accounts.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
              ← Return to Welcome Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
