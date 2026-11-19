import React from 'react';
import { cn } from '../../lib/utils';
import { DemoBadge } from './DemoBadge';

interface ResultCardProps {
  title: string;
  subtitle?: string;
  isDemo?: boolean;
  demoLabel?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ResultCard({
  title,
  subtitle,
  isDemo = true,
  demoLabel,
  headerAction,
  children,
  className,
}: ResultCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-slide-up transition-all',
        className
      )}
    >
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-slate-50/50 to-white">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {headerAction}
          {isDemo && <DemoBadge label={demoLabel} />}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
