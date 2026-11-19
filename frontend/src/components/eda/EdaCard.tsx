import React from 'react';
import { cn } from '../../lib/utils';

interface EdaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'teal' | 'blue' | 'amber' | 'emerald' | 'rose' | 'slate' | 'purple' | 'indigo';
  icon?: React.ElementType;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function EdaCard({
  title,
  subtitle,
  badge,
  badgeVariant = 'teal',
  icon: Icon,
  actions,
  children,
  className,
  ...props
}: EdaCardProps) {
  const badgeColors = {
    teal: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div
      className={cn(
        'rounded-2xl bg-[#0e172a]/90 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-xs flex flex-col',
        className
      )}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-900/40">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                {title && <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>}
                {badge && (
                  <span
                    className={cn(
                      'text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider',
                      badgeColors[badgeVariant]
                    )}
                  >
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6 flex-1">{children}</div>
    </div>
  );
}
