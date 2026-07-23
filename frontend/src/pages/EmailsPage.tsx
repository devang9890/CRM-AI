import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Search, RefreshCw, Inbox } from 'lucide-react';
import { gmailApi } from '@/api';
import type { Email } from '@/types';

export default function EmailsPage() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      if (emails.length === 0) setLoading(true);
      const { data } = await gmailApi.getEmails(50, 0);
      setEmails(data);
      if (data.length === 0 && !syncing) {
        setSyncing(true);
        await gmailApi.sync(25);
        const refreshed = await gmailApi.getEmails(50, 0);
        setEmails(refreshed.data);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await gmailApi.sync(25);
      await fetchEmails();
    } finally {
      setSyncing(false);
    }
  };

  const filtered = emails.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.subject?.toLowerCase().includes(q) ||
      e.sender?.toLowerCase().includes(q) ||
      e.snippet?.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl space-y-4"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-surface text-sm font-medium text-text-secondary hover:bg-surface-hover transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync'}
        </button>
      </div>

      {/* Email List */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-border">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 w-40" />
                  <div className="skeleton h-3 w-64" />
                  <div className="skeleton h-2.5 w-80" />
                </div>
                <div className="skeleton h-3 w-16" />
              </div>
            ))
          : filtered.map((email) => (
              <button
                key={email.id}
                onClick={() => navigate(`/emails/${email.id}`)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-hover transition-colors text-left group"
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {(email.sender || '?').charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm truncate ${
                        email.is_unread
                          ? 'font-semibold text-text'
                          : 'text-text-secondary'
                      }`}
                    >
                      {email.sender || 'Unknown'}
                    </p>
                    {email.is_unread && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p
                    className={`text-sm truncate mt-0.5 ${
                      email.is_unread
                        ? 'font-medium text-text'
                        : 'text-text-secondary'
                    }`}
                  >
                    {email.subject || '(No subject)'}
                  </p>
                  <p className="text-xs text-text-muted truncate mt-0.5">
                    {email.snippet}
                  </p>
                </div>

                {/* Date */}
                <div className="shrink-0 text-right">
                  <p className="text-xs text-text-muted">
                    {email.internal_date
                      ? new Date(
                          parseInt(email.internal_date)
                        ).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''}
                  </p>
                  {email.labels && (
                    <div className="flex gap-1 mt-1 justify-end">
                      {email.labels
                        .split(',')
                        .slice(0, 2)
                        .map((label) => (
                          <span
                            key={label}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-surface-hover text-text-muted"
                          >
                            {label.trim()}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </button>
            ))}

        {!loading && filtered.length === 0 && (
          <div className="px-5 py-16 text-center">
            <Inbox className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-text">
              {search ? 'No matching emails' : 'No emails found'}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {search
                ? 'Try a different search term'
                : 'Sync your Gmail to get started'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
