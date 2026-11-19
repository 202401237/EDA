import React from 'react';
import { cn } from '../../lib/utils';

interface EdaSectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  dimensionNumber?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function EdaSectionHeader({
  title,
  subtitle,
  badge,
  dimensionNumber,
  actions,
  className,
}: EdaSectionHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6', className)}>
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {dimensionNumber && (
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {dimensionNumber}
            </span>
          )}
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{title}</h1>
          {badge && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono bg-slate-800 text-teal-400 border border-teal-500/20 font-semibold">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">{subtitle}</p>}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
