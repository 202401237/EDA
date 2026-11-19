import React, { useState } from 'react';
import { Eye, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { getVisualizationImageUrl } from '../../services/edaApi';
import { EdaFigureModal } from './EdaFigureModal';
import { cn } from '../../lib/utils';

interface EdaFigureCardProps {
  title: string;
  urlPath: string;
  category?: string;
  description?: string;
  className?: string;
}

export function EdaFigureCard({
  title,
  urlPath,
  category,
  description,
  className,
}: EdaFigureCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fullUrl = getVisualizationImageUrl(urlPath);

  return (
    <>
      <div
        className={cn(
          'group rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 overflow-hidden shadow-lg transition-all duration-200 flex flex-col',
          className
        )}
      >
        {/* Preview Container */}
        <div
          onClick={() => setModalOpen(true)}
          className="relative h-48 sm:h-56 bg-slate-950/70 border-b border-slate-800 flex items-center justify-center cursor-pointer overflow-hidden"
        >
          {imgError ? (
            <div className="text-center p-4 text-slate-500 flex flex-col items-center">
              <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">Figure preview offline</p>
            </div>
          ) : (
            <img
              src={fullUrl}
              alt={title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover sm:object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )}

          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg">
              <Eye className="w-3.5 h-3.5" />
              Inspect Figure
            </span>
          </div>

          {category && (
            <span className="absolute top-2.5 left-2.5 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-teal-300 border border-teal-500/30 uppercase font-semibold">
              {category}
            </span>
          )}
        </div>

        {/* Content Info */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1">{title}</h4>
            {description && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{description}</p>}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono">Publication Artifact</span>
            <button
              onClick={() => setModalOpen(true)}
              className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
            >
              Expand
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <EdaFigureModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={title}
        urlPath={urlPath}
        category={category}
        description={description}
      />
    </>
  );
}
