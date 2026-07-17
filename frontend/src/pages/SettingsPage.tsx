import { motion } from 'framer-motion';
import { User, Shield, Palette, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl space-y-6"
    >
      {/* Profile Section */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-text-muted" />
          Profile
        </h2>
        {user && (
          <div className="flex items-center gap-4">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-semibold text-primary">
                {user.full_name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-base font-semibold text-text">
                {user.full_name}
              </p>
              <p className="text-sm text-text-muted">{user.email}</p>
              <span
                className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  user.email_verified
                    ? 'bg-success/10 text-success'
                    : 'bg-warning/10 text-warning'
                }`}
              >
                {user.email_verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Connected Accounts */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-text-muted" />
          Connected Accounts
        </h2>
        <div className="flex items-center justify-between rounded-lg bg-background/50 p-4">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-text">Google Account</p>
              <p className="text-xs text-text-muted">
                {user?.email || 'Not connected'}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
            Connected
          </span>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
          <Palette className="h-4 w-4 text-text-muted" />
          Appearance
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-text">Dark Mode</p>
            <p className="text-xs text-text-muted">
              Currently using dark theme
            </p>
          </div>
          <div className="relative h-6 w-11 rounded-full bg-primary cursor-pointer">
            <div className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-white transition-all" />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-danger/30 bg-danger/5 p-6">
        <h2 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
          <LogOut className="h-4 w-4 text-danger" />
          Account
        </h2>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-lg bg-danger/10 border border-danger/30 px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger/20 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </motion.div>
  );
}
