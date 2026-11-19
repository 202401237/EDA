import { cn } from '../../lib/utils';

interface Props {
  risk: 'Low' | 'Medium' | 'High';
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ risk, size = 'md' }: Props) {
  const colors = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  };

  const dots = {
    Low: 'bg-emerald-500',
    Medium: 'bg-amber-500',
    High: 'bg-rose-500',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border', sizes[size], colors[risk])}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dots[risk])} />
      {risk} Risk
    </span>
  );
}
