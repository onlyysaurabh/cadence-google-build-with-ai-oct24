import { useState, useEffect, useRef } from 'react';
import type { User } from '../types.ts';
import {
  signIn,
  signUp,
  signInDemo,
  getAllAccounts,
  switchAccount,
  getInitials,
} from '../auth.ts';
import { X, User as UserIcon, Lock, Mail, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

// ponytail: native form validation with inline state; no heavy auth SDKs.
export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accounts] = useState<User[]>(() => getAllAccounts());

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user: User;
      if (mode === 'signin') {
        user = await signIn(email, password);
      } else {
        user = await signUp(name, email, password);
      }
      onSuccess(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInDemo();
      onSuccess(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToAccount = (userId: string) => {
    try {
      const user = switchAccount(userId);
      onSuccess(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch account.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-[440px] bg-white rounded-xl border border-border p-6 shadow-2xl relative"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-normal">
              Cadence Sovereign Identity
            </span>
            <h2
              id="auth-modal-title"
              className="font-display font-bold text-[20px] text-text-primary tracking-[-0.03em] mt-0.5"
            >
              {mode === 'signin' ? 'Sign in to Cadence' : 'Create Sovereign Account'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-muted hover:text-text-primary rounded-md transition-colors cursor-pointer"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-canvas rounded-lg mt-4 border border-border">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`flex-1 py-1.5 text-[13px] rounded-md transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-text-primary font-bold shadow-xs'
                : 'text-text-secondary hover:text-text-primary font-normal'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex-1 py-1.5 text-[13px] rounded-md transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-text-primary font-bold shadow-xs'
                : 'text-text-secondary hover:text-text-primary font-normal'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Fast Demo Sign-In Action */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={loading}
            className="w-full h-[38px] rounded-md border border-border bg-canvas text-text-primary hover:bg-[#F0F0F4] hover:border-[#D3D3DB] transition-all duration-200 text-[13px] font-normal flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-brand-green" />
            <span>Continue as Alex Kim (Demo Account)</span>
          </button>
        </div>

        {/* Existing Local Accounts Quick Switch (if > 1 account) */}
        {accounts.length > 1 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2 font-normal">
              Switch to saved account:
            </p>
            <div className="space-y-1.5 max-h-24 overflow-y-auto">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSwitchToAccount(acc.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md border border-border bg-white hover:bg-canvas text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <div
                      className="w-5 h-5 rounded-full text-[10px] text-white flex items-center justify-center font-bold flex-shrink-0"
                      style={{ backgroundColor: acc.avatarColor || '#4F46E5' }}
                    >
                      {getInitials(acc.name)}
                    </div>
                    <span className="text-[12px] font-normal text-text-primary truncate">
                      {acc.name}
                    </span>
                  </div>
                  <ArrowRight size={12} className="text-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] font-mono text-muted uppercase">
            <span className="bg-white px-2">or enter credentials</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-error text-[12px] font-normal">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name" className="block text-[13px] text-text-primary mb-1 font-normal">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-muted absolute left-3 top-2.5" strokeWidth={1.5} />
                <input
                  ref={firstInputRef}
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Kim"
                  className="w-full bg-white border border-border rounded-md py-2 pl-9 pr-3 text-[14px] text-text-primary font-normal focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-[13px] text-text-primary mb-1 font-normal">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3 top-2.5" strokeWidth={1.5} />
              <input
                ref={mode === 'signin' ? firstInputRef : undefined}
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white border border-border rounded-md py-2 pl-9 pr-3 text-[14px] text-text-primary font-normal focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-[13px] text-text-primary mb-1 font-normal">
              Password {mode === 'signup' && <span className="text-muted">(min 6 characters)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3 top-2.5" strokeWidth={1.5} />
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-border rounded-md py-2 pl-9 pr-3 text-[14px] text-text-primary font-normal focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="h-[38px] px-3 text-[14px] text-text-secondary hover:text-text-primary font-normal transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white rounded-md h-[38px] px-5 font-bold text-[14px] shadow-[0_4px_12px_rgba(99,102,241,0.35)] hover:bg-primary-hover hover:-translate-y-px transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
