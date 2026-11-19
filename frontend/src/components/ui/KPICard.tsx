import React from 'react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KPICardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  note?: string;
  icon?: React.ReactNode;
  accentColor?: 'blue' | 'teal' | 'amber' | 'rose' | 'emerald';
  className?: string;
}

export function KPICard({
  label,
  value,
  change,
  positive,
  note,
  icon,
  accentColor = 'blue',
  className,
}: KPICardProps) {
  const iconBg = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300', className)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && (
          <div className={cn('w-9 h-9 rounded-lg border flex items-center justify-center shrink-0', iconBg[accentColor])}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {change && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
              positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            )}
          >
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>

      {note && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{note}</span>
        </div>
      )}
    </div>
  );
}
