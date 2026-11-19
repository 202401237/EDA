import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CustomerRoute, AdminRoute } from './components/ProtectedRoute';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public pages
import { WelcomePage } from './pages/WelcomePage';
import { CustomerLoginPage } from './pages/auth/CustomerLoginPage';
import { CustomerSignupPage } from './pages/auth/CustomerSignupPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';

// Customer pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { PremiumPredictionPage } from './pages/customer/PremiumPredictionPage';
import { UnderInsurancePage } from './pages/customer/UnderInsurancePage';

// EDA pages & layout
import { EdaLayout } from './layouts/EdaLayout';
const EdaOverviewPage = lazy(() => import('./pages/eda/EdaOverviewPage').then(m => ({ default: m.EdaOverviewPage })));
const DatasetOverviewPage = lazy(() => import('./pages/eda/DatasetOverviewPage').then(m => ({ default: m.DatasetOverviewPage })));
const DataQualityPage = lazy(() => import('./pages/eda/DataQualityPage').then(m => ({ default: m.DataQualityPage })));
const SamplingAnalysisPage = lazy(() => import('./pages/eda/SamplingAnalysisPage').then(m => ({ default: m.SamplingAnalysisPage })));
const MissingValueAnalysisPage = lazy(() => import('./pages/eda/MissingValueAnalysisPage').then(m => ({ default: m.MissingValueAnalysisPage })));
const ImputationAnalysisPage = lazy(() => import('./pages/eda/ImputationAnalysisPage').then(m => ({ default: m.ImputationAnalysisPage })));
const OutlierAnalysisPage = lazy(() => import('./pages/eda/OutlierAnalysisPage').then(m => ({ default: m.OutlierAnalysisPage })));
const UnivariateAnalysisPage = lazy(() => import('./pages/eda/UnivariateAnalysisPage').then(m => ({ default: m.UnivariateAnalysisPage })));
const BivariateAnalysisPage = lazy(() => import('./pages/eda/BivariateAnalysisPage').then(m => ({ default: m.BivariateAnalysisPage })));
const CorrelationAnalysisPage = lazy(() => import('./pages/eda/CorrelationAnalysisPage').then(m => ({ default: m.CorrelationAnalysisPage })));
const MultivariateAnalysisPage = lazy(() => import('./pages/eda/MultivariateAnalysisPage').then(m => ({ default: m.MultivariateAnalysisPage })));
const TemporalAnalysisPage = lazy(() => import('./pages/eda/TemporalAnalysisPage').then(m => ({ default: m.TemporalAnalysisPage })));
const HypothesisTestingPage = lazy(() => import('./pages/eda/HypothesisTestingPage').then(m => ({ default: m.HypothesisTestingPage })));
const TargetAnalysisPage = lazy(() => import('./pages/eda/TargetAnalysisPage').then(m => ({ default: m.TargetAnalysisPage })));
const FeatureEngineeringPage = lazy(() => import('./pages/eda/FeatureEngineeringPage').then(m => ({ default: m.FeatureEngineeringPage })));
const ModelDiagnosticsPage = lazy(() => import('./pages/eda/ModelDiagnosticsPage').then(m => ({ default: m.ModelDiagnosticsPage })));
const EdaInsightsPage = lazy(() => import('./pages/eda/EdaInsightsPage').then(m => ({ default: m.EdaInsightsPage })));
const VisualizationsGalleryPage = lazy(() => import('./pages/eda/VisualizationsGalleryPage').then(m => ({ default: m.VisualizationsGalleryPage })));

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UnderwritingMarginPage } from './pages/admin/UnderwritingMarginPage';
import { ClaimBurstRiskPage } from './pages/admin/ClaimBurstRiskPage';
import { CustomerChurnPage } from './pages/admin/CustomerChurnPage';
import { FraudAuditPage } from './pages/admin/FraudAuditPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/customer/login" element={<CustomerLoginPage />} />
          <Route path="/customer/signup" element={<CustomerSignupPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* EDA Analytics & Data Science Lab Routes */}
          <Route path="/eda" element={<EdaLayout><Navigate to="/eda/overview" replace /></EdaLayout>} />
          <Route path="/eda/overview" element={<EdaLayout><EdaOverviewPage /></EdaLayout>} />
          <Route path="/eda/dataset" element={<EdaLayout><DatasetOverviewPage /></EdaLayout>} />
          <Route path="/eda/data-quality" element={<EdaLayout><DataQualityPage /></EdaLayout>} />
          <Route path="/eda/sampling" element={<EdaLayout><SamplingAnalysisPage /></EdaLayout>} />
          <Route path="/eda/missing-values" element={<EdaLayout><MissingValueAnalysisPage /></EdaLayout>} />
          <Route path="/eda/imputation" element={<EdaLayout><ImputationAnalysisPage /></EdaLayout>} />
          <Route path="/eda/outliers" element={<EdaLayout><OutlierAnalysisPage /></EdaLayout>} />
          <Route path="/eda/univariate" element={<EdaLayout><UnivariateAnalysisPage /></EdaLayout>} />
          <Route path="/eda/bivariate" element={<EdaLayout><BivariateAnalysisPage /></EdaLayout>} />
          <Route path="/eda/correlation" element={<EdaLayout><CorrelationAnalysisPage /></EdaLayout>} />
          <Route path="/eda/multivariate" element={<EdaLayout><MultivariateAnalysisPage /></EdaLayout>} />
          <Route path="/eda/temporal" element={<EdaLayout><TemporalAnalysisPage /></EdaLayout>} />
          <Route path="/eda/hypothesis-testing" element={<EdaLayout><HypothesisTestingPage /></EdaLayout>} />
          <Route path="/eda/target-analysis" element={<EdaLayout><TargetAnalysisPage /></EdaLayout>} />
          <Route path="/eda/feature-engineering" element={<EdaLayout><FeatureEngineeringPage /></EdaLayout>} />
          <Route path="/eda/model-diagnostics" element={<EdaLayout><ModelDiagnosticsPage /></EdaLayout>} />
          <Route path="/eda/insights" element={<EdaLayout><EdaInsightsPage /></EdaLayout>} />
          <Route path="/eda/visualizations" element={<EdaLayout><VisualizationsGalleryPage /></EdaLayout>} />

          {/* Customer Protected Routes */}
          <Route
            path="/customer"
            element={
              <CustomerRoute>
                <CustomerLayout>
                  <Navigate to="/customer/dashboard" replace />
                </CustomerLayout>
              </CustomerRoute>
            }
          />
          <Route
            path="/customer/dashboard"
            element={
              <CustomerRoute>
                <CustomerLayout>
                  <CustomerDashboard />
                </CustomerLayout>
              </CustomerRoute>
            }
          />
          <Route
            path="/customer/premium-prediction"
            element={
              <CustomerRoute>
                <CustomerLayout>
                  <PremiumPredictionPage />
                </CustomerLayout>
              </CustomerRoute>
            }
          />
          <Route
            path="/customer/under-insurance-warning"
            element={
              <CustomerRoute>
                <CustomerLayout>
                  <UnderInsurancePage />
                </CustomerLayout>
              </CustomerRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Navigate to="/admin/dashboard" replace />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/underwriting-margin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <UnderwritingMarginPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/claim-burst-risk"
            element={
              <AdminRoute>
                <AdminLayout>
                  <ClaimBurstRiskPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/customer-churn"
            element={
              <AdminRoute>
                <AdminLayout>
                  <CustomerChurnPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/fraud-audit"
            element={
              <AdminRoute>
                <AdminLayout>
                  <FraudAuditPage />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
