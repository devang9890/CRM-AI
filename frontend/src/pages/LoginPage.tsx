import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, type Variants } from 'framer-motion';
import {
  ArrowRight,
  Mail,
  Bot,
  Shield,
  Search,
  FileText,
  PenTool,
  Reply,
  RefreshCw,
  Tag,
  CheckCircle2,
  MessageSquare,
  Zap,
  Lock,
  Clock,
  BarChart3,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Star,
  Play,
  UserCircle2,
  Send,
  Inbox,
} from 'lucide-react';
import { BACKEND_AUTH_URL } from '@/constants';

/* ============================================================
   DATA
   ============================================================ */

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Why AI CRM', href: '#why-choose' },
  { label: 'GitHub', href: 'https://github.com/devang9890', external: true },
];

const FEATURES = [
  { icon: Bot, title: 'AI Email Assistant', description: 'Ask questions about your emails in natural language and get intelligent answers instantly.' },
  { icon: Search, title: 'Semantic Search', description: 'Find any email by meaning, not just keywords. Our AI understands context and intent.' },
  { icon: FileText, title: 'AI Summaries', description: 'Get instant summaries of long email threads. Never miss important details again.' },
  { icon: PenTool, title: 'Draft Emails', description: 'Let AI compose professional emails with the right tone and context awareness.' },
  { icon: Reply, title: 'Reply with AI', description: 'Generate contextual replies that match your style and address every point raised.' },
  { icon: RefreshCw, title: 'Background Gmail Sync', description: 'Automatic, continuous synchronization keeps your inbox always up to date.' },
  { icon: Tag, title: 'Smart Labels', description: 'AI-powered categorization organizes your emails into meaningful groups automatically.' },
  { icon: Shield, title: 'Secure Authentication', description: 'OAuth 2.0 with encrypted token storage. Your data stays private and protected.' },
  { icon: CheckCircle2, title: 'Human Approval', description: 'AI suggests actions, but you stay in control. Approve before anything is sent.' },
  { icon: MessageSquare, title: 'Real-time AI Chat', description: 'Interactive conversations with your AI assistant about your entire email history.' },
];

const STEPS = [
  { icon: UserCircle2, title: 'Login with Google', description: 'Securely authenticate with your Google account via OAuth 2.0.' },
  { icon: RefreshCw, title: 'Sync Gmail', description: 'Your emails are securely synced and indexed for AI processing.' },
  { icon: Sparkles, title: 'AI Understands Emails', description: 'Advanced AI reads, categorizes, and creates semantic embeddings.' },
  { icon: MessageSquare, title: 'Ask Anything', description: 'Chat with AI to search, summarize, draft, and manage your inbox.' },
  { icon: Clock, title: 'Save Hours Every Week', description: 'Reclaim your time with automated email intelligence at your fingertips.' },
];

const WHY_CARDS = [
  { icon: Zap, title: 'Save Time', description: 'Reduce email management from hours to minutes with AI automation that handles the heavy lifting.', gradient: 'from-blue-50 to-indigo-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { icon: Bot, title: 'AI Powered', description: 'Powered by Google Gemini and LangGraph — the most advanced AI models for natural language understanding.', gradient: 'from-violet-50 to-purple-50', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
  { icon: Lock, title: 'Secure & Private', description: 'Enterprise-grade OAuth 2.0, encrypted storage, and zero data sharing. Your emails stay yours.', gradient: 'from-emerald-50 to-teal-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Product Manager at TechCorp', quote: 'AI CRM Assistant transformed how I manage my inbox. I save at least 2 hours every day. The AI summaries alone are worth it.', avatar: 'SC' },
  { name: 'Marcus Rodriguez', role: 'Startup Founder', quote: 'The semantic search is incredible — I can find any email from months ago just by describing what I remember about it.', avatar: 'MR' },
  { name: 'Emily Watson', role: 'Senior Developer', quote: 'Finally, an email tool that actually understands context. The draft suggestions are eerily accurate and save me so much time.', avatar: 'EW' },
];

const STATS = [
  { value: 10000, suffix: '+', label: 'Emails Processed' },
  { value: 95, suffix: '%', label: 'Time Saved' },
  { value: 100, suffix: '%', label: 'Secure OAuth' },
  { value: 0, suffix: '', label: 'AI Powered', isText: true },
];

const TRUSTED_LOGOS = [
  {
    name: 'Google', svg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    )
  },
  {
    name: 'Gmail', svg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335" />
      </svg>
    )
  },
  {
    name: 'React', svg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#61DAFB">
        <path d="M14.23 12.004a2.236 2.236 0 01-2.235 2.236 2.236 2.236 0 01-2.236-2.236 2.236 2.236 0 012.235-2.236 2.236 2.236 0 012.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.31 0-.592.06-.846.18-1.065.51-1.555 2.129-.992 4.413C2.56 7.386 1 9.51 1 12.004c0 2.486 1.56 4.604 4.28 6.064-.564 2.28-.074 3.896.992 4.407.254.12.536.18.845.18 1.346 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.604 4.887 2.604.31 0 .592-.06.846-.18 1.065-.51 1.555-2.13.992-4.415C20.44 16.594 22 14.484 22 12.004c0-2.49-1.56-4.612-4.28-6.073.564-2.283.074-3.9-.992-4.41a1.863 1.863 0 00-.846-.18zm-.756 1.48c.676 0 1.168.092 1.423.22.4.2.6.84.36 2.14l-.16.66c-.92-.33-1.93-.58-3.01-.74-.63-.89-1.29-1.69-1.96-2.37 1.42-1.32 2.68-1.91 3.35-1.91zm-8.244 0c.67 0 1.93.59 3.35 1.9-.67.69-1.33 1.49-1.96 2.38-1.08.17-2.09.41-3.01.75l-.16-.67c-.24-1.29-.04-1.93.36-2.13.255-.13.747-.22 1.423-.22zM12 8.1c.5.53.99 1.12 1.46 1.76-.48-.03-.97-.05-1.46-.05s-.98.02-1.46.05c.47-.64.96-1.23 1.46-1.76zM5.68 8.4c.44.15.91.33 1.39.53-.29.61-.55 1.24-.78 1.89-.49-.12-.94-.27-1.35-.44.21-.72.45-1.37.74-1.98zm12.64 0c.29.61.53 1.26.73 1.98-.41.17-.86.32-1.35.44-.23-.65-.49-1.28-.78-1.89.49-.2.95-.38 1.4-.53zM7.89 11c.18-.57.38-1.12.62-1.64.54.08 1.1.14 1.69.17-.38.56-.73 1.15-1.04 1.76-.46-.06-.88-.15-1.27-.29zm8.22 0c-.39.14-.81.23-1.27.29-.31-.61-.66-1.2-1.04-1.76.59-.03 1.15-.09 1.69-.17.24.52.44 1.07.62 1.64zM12 9.63c.65 0 1.29.04 1.9.11-.43.72-.83 1.48-1.18 2.28-.36-.8-.75-1.56-1.18-2.28.61-.07 1.23-.11 1.9-.11h-.44zm-4.68 2.37c.28-.01.56-.01.84-.01h.07c-.32.63-.6 1.29-.85 1.97a17.6 17.6 0 01-.06-1.96zm9.36 0c.04.65.02 1.31-.06 1.96-.25-.68-.53-1.34-.85-1.97h.07c.28 0 .56 0 .84.01zM12 10.6c.43 0 .85.01 1.27.04-.38.82-.72 1.68-1 2.59-.3-.91-.64-1.77-1.02-2.59.24-.03.5-.04.75-.04zm-4.01 2.83c.32.63.67 1.24 1.04 1.8-.59.03-1.15.09-1.69.17a14.6 14.6 0 01-.62-1.64c.39-.14.82-.23 1.27-.33zm8.02 0c.45.1.88.19 1.27.33-.18.57-.38 1.12-.62 1.64-.54-.08-1.1-.14-1.69-.17.37-.56.73-1.17 1.04-1.8zM12 13.37c.37.84.75 1.63 1.18 2.36-.63.07-1.27.11-1.92.11-.65 0-1.27-.04-1.88-.11.43-.73.81-1.52 1.18-2.36.14.33.28.65.44.97h.01c.15-.32.29-.64.43-.97h.56zm-5.15 1.5c.41-.17.86-.32 1.35-.44.23.65.49 1.28.78 1.89-.48.2-.95.38-1.39.53-.29-.61-.53-1.26-.74-1.98zm10.3 0c-.21.72-.45 1.37-.73 1.98-.44-.15-.91-.33-1.4-.53.29-.61.55-1.24.78-1.89.49.12.94.27 1.35.44zM12 15.9c-.5-.53-.99-1.12-1.46-1.76.48.03.97.05 1.46.05s.98-.02 1.46-.05c-.47.64-.96 1.23-1.46 1.76zm-4.34.84c.63.89 1.29 1.69 1.96 2.37-1.42 1.32-2.68 1.91-3.35 1.91-.676 0-1.168-.092-1.423-.22-.4-.2-.6-.84-.36-2.14l.16-.66c.92.33 1.93.58 3.01.74zm8.68 0c1.08-.17 2.09-.41 3.01-.75l.16.67c.24 1.29.04 1.93-.36 2.13-.255.13-.747.22-1.423.22-.67 0-1.93-.59-3.35-1.9.67-.69 1.33-1.49 1.96-2.38z" />
      </svg>
    )
  },
  {
    name: 'FastAPI', svg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#009688">
        <path d="M12 0C5.375 0 0 5.375 0 12c0 6.627 5.375 12 12 12 6.626 0 12-5.373 12-12 0-6.625-5.373-12-12-12zm-.624 21.62v-7.528H7.19L13.203 2.38v7.528h4.029L11.376 21.62z" />
      </svg>
    )
  },
  {
    name: 'PostgreSQL', svg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#336791">
        <path d="M17.128 0a10.134 10.134 0 00-2.755.403l-.063.02A10.922 10.922 0 0012.6.258C11.422.238 10.41.524 9.594 1 8.79.721 7.122.24 5.364.336 4.14.403 2.804.775 1.814 1.82.826 2.865.305 4.482.415 6.682c.03.607.203 1.597.49 2.879s.69 2.783 1.193 4.16c.503 1.377 1.07 2.563 1.86 3.395.394.415.893.737 1.468.79a1.418 1.418 0 001.18-.413c.458-.479.624-.964.702-1.377a3.826 3.826 0 00.053-.58l.004-.149c-.013-.036-.022-.07-.034-.106-.012-.036-.02-.073-.031-.11.102.047.21.085.322.112.47.116 1.065.108 1.588-.17.12-.064.228-.141.327-.227v.042c-.006.436-.014 1.032.07 1.61.084.573.303 1.15.843 1.516.54.366 1.267.432 2.162.224a9.142 9.142 0 00.455-.12l.1-.03c.564-.17.93-.41 1.203-.632.272-.223.438-.425.561-.593a.843.843 0 00.113-.198c.01-.037.013-.072.01-.107a.383.383 0 00-.07-.199.447.447 0 00-.336-.191h-.016c-.097.003-.178.057-.266.111a2.91 2.91 0 01-.258.15c-.28.137-.577.22-.9.265-.24.031-.421.008-.554-.058a.69.69 0 01-.307-.29c-.114-.19-.173-.456-.203-.77a5.798 5.798 0 01-.018-.717l.002-.128.01-.214c.023-.39.05-.744.084-1.004.016-.12.033-.209.05-.264a.203.203 0 01.027-.064c.153-.073.287-.173.39-.3.258-.32.395-.757.46-1.216.063-.455.063-.94.024-1.32a2.84 2.84 0 00-.092-.454c.04-.13.073-.25.103-.36.266-.97.369-1.776.326-2.508a6.073 6.073 0 00-.006-.076 6.094 6.094 0 001.074-3.457c0-.33-.044-.65-.112-.957-.19-.856-.66-1.523-1.292-1.955A3.657 3.657 0 0017.128 0z" />
      </svg>
    )
  },
  {
    name: 'Gemini', svg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <defs><linearGradient id="gemini" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#4285F4" /><stop offset="100%" stopColor="#34A853" /></linearGradient></defs>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="url(#gemini)" />
      </svg>
    )
  },
  {
    name: 'LangGraph', svg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#1C3C3C">
        <circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="12" cy="18" r="2.5" />
        <line x1="6" y1="8.5" x2="12" y2="15.5" stroke="#1C3C3C" strokeWidth="1.5" /><line x1="18" y1="8.5" x2="12" y2="15.5" stroke="#1C3C3C" strokeWidth="1.5" /><line x1="8.5" y1="6" x2="15.5" y2="6" stroke="#1C3C3C" strokeWidth="1.5" />
      </svg>
    )
  },
];

/* ============================================================
   ANIMATION VARIANTS
   ============================================================ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="navLogoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="navSparkleGrad" x1="30" y1="4" x2="42" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#navLogoGrad)" />
      <rect x="8" y="16" width="26" height="18" rx="3" fill="white" opacity="0.95" />
      <path d="M8 19 L21 28 L34 19" fill="none" stroke="url(#navLogoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 8 L39.5 13 L44 14.5 L39.5 16 L38 21 L36.5 16 L32 14.5 L36.5 13 Z" fill="url(#navSparkleGrad)" />
      <path d="M30 6 L30.8 8.5 L33 9.2 L30.8 10 L30 12.5 L29.2 10 L27 9.2 L29.2 8.5 Z" fill="white" opacity="0.8" />
      <circle cx="42" cy="22" r="1.5" fill="white" opacity="0.6" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AnimatedCounter({ target, suffix, duration = 2000 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView || target === 0) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {target === 0 ? '' : count.toLocaleString()}{suffix}
    </span>
  );
}

function DashboardMockup() {
  return (
    <div className="mockup-container">
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="mockup-window"
        style={{ transform: 'rotateX(2deg) rotateY(-3deg)' }}
      >
        {/* Title bar */}
        <div className="mockup-titlebar">
          <div className="mockup-dot" style={{ background: '#FF5F56' }} />
          <div className="mockup-dot" style={{ background: '#FFBD2E' }} />
          <div className="mockup-dot" style={{ background: '#27C93F' }} />
          <span className="ml-3 text-xs text-gray-400 font-medium">AI CRM Assistant</span>
        </div>

        {/* Dashboard content */}
        <div className="p-4 space-y-3" style={{ background: '#09090B' }}>
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Total Emails', value: '1,247', color: '#2563EB' },
              { label: 'Unread', value: '23', color: '#38BDF8' },
              { label: 'AI Chats', value: '89', color: '#22C55E' },
              { label: 'Last Sync', value: 'Now', color: '#F59E0B' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg p-2.5" style={{ background: '#18181B', border: '1px solid #27272A' }}>
                <p className="text-[9px] mb-1" style={{ color: '#71717A' }}>{s.label}</p>
                <p className="text-sm font-bold" style={{ color: '#FAFAFA' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2.5 flex items-center gap-2" style={{ background: '#18181B', border: '1px solid #27272A' }}>
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                <Sparkles className="h-3.5 w-3.5" style={{ color: '#2563EB' }} />
              </div>
              <div>
                <p className="text-[10px] font-semibold" style={{ color: '#FAFAFA' }}>Ask AI</p>
                <p className="text-[8px]" style={{ color: '#71717A' }}>Search & draft</p>
              </div>
            </div>
            <div className="rounded-lg p-2.5 flex items-center gap-2" style={{ background: '#18181B', border: '1px solid #27272A' }}>
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56, 189, 248, 0.1)' }}>
                <RefreshCw className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
              </div>
              <div>
                <p className="text-[10px] font-semibold" style={{ color: '#FAFAFA' }}>Sync Gmail</p>
                <p className="text-[8px]" style={{ color: '#71717A' }}>Pull latest</p>
              </div>
            </div>
          </div>

          {/* Email list */}
          <div className="rounded-lg overflow-hidden" style={{ background: '#18181B', border: '1px solid #27272A' }}>
            <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid #27272A' }}>
              <p className="text-[10px] font-semibold" style={{ color: '#FAFAFA' }}>Recent Emails</p>
              <p className="text-[8px]" style={{ color: '#2563EB' }}>View All</p>
            </div>
            {[
              { from: 'John Smith', subject: 'Q3 Revenue Report - Action Required', unread: true },
              { from: 'Sarah Lee', subject: 'Design review: New landing page mockups', unread: true },
              { from: 'GitHub', subject: 'Pull request #42 merged successfully', unread: false },
              { from: 'Alex Chen', subject: 'Meeting notes from product sync', unread: false },
            ].map((email, i) => (
              <div key={i} className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: i < 3 ? '1px solid #27272A' : 'none' }}>
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-[8px] font-semibold shrink-0" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>
                  {email.from.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className={`text-[9px] truncate ${email.unread ? 'font-semibold' : ''}`} style={{ color: email.unread ? '#FAFAFA' : '#A1A1AA' }}>{email.from}</p>
                    {email.unread && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#2563EB' }} />}
                  </div>
                  <p className="text-[8px] truncate" style={{ color: '#71717A' }}>{email.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SectionHeading({ tag, title, description }: { tag: string; title: string; description: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="text-center max-w-2xl mx-auto mb-16"
    >
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: '#EFF6FF', color: '#2563EB' }}>
        <Sparkles className="h-3 w-3" />
        {tag}
      </span>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ color: '#111827' }}>
        {title}
      </h2>
      <p className="text-base sm:text-lg leading-relaxed" style={{ color: '#6B7280' }}>
        {description}
      </p>
    </motion.div>
  );
}

/* ============================================================
   MAIN LANDING PAGE
   ============================================================ */

export default function LoginPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_AUTH_URL}/api/v1/auth/google/login`;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing min-h-screen">
      {/* ===== 1. STICKY NAVBAR ===== */}
      <nav className={`landing-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5 shrink-0">
              <LogoMark className="h-8 w-8" />
              <span className="text-base font-bold tracking-tight" style={{ color: '#111827' }}>AI CRM</span>
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: '#6B7280' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.href)}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    style={{ color: '#6B7280' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
                  >
                    {link.label}
                  </button>
                )
              )}
            </div>

            {/* Sign in button */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleLogin}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)' }}
              >
                Sign In
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg cursor-pointer"
                aria-label="Toggle menu"
              >
                <span className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} style={{ background: '#111827' }} />
                <span className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} style={{ background: '#111827' }} />
                <span className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} style={{ background: '#111827' }} />
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pb-4 space-y-1"
            >
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => link.external ? window.open(link.href, '_blank') : scrollToSection(link.href)}
                  className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  style={{ color: '#6B7280' }}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white mt-2 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
              >
                Sign In with Google
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </div>
      </nav>

      {/* ===== 2. HERO SECTION ===== */}
      <section ref={heroRef} className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 overflow-hidden">
        {/* Gradient blobs */}
        <div className="hero-blob-1" style={{ top: '-200px', right: '-100px' }} />
        <div className="hero-blob-2" style={{ bottom: '-150px', left: '-100px' }} />
        <div className="hero-blob-3" style={{ top: '100px', left: '30%' }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border" style={{ background: '#F0F9FF', color: '#2563EB', borderColor: '#BFDBFE' }}>
                  <Sparkles className="h-3 w-3" />
                  AI-Powered Email Intelligence
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6" style={{ color: '#111827' }}>
                Your Gmail.{' '}
                <span className="gradient-text">Powered by AI.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg sm:text-xl leading-relaxed mb-8 max-w-lg" style={{ color: '#6B7280' }}>
                Summarize threads, search by meaning, draft replies, and manage your inbox with an AI assistant that truly understands your emails.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(37, 99, 235, 0.35)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)', boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)' }}
                >
                  <GoogleIcon />
                  Continue with Google
                  <ArrowRight className="h-4 w-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#F8FAFC' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => scrollToSection('#demo')}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 border cursor-pointer"
                  style={{ color: '#374151', borderColor: '#E5E7EB', background: '#FFFFFF' }}
                >
                  <Play className="h-4 w-4" style={{ color: '#2563EB' }} />
                  Watch Demo
                </motion.button>
              </motion.div>

              <motion.p variants={fadeUp} className="text-xs mt-4" style={{ color: '#9CA3AF' }}>
                Free forever · No credit card required · OAuth 2.0 secured
              </motion.p>
            </motion.div>

            {/* Right - Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 60, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="hidden lg:block"
            >
              <DashboardMockup />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ===== 3. TRUSTED BY ===== */}
      <section className="py-12 border-y" style={{ borderColor: '#F1F5F9', background: '#FAFBFC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#9CA3AF' }}>
              Built with industry-leading technologies
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {TRUSTED_LOGOS.map((logo) => (
                <motion.div
                  key={logo.name}
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300"
                >
                  {logo.svg}
                  <span className="text-sm font-medium" style={{ color: '#6B7280' }}>{logo.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 4. FEATURES ===== */}
      <section id="features" className="py-24 sm:py-32" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            tag="Features"
            title="Everything you need to master your inbox"
            description="Ten powerful features designed to transform how you interact with email. AI-driven, privacy-first, and built for productivity."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="landing-card p-6 group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl mb-4 transition-colors duration-300" style={{ background: '#EFF6FF' }}>
                  <feature.icon className="h-5 w-5 transition-colors duration-300" style={{ color: '#2563EB' }} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: '#111827' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 5. HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 sm:py-32" style={{ background: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            tag="How It Works"
            title="Up and running in minutes"
            description="Five simple steps from sign-in to AI-powered inbox mastery."
          />

          <div className="max-w-3xl mx-auto">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="space-y-0"
            >
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  variants={fadeUp}
                  className="relative flex gap-6 pb-12 last:pb-0"
                >
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="absolute left-[23px] top-[48px] bottom-0 w-[2px]" style={{ background: 'linear-gradient(to bottom, #BFDBFE, #C7D2FE)', opacity: 0.5 }} />
                  )}

                  {/* Step number circle */}
                  <div className="flex flex-col items-center shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex h-12 w-12 items-center justify-center rounded-full text-white text-sm font-bold shadow-lg relative z-10"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)', boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)' }}
                    >
                      {i + 1}
                    </motion.div>
                  </div>

                  {/* Step content */}
                  <div className="pt-1.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <step.icon className="h-4 w-4" style={{ color: '#2563EB' }} />
                      <h3 className="text-base font-semibold" style={{ color: '#111827' }}>{step.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 6. WHY CHOOSE AI CRM ===== */}
      <section id="why-choose" className="py-24 sm:py-32" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            tag="Why AI CRM"
            title="Built for people who value their time"
            description="Three pillars that make AI CRM Assistant the smartest choice for email management."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {WHY_CARDS.map((card) => (
              <motion.div
                key={card.title}
                variants={scaleIn}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`rounded-2xl p-8 bg-gradient-to-br ${card.gradient} border`}
                style={{ borderColor: '#E5E7EB' }}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.iconBg} mb-6`}>
                  <card.icon className={`h-7 w-7 ${card.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#111827' }}>{card.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{card.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 7. DEMO PREVIEW ===== */}
      <section id="demo" className="py-24 sm:py-32" style={{ background: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            tag="Demo"
            title="See it in action"
            description="A glimpse into your AI-powered email workspace."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Dashboard preview */}
            <motion.div variants={fadeUp} className="landing-card overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: '#E5E7EB', background: '#F8FAFC' }}>
                <BarChart3 className="h-4 w-4" style={{ color: '#2563EB' }} />
                <span className="text-xs font-semibold" style={{ color: '#111827' }}>Dashboard</span>
              </div>
              <div className="p-4 space-y-3" style={{ background: '#09090B' }}>
                <div className="grid grid-cols-3 gap-2">
                  {['1,247 Emails', '23 Unread', '89 AI Chats'].map((v) => (
                    <div key={v} className="rounded-lg p-2 text-center" style={{ background: '#18181B', border: '1px solid #27272A' }}>
                      <p className="text-[10px] font-bold" style={{ color: '#FAFAFA' }}>{v.split(' ')[0]}</p>
                      <p className="text-[8px]" style={{ color: '#71717A' }}>{v.split(' ').slice(1).join(' ')}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {['Revenue Report — John Smith', 'Design Review — Sarah Lee', 'PR #42 Merged — GitHub'].map((e, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded" style={{ background: '#18181B' }}>
                      <div className="h-5 w-5 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>{e.split(' — ')[1]?.charAt(0) || 'G'}</div>
                      <p className="text-[9px] truncate" style={{ color: '#A1A1AA' }}>{e}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* AI Chat preview */}
            <motion.div variants={fadeUp} className="landing-card overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: '#E5E7EB', background: '#F8FAFC' }}>
                <MessageSquare className="h-4 w-4" style={{ color: '#2563EB' }} />
                <span className="text-xs font-semibold" style={{ color: '#111827' }}>AI Chat</span>
              </div>
              <div className="p-4 space-y-3" style={{ background: '#09090B' }}>
                {/* User message */}
                <div className="flex justify-end">
                  <div className="rounded-xl rounded-tr-sm px-3 py-2 max-w-[80%]" style={{ background: '#2563EB' }}>
                    <p className="text-[10px]" style={{ color: '#FFFFFF' }}>Summarize all emails from John this week</p>
                  </div>
                </div>
                {/* AI response */}
                <div className="flex justify-start">
                  <div className="rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]" style={{ background: '#18181B', border: '1px solid #27272A' }}>
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="h-2.5 w-2.5" style={{ color: '#2563EB' }} />
                      <span className="text-[8px] font-semibold" style={{ color: '#2563EB' }}>AI Assistant</span>
                    </div>
                    <p className="text-[9px] leading-relaxed" style={{ color: '#FAFAFA' }}>
                      John sent 3 emails this week: <strong>Q3 Revenue Report</strong> (action required — review by Friday), a <strong>team lunch invite</strong> for next Tuesday, and a follow-up on the <strong>client proposal</strong>.
                    </p>
                  </div>
                </div>
                {/* Input bar */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#18181B', border: '1px solid #27272A' }}>
                  <p className="text-[9px] flex-1" style={{ color: '#71717A' }}>Ask about your emails...</p>
                  <Send className="h-3 w-3" style={{ color: '#2563EB' }} />
                </div>
              </div>
            </motion.div>

            {/* Email Detail preview */}
            <motion.div variants={fadeUp} className="landing-card overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: '#E5E7EB', background: '#F8FAFC' }}>
                <Mail className="h-4 w-4" style={{ color: '#2563EB' }} />
                <span className="text-xs font-semibold" style={{ color: '#111827' }}>Email Detail</span>
              </div>
              <div className="p-4 space-y-3" style={{ background: '#09090B' }}>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>J</div>
                  <div>
                    <p className="text-[10px] font-semibold" style={{ color: '#FAFAFA' }}>John Smith</p>
                    <p className="text-[8px]" style={{ color: '#71717A' }}>john@techcorp.com</p>
                  </div>
                </div>
                <p className="text-[10px] font-semibold" style={{ color: '#FAFAFA' }}>Q3 Revenue Report - Action Required</p>
                <div className="rounded-lg p-2" style={{ background: '#18181B', border: '1px solid #27272A' }}>
                  <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="h-2.5 w-2.5" style={{ color: '#22C55E' }} />
                    <span className="text-[8px] font-semibold" style={{ color: '#22C55E' }}>AI Summary</span>
                  </div>
                  <p className="text-[8px] leading-relaxed" style={{ color: '#A1A1AA' }}>
                    John requests review of Q3 numbers. Revenue up 23% YoY. Action needed: approve marketing budget increase by Friday.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-lg py-1.5 text-center text-[8px] font-semibold" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>Reply with AI</div>
                  <div className="flex-1 rounded-lg py-1.5 text-center text-[8px] font-semibold" style={{ background: '#18181B', color: '#A1A1AA', border: '1px solid #27272A' }}>Forward</div>
                </div>
              </div>
            </motion.div>

            {/* Analytics preview */}
            <motion.div variants={fadeUp} className="landing-card overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: '#E5E7EB', background: '#F8FAFC' }}>
                <BarChart3 className="h-4 w-4" style={{ color: '#2563EB' }} />
                <span className="text-xs font-semibold" style={{ color: '#111827' }}>Analytics</span>
              </div>
              <div className="p-4 space-y-3" style={{ background: '#09090B' }}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg p-2" style={{ background: '#18181B', border: '1px solid #27272A' }}>
                    <p className="text-[8px]" style={{ color: '#71717A' }}>Response Time</p>
                    <p className="text-sm font-bold" style={{ color: '#22C55E' }}>↓ 67%</p>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: '#18181B', border: '1px solid #27272A' }}>
                    <p className="text-[8px]" style={{ color: '#71717A' }}>Emails / Day</p>
                    <p className="text-sm font-bold" style={{ color: '#2563EB' }}>142</p>
                  </div>
                </div>
                {/* Mini bar chart */}
                <div className="rounded-lg p-3" style={{ background: '#18181B', border: '1px solid #27272A' }}>
                  <p className="text-[8px] mb-2" style={{ color: '#71717A' }}>Weekly Volume</p>
                  <div className="flex items-end gap-1 h-12">
                    {[40, 65, 55, 80, 70, 90, 60].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: i === 5 ? '#2563EB' : 'rgba(37, 99, 235, 0.2)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                      <span key={i} className="text-[6px] flex-1 text-center" style={{ color: '#71717A' }}>{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== 8. TESTIMONIALS ===== */}
      <section className="py-24 sm:py-32" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            tag="Testimonials"
            title="Loved by professionals"
            description="See what early users are saying about AI CRM Assistant."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="landing-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" style={{ color: '#F59E0B' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#374151' }}>
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#111827' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 9. STATISTICS ===== */}
      <section className="py-24 sm:py-32" style={{ background: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                className="text-center"
              >
                <p className="text-4xl sm:text-5xl font-extrabold mb-2 gradient-text">
                  {stat.isText ? (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="h-8 w-8" style={{ color: '#2563EB' }} />
                    </span>
                  ) : (
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  )}
                </p>
                <p className="text-sm font-medium" style={{ color: '#6B7280' }}>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 10. FINAL CTA ===== */}
      <section className="py-24 sm:py-32 cta-gradient">
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border" style={{ background: '#FFFFFF', color: '#2563EB', borderColor: '#BFDBFE' }}>
              <Sparkles className="h-3 w-3" />
              Get Started Free
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6" style={{ color: '#111827' }}>
              Ready to supercharge{' '}
              <span className="gradient-text">your Gmail?</span>
            </h2>

            <p className="text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: '#6B7280' }}>
              Join thousands of professionals who save hours every week with AI-powered email intelligence. Free forever, no credit card required.
            </p>

            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(37, 99, 235, 0.35)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleLogin}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-300 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)', boxShadow: '0 6px 24px rgba(37, 99, 235, 0.3)' }}
            >
              <GoogleIcon />
              Continue with Google
              <ArrowRight className="h-5 w-5" />
            </motion.button>

            <p className="text-xs mt-4" style={{ color: '#9CA3AF' }}>
              Secured with OAuth 2.0 · Your data stays private
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== 11. FOOTER ===== */}
      <footer className="py-12 border-t" style={{ borderColor: '#E5E7EB', background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-7 w-7" />
              <span className="text-sm font-bold" style={{ color: '#111827' }}>AI CRM Assistant</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { label: 'GitHub', href: 'https://github.com/devang9890', external: true },
                { label: 'Privacy', href: '#' },
                { label: 'Terms', href: '#' },
                { label: 'Contact', href: '#' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: '#6B7280' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Credit */}
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              Made by <span className="font-medium" style={{ color: '#6B7280' }}>Devang Singh</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
