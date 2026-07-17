import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  MailOpen,
  MessageSquare,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gmailApi } from '@/api';
import type { Email } from '@/types';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const { data } = await gmailApi.getEmails(20, 0);
      setEmails(data);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await gmailApi.sync(100);
      await fetchEmails();
    } finally {
      setSyncing(false);
    }
  };

  const unreadCount = emails.filter((e) => e.is_unread).length;

  const stats: StatCard[] = [
    {
      label: 'Total Emails',
      value: emails.length,
      icon: Mail,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Unread',
      value: unreadCount,
      icon: MailOpen,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'AI Conversations',
      value: '—',
      icon: MessageSquare,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Last Sync',
      value: 'Just now',
      icon: RefreshCw,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-6xl"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="rounded-xl border border-border bg-surface p-5 hover:border-border/80 transition-all cursor-default"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-text-muted">{stat.label}</p>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bgColor}`}
              >
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-text">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/chat')}
          className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-5 hover:border-primary/30 hover:bg-surface-hover transition-all"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-text">Ask AI Assistant</p>
            <p className="text-xs text-text-muted mt-0.5">
              Search emails, draft replies, and more
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-5 hover:border-accent/30 hover:bg-surface-hover transition-all disabled:opacity-50"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
            <RefreshCw
              className={`h-5 w-5 text-accent ${syncing ? 'animate-spin' : ''}`}
            />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-text">
              {syncing ? 'Syncing...' : 'Sync Gmail'}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Pull latest emails from your inbox
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent transition-colors" />
        </button>
      </motion.div>

      {/* Recent Emails */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-border bg-surface"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Recent Emails</h2>
          <button
            onClick={() => navigate('/emails')}
            className="text-xs text-primary hover:text-primary-hover transition-colors font-medium"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-border">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4">
                  <div className="skeleton h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3.5 w-48" />
                    <div className="skeleton h-3 w-72" />
                  </div>
                </div>
              ))
            : emails.slice(0, 5).map((email) => (
                <button
                  key={email.id}
                  onClick={() => navigate(`/emails/${email.id}`)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-hover transition-colors text-left"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {(email.sender || '?').charAt(0).toUpperCase()}
                  </div>
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
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {email.subject || '(No subject)'}
                    </p>
                  </div>
                  <p className="text-xs text-text-muted shrink-0">
                    {email.internal_date
                      ? new Date(
                          parseInt(email.internal_date)
                        ).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''}
                  </p>
                </button>
              ))}
          {!loading && emails.length === 0 && (
            <div className="px-5 py-12 text-center">
              <Mail className="h-10 w-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-muted">No emails yet</p>
              <p className="text-xs text-text-muted mt-1">
                Sync your Gmail to get started
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
