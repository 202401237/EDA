import { config } from '../config';
import type {
  DatasetOverviewResponse,
  DatasetSchemaResponse,
  DataQualityResponse,
  SamplingValidationResponse,
  MissingValuesResponse,
  MissingnessPatternsResponse,
  MissingnessMechanismsResponse,
  ImputationSummaryResponse,
  ImputationBenchmarkResponse,
  OutliersResponse,
  OutlierTreatmentResponse,
  UnivariateResponse,
  BivariateResponse,
  CorrelationResponse,
  MultivariateResponse,
  VIFResponse,
  TemporalResponse,
  HypothesisTestingResponse,
  TargetAnalysisResponse,
  FeatureEngineeringResponse,
  ModelDiagnosticsResponse,
  InsightsResponse,
  CoverageResponse,
  VisualizationsCatalogResponse,
} from '../types/eda';

const API_BASE = config.apiBaseUrl.replace(/\/+$/, '');

// In-memory request cache for idempotent GET requests
const requestCache = new Map<string, Promise<any>>();

async function fetchEda<T>(endpoint: string, bypassCache = false): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  if (!bypassCache && requestCache.has(url)) {
    return requestCache.get(url) as Promise<T>;
  }

  const promise = (async () => {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message =
          typeof errorData?.detail === 'string'
            ? errorData.detail
            : Array.isArray(errorData?.errors)
            ? errorData.errors.join(', ')
            : `HTTP ${res.status}: ${res.statusText}`;
        throw new Error(message);
      }

      return (await res.json()) as T;
    } catch (err: unknown) {
      // Invalidate failed cache entry so next attempt can retry
      requestCache.delete(url);
      if (err instanceof Error && err.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(
          `Unable to connect to Insurance Intelligence backend at ${API_BASE || 'http://127.0.0.1:8000'}. Verify FastAPI server is running.`
        );
      }
      throw err;
    }
  })();

  if (!bypassCache) {
    requestCache.set(url, promise);
  }

  return promise;
}

export function getVisualizationImageUrl(urlPath: string): string {
  if (!urlPath) return '';
  if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
    return urlPath;
  }
  const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  return `${API_BASE}${cleanPath}`;
}

export function clearEdaCache(): void {
  requestCache.clear();
}

// 1. Overview
export function fetchEdaOverview(bypassCache = false): Promise<DatasetOverviewResponse> {
  return fetchEda<DatasetOverviewResponse>('/api/eda/overview', bypassCache);
}

// 2. Dataset Schema
export function fetchDatasetSchema(bypassCache = false): Promise<DatasetSchemaResponse> {
  return fetchEda<DatasetSchemaResponse>('/api/eda/dataset-schema', bypassCache);
}

// 3. Data Quality
export function fetchDataQuality(bypassCache = false): Promise<DataQualityResponse> {
  return fetchEda<DataQualityResponse>('/api/eda/data-quality', bypassCache);
}

// 4. Sampling Validation
export function fetchSamplingValidation(bypassCache = false): Promise<SamplingValidationResponse> {
  return fetchEda<SamplingValidationResponse>('/api/eda/sampling-validation', bypassCache);
}

// 5. Missing Values
export function fetchMissingValues(bypassCache = false): Promise<MissingValuesResponse> {
  return fetchEda<MissingValuesResponse>('/api/eda/missing-values', bypassCache);
}

// 6. Missingness Patterns
export function fetchMissingnessPatterns(bypassCache = false): Promise<MissingnessPatternsResponse> {
  return fetchEda<MissingnessPatternsResponse>('/api/eda/missingness-patterns', bypassCache);
}

// 7. Missingness Mechanisms (MCAR/MAR/MNAR)
export function fetchMissingnessMechanisms(bypassCache = false): Promise<MissingnessMechanismsResponse> {
  return fetchEda<MissingnessMechanismsResponse>('/api/eda/missingness-mechanisms', bypassCache);
}

// 8. Imputation Summary
export function fetchImputationSummary(bypassCache = false): Promise<ImputationSummaryResponse> {
  return fetchEda<ImputationSummaryResponse>('/api/eda/imputation-summary', bypassCache);
}

// 9. Imputation Benchmark
export function fetchImputationBenchmark(column?: string, bypassCache = false): Promise<ImputationBenchmarkResponse> {
  const query = column ? `?column=${encodeURIComponent(column)}` : '';
  return fetchEda<ImputationBenchmarkResponse>(`/api/eda/imputation-benchmark${query}`, bypassCache);
}

// 10. Outliers
export function fetchOutliers(method?: string, bypassCache = false): Promise<OutliersResponse> {
  const query = method ? `?method=${encodeURIComponent(method)}` : '';
  return fetchEda<OutliersResponse>(`/api/eda/outliers${query}`, bypassCache);
}

// 11. Outlier Treatment
export function fetchOutlierTreatment(bypassCache = false): Promise<OutlierTreatmentResponse> {
  return fetchEda<OutlierTreatmentResponse>('/api/eda/outlier-treatment', bypassCache);
}

// 12. Univariate Analysis
export function fetchUnivariate(feature?: string, bypassCache = false): Promise<UnivariateResponse> {
  const query = feature ? `?feature=${encodeURIComponent(feature)}` : '';
  return fetchEda<UnivariateResponse>(`/api/eda/univariate${query}`, bypassCache);
}

// 13. Bivariate Analysis
export function fetchBivariate(feature?: string, bypassCache = false): Promise<BivariateResponse> {
  const query = feature ? `?feature=${encodeURIComponent(feature)}` : '';
  return fetchEda<BivariateResponse>(`/api/eda/bivariate${query}`, bypassCache);
}

// 14. Correlation Analysis
export function fetchCorrelation(method?: string, bypassCache = false): Promise<CorrelationResponse> {
  const query = method ? `?method=${encodeURIComponent(method)}` : '';
  return fetchEda<CorrelationResponse>(`/api/eda/correlation${query}`, bypassCache);
}

// 15. Multivariate Analysis
export function fetchMultivariate(bypassCache = false): Promise<MultivariateResponse> {
  return fetchEda<MultivariateResponse>('/api/eda/multivariate', bypassCache);
}

// 16. Multicollinearity (VIF)
export function fetchVIF(bypassCache = false): Promise<VIFResponse> {
  return fetchEda<VIFResponse>('/api/eda/vif', bypassCache);
}

// 17. Temporal Analysis
export function fetchTemporalAnalysis(bypassCache = false): Promise<TemporalResponse> {
  return fetchEda<TemporalResponse>('/api/eda/temporal', bypassCache);
}

// 18. Hypothesis Testing
export function fetchHypothesisTesting(bypassCache = false): Promise<HypothesisTestingResponse> {
  return fetchEda<HypothesisTestingResponse>('/api/eda/hypothesis-testing', bypassCache);
}

// 19. Target Analysis
export function fetchTargetAnalysis(bypassCache = false): Promise<TargetAnalysisResponse> {
  return fetchEda<TargetAnalysisResponse>('/api/eda/target-analysis', bypassCache);
}

// 20. Feature Engineering
export function fetchFeatureEngineering(bypassCache = false): Promise<FeatureEngineeringResponse> {
  return fetchEda<FeatureEngineeringResponse>('/api/eda/feature-engineering', bypassCache);
}

// 21. Model Diagnostics
export function fetchModelDiagnostics(bypassCache = false): Promise<ModelDiagnosticsResponse> {
  return fetchEda<ModelDiagnosticsResponse>('/api/eda/model-diagnostics', bypassCache);
}

// 22. Executive Insights
export function fetchInsights(bypassCache = false): Promise<InsightsResponse> {
  return fetchEda<InsightsResponse>('/api/eda/insights', bypassCache);
}

// 23. Coverage Matrix
export function fetchCoverage(bypassCache = false): Promise<CoverageResponse> {
  return fetchEda<CoverageResponse>('/api/eda/coverage', bypassCache);
}

// 24. Visualizations Catalog
export function fetchVisualizationsCatalog(bypassCache = false): Promise<VisualizationsCatalogResponse> {
  return fetchEda<VisualizationsCatalogResponse>('/api/eda/visualizations/catalog', bypassCache);
}
