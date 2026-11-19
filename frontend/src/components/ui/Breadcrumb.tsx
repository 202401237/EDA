import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  crumbs: Crumb[];
}

export function Breadcrumb({ crumbs }: Props) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-5 flex-wrap">
      <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((crumb, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {crumb.to ? (
            <Link to={crumb.to} className="hover:text-blue-600 transition-colors font-medium">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-semibold">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
