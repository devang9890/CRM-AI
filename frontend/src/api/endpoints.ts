import api from './client';
import type { User, Email, EmailDetail, AskAIResponse } from '@/types';

// ── Auth ──────────────────────────────────────────
export const authApi = {
  getMe: () => api.get<User>('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
};

// ── Gmail ─────────────────────────────────────────
export const gmailApi = {
  getEmails: (limit = 50, offset = 0) =>
    api.get<Email[]>('/gmail/emails', { params: { limit, offset } }),

  getEmail: (id: number) =>
    api.get<EmailDetail>(`/gmail/emails/${id}`),

  sync: (maxResults = 25) =>
    api.post('/gmail/sync', null, { params: { max_results: maxResults } }),
};

// ── AI ────────────────────────────────────────────
export const aiApi = {
  ask: (question: string) =>
    api.post<AskAIResponse>('/ai/ask', { question }),
};

// ── Semantic Search ───────────────────────────────
export const searchApi = {
  search: (query: string, limit = 10) =>
    api.get('/semantic-search', { params: { query, limit } }),
};
