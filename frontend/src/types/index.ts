export interface User {
  id: number;
  email: string;
  full_name: string;
  profile_picture: string | null;
  email_verified: boolean;
  is_active: boolean;
}

export interface Email {
  id: number;
  gmail_message_id: string;
  gmail_thread_id: string;
  subject: string | null;
  sender: string | null;
  recipients: string | null;
  snippet: string | null;
  labels: string | null;
  is_unread: boolean;
  internal_date: string | null;
}

export interface EmailDetail extends Email {
  cc: string | null;
  bcc: string | null;
  body_text: string | null;
  body_html: string | null;
  history_id: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isConfirmation?: boolean;
}

export interface AskAIRequest {
  question: string;
}

export interface AskAIResponse {
  question: string;
  answer: string;
  context: string;
}

export interface SyncResponse {
  synced: number;
  total: number;
  message: string;
}
