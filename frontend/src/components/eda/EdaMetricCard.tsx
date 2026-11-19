import React from 'react';
import { cn } from '../../lib/utils';

interface EdaMetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  delta?: {
    value: string | number;
    isPositive?: boolean;
    neutral?: boolean;
  };
  icon?: React.ElementType;
  accentColor?: 'teal' | 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  className?: string;
}

export function EdaMetricCard({
  label,
  value,
  subtitle,
  badge,
  delta,
  icon: Icon,
  accentColor = 'teal',
  className,
}: EdaMetricCardProps) {
  const accentStyles = {
    teal: {
      border: 'border-teal-500/20 hover:border-teal-500/40',
      iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      glow: 'group-hover:shadow-teal-500/10',
      text: 'text-teal-400',
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      glow: 'group-hover:shadow-blue-500/10',
      text: 'text-blue-400',
    },
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'group-hover:shadow-indigo-500/10',
      text: 'text-indigo-400',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:shadow-emerald-500/10',
      text: 'text-emerald-400',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:shadow-amber-500/10',
      text: 'text-amber-400',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'group-hover:shadow-rose-500/10',
      text: 'text-rose-400',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'group-hover:shadow-purple-500/10',
      text: 'text-purple-400',
    },
    slate: {
      border: 'border-slate-700 hover:border-slate-600',
      iconBg: 'bg-slate-800 text-slate-400 border-slate-700',
      glow: 'group-hover:shadow-slate-700/10',
      text: 'text-slate-400',
    },
  };

  const style = accentStyles[accentColor];

  return (
    <div
      className={cn(
        'group relative rounded-2xl bg-[#0f172a]/90 border p-5 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl',
        style.border,
        style.glow,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</span>
            {badge && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center shrink-0', style.iconBg)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || delta) && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
          {delta && (
            <span
              className={cn(
                'font-mono font-medium text-[11px] shrink-0 ml-auto',
                delta.neutral
                  ? 'text-slate-400'
                  : delta.isPositive
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              )}
            >
              {delta.isPositive ? '▲ ' : delta.neutral ? '• ' : '▼ '}
              {delta.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
