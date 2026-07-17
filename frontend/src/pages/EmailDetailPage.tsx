import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Archive,
  Trash2,
  Reply,
  Tag,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { gmailApi, aiApi } from '@/api';
import type { EmailDetail } from '@/types';
import toast from 'react-hot-toast';

export default function EmailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchEmail(parseInt(id));
  }, [id]);

  const fetchEmail = async (emailId: number) => {
    try {
      setLoading(true);
      const { data } = await gmailApi.getEmail(emailId);
      setEmail(data);
    } catch {
      toast.error('Failed to load email');
      navigate('/emails');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!email) return;
    setSummarizing(true);
    try {
      const { data } = await aiApi.ask(
        `Summarize this email from ${email.sender} with subject "${email.subject}"`
      );
      setSummary(data.answer);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        toast.error('Rate limited — please wait a moment and retry');
      } else if (status === 503) {
        toast.error('AI model is busy — try again in a few seconds');
      } else {
        toast.error('Failed to generate summary');
      }
    } finally {
      setSummarizing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="skeleton h-6 w-96" />
          <div className="skeleton h-4 w-64" />
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-px w-full mt-4" />
          <div className="space-y-2 mt-4">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!email) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const timestamp = parseInt(dateStr);
    if (isNaN(timestamp)) return dateStr;
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-4"
    >
      {/* Back button + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/emails')}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Emails
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSummarize}
            disabled={summarizing}
            className="flex items-center gap-2 h-9 px-3 rounded-lg bg-primary/10 text-sm font-medium text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
          >
            {summarizing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            AI Summary
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:bg-surface-hover hover:text-text transition-all">
            <Reply className="h-4 w-4" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:bg-surface-hover hover:text-text transition-all">
            <Archive className="h-4 w-4" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:bg-surface-hover hover:text-danger transition-all">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* AI Summary */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-primary">AI Summary</p>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {summary}
          </p>
        </motion.div>
      )}

      {/* Email Content */}
      <div className="rounded-xl border border-border bg-surface">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-lg font-semibold text-text mb-4">
            {email.subject || '(No subject)'}
          </h1>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {(email.sender || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text">
                {email.sender || 'Unknown'}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                To: {email.recipients || 'Unknown'}
              </p>
              {email.cc && (
                <p className="text-xs text-text-muted">Cc: {email.cc}</p>
              )}
            </div>
            <p className="text-xs text-text-muted shrink-0">
              {formatDate(email.internal_date)}
            </p>
          </div>

          {/* Labels */}
          {email.labels && (
            <div className="flex items-center gap-2 mt-3">
              <Tag className="h-3 w-3 text-text-muted" />
              <div className="flex gap-1 flex-wrap">
                {email.labels.split(',').map((label) => (
                  <span
                    key={label}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-surface-hover text-text-muted font-medium"
                  >
                    {label.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {email.body_html ? (
            <div
              className="prose-chat text-sm text-text-secondary max-w-none"
              dangerouslySetInnerHTML={{ __html: email.body_html }}
            />
          ) : (
            <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
              {email.body_text || 'No content available'}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
