// All values in this file are clearly labelled demo/mock data.
// They do NOT represent real company performance or actual dataset statistics.

export interface RecentAnalysis {
  id: string;
  type: string;
  customer: string;
  risk: 'Low' | 'Medium' | 'High';
  date: string;
}

export const adminKPIs = [
  { label: 'Sample Claims Analyzed', value: '2,847', change: '+12%', positive: true, note: 'Demo data' },
  { label: 'High-Risk Cases', value: '143', change: '+3%', positive: false, note: 'Demo data' },
  { label: 'Customers at Churn Risk', value: '218', change: '-5%', positive: true, note: 'Demo data' },
  { label: 'Claims Flagged for Review', value: '37', change: '+2', positive: false, note: 'Demo data' },
];

export const claimRiskDistribution = [
  { name: 'Low Risk', value: 1820, fill: '#16a34a' },
  { name: 'Medium Risk', value: 714, fill: '#d97706' },
  { name: 'High Risk', value: 313, fill: '#dc2626' },
];

export const locationRiskData = [
  { location: 'Urban', claims: 980, risk: 72 },
  { location: 'Suburban', claims: 845, risk: 48 },
  { location: 'Rural', claims: 642, risk: 31 },
];

export const churnTrendData = [
  { month: 'Mar', high: 28, medium: 65, low: 180 },
  { month: 'Apr', high: 32, medium: 71, low: 172 },
  { month: 'May', high: 25, medium: 68, low: 188 },
  { month: 'Jun', high: 38, medium: 79, low: 165 },
  { month: 'Jul', high: 41, medium: 82, low: 158 },
  { month: 'Aug', high: 35, medium: 74, low: 170 },
];

export const premiumVsRiskData = [
  { name: 'Urban-High', paid: 1420, minRequired: 1380 },
  { name: 'Urban-Med', paid: 1105, minRequired: 1050 },
  { name: 'Suburban', paid: 1102, minRequired: 1020 },
  { name: 'Rural', paid: 1087, minRequired: 980 },
  { name: 'Multi-Claim', paid: 1215, minRequired: 1290 },
];

export const fraudFlagData = [
  { name: 'Low Suspicion', value: 2648, fill: '#16a34a' },
  { name: 'Further Verification', value: 162, fill: '#d97706' },
  { name: 'Potentially Suspicious', value: 37, fill: '#dc2626' },
];

export const recentAnalyses: RecentAnalysis[] = [
  { id: 'CLM-7821', type: 'Claim Burst Risk', customer: 'Demo Customer A', risk: 'High', date: '2024-08-14' },
  { id: 'CHN-3342', type: 'Churn Alert', customer: 'Demo Customer B', risk: 'Medium', date: '2024-08-13' },
  { id: 'FRD-0918', type: 'Fraud Flag', customer: 'Demo Customer C', risk: 'High', date: '2024-08-12' },
  { id: 'UND-2241', type: 'Underwriting Margin', customer: 'Demo Customer D', risk: 'Low', date: '2024-08-12' },
  { id: 'CLM-6670', type: 'Claim Burst Risk', customer: 'Demo Customer E', risk: 'Low', date: '2024-08-11' },
];
