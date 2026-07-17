import { useLocation } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/emails': 'Emails',
  '/chat': 'AI Chat',
  '/settings': 'Settings',
};

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();

  const title =
    Object.entries(pageTitles).find(([path]) =>
      location.pathname.startsWith(path)
    )?.[1] || 'AI CRM';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      <h1 className="text-lg font-semibold text-text">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text transition-all">
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* Avatar */}
        {user && (
          <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-border">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                {user.full_name.charAt(0)}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
