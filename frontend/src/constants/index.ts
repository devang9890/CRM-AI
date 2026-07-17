// Relative path for Axios requests (proxied by Vite dev server)
export const API_BASE_URL = '/api/v1';

// Full backend origin for OAuth redirects (browser must hit backend directly)
export const BACKEND_AUTH_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const ROUTES = {
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  DASHBOARD: '/dashboard',
  EMAILS: '/emails',
  EMAIL_DETAIL: '/emails/:id',
  CHAT: '/chat',
  SETTINGS: '/settings',
} as const;

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  { label: 'Emails', path: ROUTES.EMAILS, icon: 'Mail' },
  { label: 'AI Chat', path: ROUTES.CHAT, icon: 'MessageSquare' },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: 'Settings' },
] as const;

export const CONFIRMATION_KEYWORDS = [
  'confirm',
  'confirmation',
  'proceed',
  'yes/no',
  'approve',
  'Do you want to proceed',
] as const;
