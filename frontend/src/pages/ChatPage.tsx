import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Bot,
  User,
  AlertTriangle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { aiApi } from '@/api';
import { CONFIRMATION_KEYWORDS } from '@/constants';
import type { ChatMessage } from '@/types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function isConfirmationMessage(text: string): boolean {
  const lower = text.toLowerCase();
  return CONFIRMATION_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (text?: string) => {
    const question = text || input.trim();
    if (!question || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await aiApi.ask(question);

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        isConfirmation: isConfirmationMessage(data.answer),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      let errorContent = 'Sorry, I encountered an error. Please try again.';

      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response: { status: number; data?: { detail?: string } } }).response;
        const detail = response?.data?.detail;

        if (response?.status === 503) {
          errorContent = '⏳ The AI model is temporarily unavailable due to high demand. Please try again in a few seconds.';
          toast.error('AI model is busy — try again shortly');
        } else if (response?.status === 429) {
          errorContent = '⏳ Too many requests. Please wait a moment and try again.';
          toast.error('Rate limited — slow down');
        } else if (detail) {
          errorContent = detail;
          toast.error('AI error');
        } else {
          toast.error('Failed to get response');
        }
      } else {
        toast.error('Failed to get response');
      }

      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove the last assistant message
      setMessages((prev) => {
        const idx = prev.length - 1;
        if (prev[idx]?.role === 'assistant') {
          return prev.slice(0, idx);
        }
        return prev;
      });
      sendMessage(lastUserMsg.content);
    }
  };

  const handleConfirmAction = (approved: boolean) => {
    sendMessage(approved ? 'yes' : 'no');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-4xl mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-text mb-2">
              AI CRM Assistant
            </h2>
            <p className="text-sm text-text-muted max-w-sm">
              Ask me anything about your emails. I can search, summarize, draft
              replies, and manage your inbox.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-lg">
              {[
                'Summarize my unread emails',
                'Find emails from last week',
                'Draft a reply to the latest email',
                'Search for invoices',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    sendMessage(suggestion);
                  }}
                  className="rounded-xl border border-border bg-surface p-3 text-left text-xs text-text-secondary hover:bg-surface-hover hover:border-border/80 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={clsx(
                'flex gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={clsx(
                  'max-w-[75%] rounded-2xl px-4 py-3',
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-surface border border-border rounded-bl-md'
                )}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose-chat text-sm text-text-secondary">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}

                {/* Confirmation buttons */}
                {msg.role === 'assistant' && msg.isConfirmation && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                    <span className="text-xs text-text-muted flex-1">
                      Action requires confirmation
                    </span>
                    <button
                      onClick={() => handleConfirmAction(false)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmAction(true)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-all"
                    >
                      Approve
                    </button>
                  </div>
                )}

                {/* Action buttons for assistant messages */}
                {msg.role === 'assistant' && !msg.isConfirmation && (
                  <div className="flex items-center gap-1 mt-2 -mb-1">
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-background/50 transition-all"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 mt-0.5">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-text-muted animate-bounce [animation-delay:0ms]" />
                <div className="h-2 w-2 rounded-full bg-text-muted animate-bounce [animation-delay:150ms]" />
                <div className="h-2 w-2 rounded-full bg-text-muted animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Regenerate */}
      {messages.length > 0 && !isLoading && (
        <div className="flex justify-center py-2">
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:bg-surface hover:text-text transition-all"
          >
            <RotateCcw className="h-3 w-3" />
            Regenerate response
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border px-2 py-4">
        <div className="flex items-end gap-3 rounded-xl border border-border bg-surface p-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your emails..."
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none"
            style={{ maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-text-muted text-center mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
