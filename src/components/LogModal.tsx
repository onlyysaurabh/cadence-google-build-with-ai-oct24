import { useState, useEffect, useRef } from 'react';
import type { Hobby, SessionDuration, SessionLog } from '../types.ts';
import { formatLocalDate } from '../utils.ts';
import { X, Check } from 'lucide-react';

interface LogModalProps {
  hobby: Hobby;
  onClose: () => void;
  onSave: (updatedHobby: Hobby) => void;
}

const DURATIONS: SessionDuration[] = [15, 30, 45, 60];

// ponytail: native modal state and standard backdrop; avoid radix/headless dependencies.
export function LogModal({ hobby, onClose, onSave }: LogModalProps) {
  const [duration, setDuration] = useState<SessionDuration>(30);
  const [note, setNote] = useState('');
  const [updateBookmark, setUpdateBookmark] = useState(true);
  const [bookmarkText, setBookmarkText] = useState(hobby.nextStepBookmark);

  const modalRef = useRef<HTMLDivElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    noteInputRef.current?.focus();
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

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newLog: SessionLog = {
      id: `log-${Date.now()}`,
      date: formatLocalDate(new Date()),
      durationMinutes: duration,
      note: note.trim(),
      timestamp: Date.now(),
    };

    const updatedHobby: Hobby = {
      ...hobby,
      nextStepBookmark: updateBookmark && bookmarkText.trim() ? bookmarkText.trim() : hobby.nextStepBookmark,
      logs: [newLog, ...hobby.logs],
    };

    onSave(updatedHobby);
    onClose();
  };

  const recentLogs = [...hobby.logs]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 2);

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
        aria-labelledby="log-modal-title"
        className="w-full max-w-[480px] bg-white rounded-xl border border-border p-6 shadow-2xl relative transition-all"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-normal">
              Log Activity
            </span>
            <h2
              id="log-modal-title"
              className="font-display font-bold text-[20px] text-text-primary tracking-[-0.03em] mt-0.5"
            >
              Log Session: {hobby.title}
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
        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Duration Selector */}
          <div>
            <label className="block text-[13px] text-text-primary mb-2 font-normal">
              Session Duration
            </label>
            <div className="flex items-center space-x-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`px-3.5 py-1 rounded-full text-[12px] font-mono border transition-all duration-150 cursor-pointer ${
                    duration === d
                      ? 'bg-primary text-white border-primary font-bold shadow-[0_2px_8px_rgba(99,102,241,0.25)]'
                      : 'bg-white border-border text-text-secondary hover:border-primary/50 font-normal'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          {/* Session Notes */}
          <div>
            <label htmlFor="session-note" className="block text-[13px] text-text-primary mb-1.5 font-normal">
              Session Notes
            </label>
            <textarea
              ref={noteInputRef}
              id="session-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reflect on focus quality, tempo, or challenges..."
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  handleSave();
                }
              }}
              className="w-full bg-white border border-border rounded-md py-2 px-3 text-[14px] text-text-primary font-normal focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted"
            />
            <p className="text-[11px] text-muted mt-1 font-normal">
              Press ⌘+Enter or Ctrl+Enter to save quickly.
            </p>
          </div>

          {/* Next Step Bookmark Frame */}
          <div className="p-3.5 rounded-lg bg-canvas border border-border space-y-2.5">
            <div
              role="checkbox"
              aria-checked={updateBookmark}
              tabIndex={0}
              onClick={() => setUpdateBookmark(!updateBookmark)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setUpdateBookmark(!updateBookmark);
                }
              }}
              className="flex items-center space-x-2.5 cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md p-0.5 -m-0.5"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors border ${
                  updateBookmark
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-border text-transparent group-hover:border-primary/50'
                }`}
              >
                <Check size={12} strokeWidth={2.5} />
              </div>
              <span className="text-[13px] font-normal text-text-primary group-hover:text-primary transition-colors">
                Update bookmark for next session
              </span>
            </div>

            <input
              type="text"
              disabled={!updateBookmark}
              value={bookmarkText}
              onChange={(e) => setBookmarkText(e.target.value)}
              placeholder="Where you left off..."
              className={`w-full bg-white border border-border rounded-md py-2 px-3 text-[13px] text-text-primary font-normal transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                !updateBookmark ? 'opacity-50 cursor-not-allowed bg-canvas' : ''
              }`}
            />
          </div>

          {/* Recent Logs Preview */}
          <div>
            <div className="text-[11px] font-mono uppercase text-muted tracking-wider mb-2 font-normal">
              Recent Logs
            </div>
            {recentLogs.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-white">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="px-4 py-2 flex items-center justify-between text-[13px] hover:bg-canvas transition-colors duration-100 font-normal"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span className="text-text-secondary font-normal font-mono text-[12px]">
                        {log.date}
                      </span>
                      {log.note && (
                        <span className="text-muted truncate max-w-[200px] text-[12px] font-normal">
                          — {log.note}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[12px] text-text-primary font-normal">
                      {log.durationMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-muted italic font-normal">
                No previous sessions recorded yet.
              </p>
            )}
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
              Save Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
