import { FlaskConical } from 'lucide-react';

interface Props { label?: string; }
export function DemoBadge({ label = 'DEMO RESULT — NOT A REAL ML PREDICTION' }: Props) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
      <FlaskConical className="w-4 h-4 text-amber-600 shrink-0" />
      <span className="text-xs font-semibold text-amber-800">{label}</span>
    </div>
  );
}
