import React from 'react';
import { AlertCircle, RefreshCw, ServerOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { config } from '../../config';

interface EdaErrorProps {
  error: Error | string | null;
  onRetry?: () => void;
  className?: string;
}

export function EdaError({ error, onRetry, className }: EdaErrorProps) {
  const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'An unexpected error occurred.';
  const isConnectionError = errorMessage.toLowerCase().includes('connect') || errorMessage.toLowerCase().includes('fetch');

  return (
    <div
      className={cn(
        'rounded-2xl bg-rose-950/20 border border-rose-500/30 p-8 text-center flex flex-col items-center justify-center min-h-[260px]',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
        {isConnectionError ? <ServerOff className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
      </div>

      <h3 className="text-base font-bold text-white tracking-tight">
        {isConnectionError ? 'Backend Service Disconnected' : 'Failed to Load Analysis'}
      </h3>

      <p className="mt-2 text-sm text-rose-200/80 max-w-lg leading-relaxed font-mono text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800 my-3">
        {errorMessage}
      </p>

      {isConnectionError && (
        <p className="text-xs text-slate-400 mb-4">
          Target API: <code className="text-teal-400">{config.apiBaseUrl || 'http://127.0.0.1:8000'}</code>. Confirm FastAPI is running via{' '}
          <code className="text-slate-300">uvicorn app.main:app</code>.
        </p>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-slate-700 bg-slate-800 text-teal-400 hover:bg-slate-700 text-xs font-semibold gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </Button>
      )}
    </div>
  );
}
