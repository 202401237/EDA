import React, { useEffect } from 'react';
import { X, Download, ExternalLink, ZoomIn } from 'lucide-react';
import { getVisualizationImageUrl } from '../../services/edaApi';

interface EdaFigureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  urlPath: string;
  category?: string;
  description?: string;
}

export function EdaFigureModal({
  isOpen,
  onClose,
  title,
  urlPath,
  category,
  description,
}: EdaFigureModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fullUrl = getVisualizationImageUrl(urlPath);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-[#0a0f1d] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3 min-w-0">
            {category && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase font-semibold shrink-0">
                {category}
              </span>
            )}
            <h3 className="text-sm sm:text-base font-bold text-white truncate">{title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 px-2.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Raw</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/60">
          <img
            src={fullUrl}
            alt={title}
            className="max-h-[70vh] w-auto object-contain rounded-lg border border-slate-800/80 shadow-md"
            loading="lazy"
          />
        </div>

        {/* Modal Footer */}
        {description && (
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-400 leading-relaxed font-mono">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
