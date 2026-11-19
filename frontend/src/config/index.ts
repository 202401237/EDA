/**
 * Application Configuration & Presentation Demonstration Placeholders
 * 
 * -----------------------------------------------------------------------------
 * IMPORTANT SECURITY & DEMO-ONLY LABELING NOTICE:
 * The hardcoded credentials below are STRICTLY DEMO-ONLY PLACEHOLDERS intended
 * exclusively for local prototype presentation, offline evaluation, and UI
 * walkthroughs.
 * 
 * THESE ARE NOT REAL USER ACCOUNTS AND NEVER CONNECT TO REAL IDENTITIES.
 * They must NOT be used in any production environment or live deployment.
 * -----------------------------------------------------------------------------
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  useMock: import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME || 'Insurance Intelligence',

  // DEMO-ONLY CREDENTIALS (NOT REAL USER ACCOUNTS)
  demoCustomer: {
    name: 'Arjun Sharma (Demo-Only Account)',
    email: 'arjun.sharma@demo.com',
    password: 'Demo@1234', // Demo-only password for presentation (not a real user account)
  },
  demoAdmin: {
    username: 'admin',
    password: 'Admin@1234', // Demo-only administrative password for presentation (not a real user account)
  },
} as const;
