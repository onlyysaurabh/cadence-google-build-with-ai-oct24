import { useState, useEffect, useRef } from 'react';
import type { Category, Hobby } from '../types.ts';
import { formatLocalDate } from '../utils.ts';
import { X } from 'lucide-react';

interface NewHobbyModalProps {
  onClose: () => void;
  onCreate: (hobby: Hobby) => void;
}

const CATEGORIES: Category[] = ['Creative', 'Tech', 'Physical', 'Learning'];
const TARGETS = [1, 2, 3, 4, 5, 6, 7];

// ponytail: native form validation with inline state; no form-library bloat.
export function NewHobbyModal({ onClose, onCreate }: NewHobbyModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Creative');
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [bookmark, setBookmark] = useState('');
  const [error, setError] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
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
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please provide a pursuit title.');
      titleInputRef.current?.focus();
      return;
    }

    const newHobby: Hobby = {
      id: `hobby-${Date.now()}`,
      title: trimmedTitle,
      category,
      weeklyTarget,
      nextStepBookmark: bookmark.trim() || 'First session pending',
      createdAt: formatLocalDate(new Date()),
      logs: [],
    };

    onCreate(newHobby);
    onClose();
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
        aria-labelledby="new-hobby-title"
        className="w-full max-w-[480px] bg-white rounded-xl border border-border p-6 shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-normal">
              Create Pursuit
            </span>
            <h2
              id="new-hobby-title"
              className="font-display font-bold text-[20px] text-text-primary tracking-[-0.03em] mt-0.5"
            >
              New Pursuit
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Pursuit Title */}
          <div>
            <label htmlFor="hobby-title" className="block text-[13px] text-text-primary mb-1.5 font-normal">
              Pursuit Title <span className="text-error">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="hobby-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Systems Programming in Rust"
              className={`w-full bg-white border rounded-md py-2 px-3 text-[14px] text-text-primary font-normal focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted ${
                error ? 'border-error' : 'border-border'
              }`}
            />
            {error && <p className="text-[12px] text-error mt-1 font-normal">{error}</p>}
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-[13px] text-text-primary mb-1.5 font-normal">
              Category
            </label>
            <div className="flex items-center flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[12px] transition-all duration-150 cursor-pointer ${
                    category === cat
                      ? 'bg-primary text-white font-bold shadow-[0_2px_8px_rgba(99,102,241,0.22)]'
                      : 'bg-[#F3F4F6] text-text-secondary hover:bg-[#E5E7EB] hover:text-text-primary font-normal'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Target Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] text-text-primary font-normal">
                Weekly Target
              </label>
              <span className="text-[12px] text-text-secondary font-mono font-normal">
                {weeklyTarget} {weeklyTarget === 1 ? 'session' : 'sessions'} / week
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {TARGETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setWeeklyTarget(t)}
                  className={`flex-1 h-8 rounded-md font-mono text-[13px] transition-all duration-150 cursor-pointer ${
                    weeklyTarget === t
                      ? 'bg-primary text-white font-bold shadow-[0_2px_8px_rgba(99,102,241,0.25)]'
                      : 'border border-border text-text-secondary hover:border-primary/50 font-normal'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Initial Next Step Bookmark */}
          <div>
            <label htmlFor="hobby-bookmark" className="block text-[13px] text-text-primary mb-1.5 font-normal">
              Initial Bookmark <span className="text-muted">(Where to begin)</span>
            </label>
            <input
              id="hobby-bookmark"
              type="text"
              value={bookmark}
              onChange={(e) => setBookmark(e.target.value)}
              placeholder="e.g. Read Chapter 1 and setup project structure"
              className="w-full bg-white border border-border rounded-md py-2 px-3 text-[14px] text-text-primary font-normal focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="h-[38px] px-3 text-[14px] text-text-secondary hover:text-text-primary font-normal transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-white rounded-md h-[38px] px-4 font-bold text-[14px] shadow-[0_4px_12px_rgba(99,102,241,0.35)] hover:bg-primary-hover hover:-translate-y-px transition-all duration-200 cursor-pointer"
            >
              Create Pursuit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
