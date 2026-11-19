import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Filter, CheckCircle2, Layers } from 'lucide-react';
import { fetchVisualizationsCatalog } from '../../services/edaApi';
import type { VisualizationsCatalogResponse, FigureItem } from '../../types/eda';
import { EdaSectionHeader } from '../../components/eda/EdaSectionHeader';
import { EdaCard } from '../../components/eda/EdaCard';
import { EdaMetricCard } from '../../components/eda/EdaMetricCard';
import { EdaLoading } from '../../components/eda/EdaLoading';
import { EdaError } from '../../components/eda/EdaError';
import { EdaFigureCard } from '../../components/eda/EdaFigureCard';

export function VisualizationsGalleryPage() {
  const [catalog, setCatalog] = useState<VisualizationsCatalogResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (bypass = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVisualizationsCatalog(bypass);
      setCatalog(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load visualizations catalog'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !catalog) return <EdaLoading message="Loading catalog of 23 publication-grade visualization artifacts..." />;
  if (error || !catalog) return <EdaError error={error} onRetry={() => loadData(true)} />;

  // Flatten all figures or filter by category
  const allFigures: FigureItem[] = catalog.categories.flatMap((cat) => cat.figures);
  const filteredFigures =
    selectedCategory === 'all'
      ? allFigures
      : allFigures.filter((f) => f.category.toLowerCase() === selectedCategory.toLowerCase());

  const formatTitle = (filename: string): string => {
    return filename
      .replace(/^\d+_/, '')
      .replace(/\.png$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <EdaSectionHeader
        dimensionNumber="Gallery"
        title="Publication Visualizations & Statistical Artifacts Gallery"
        subtitle="Complete catalog of all 23 verified publication figures generated across exploratory, sampling, imputation, and model diagnostic pipelines."
        badge={`${catalog.total_figures} Figures`}
      />

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <EdaMetricCard
          label="Total Figures Verified"
          value={catalog.total_figures}
          subtitle="Publication-grade visual artifacts"
          accentColor="teal"
          icon={ImageIcon}
        />
        <EdaMetricCard
          label="Analytical Categories"
          value={catalog.total_categories}
          subtitle="Spanning all analytical domains"
          accentColor="indigo"
          icon={Layers}
        />
        <EdaMetricCard
          label="Serving Endpoint"
          value="/static/visualizations"
          subtitle="Served directly by FastAPI backend"
          accentColor="emerald"
          icon={CheckCircle2}
          delta={{ value: '100% Online', isPositive: true }}
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Figures ({allFigures.length})
        </button>
        {catalog.categories.map((cat) => (
          <button
            key={cat.category}
            onClick={() => setSelectedCategory(cat.category)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors shrink-0 capitalize ${
              selectedCategory.toLowerCase() === cat.category.toLowerCase()
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.category.replace(/_/g, ' ')} ({cat.figure_count})
          </button>
        ))}
      </div>

      {/* Figures Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFigures.map((fig, idx) => (
          <EdaFigureCard
            key={idx}
            title={formatTitle(fig.filename)}
            category={fig.category.replace(/_/g, ' ')}
            urlPath={fig.url_path}
            description={`Canonical artifact: ${fig.filename} (${(fig.size_bytes / 1024).toFixed(1)} KB)`}
          />
        ))}
      </div>
    </div>
  );
}
