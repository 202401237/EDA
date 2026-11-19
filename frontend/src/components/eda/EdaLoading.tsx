import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EdaLoadingProps {
  message?: string;
  className?: string;
}

export function EdaLoading({ message = 'Loading statistical analytics from backend...', className }: EdaLoadingProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-[#0e172a]/80 border border-slate-800 p-12 text-center flex flex-col items-center justify-center min-h-[280px]',
        className
      )}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-teal-500/20 border-t-teal-400 animate-spin flex items-center justify-center" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-300">{message}</p>
      <p className="text-xs text-slate-500 font-mono mt-1">Fetching verified EDA results from FastAPI server</p>
    </div>
  );
}
