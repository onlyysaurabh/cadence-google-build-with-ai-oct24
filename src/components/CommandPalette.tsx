import { useState, useEffect, useRef } from 'react';
import type { Hobby } from '../types.ts';
import { getWeeklyLogCount } from '../utils.ts';
import { Search } from 'lucide-react';

interface CommandPaletteProps {
  onClose: () => void;
  hobbies: Hobby[];
  onSelectHobby: (hobby: Hobby) => void;
}

// ponytail: native search filtering and keyboard traversal; no cmdk dependency.
export function CommandPalette({ onClose, hobbies, onSelectHobby }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanQuery = query.trim().toLowerCase();
  const filteredHobbies = cleanQuery
    ? hobbies.filter(
        (h) =>
          h.title.toLowerCase().includes(cleanQuery) ||
          h.category.toLowerCase().includes(cleanQuery) ||
          h.nextStepBookmark.toLowerCase().includes(cleanQuery)
      )
    : hobbies;

  const activeIndex = Math.min(selectedIndex, Math.max(0, filteredHobbies.length - 1));
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
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
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredHobbies.length === 0 ? 0 : (prev + 1) % filteredHobbies.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredHobbies.length === 0 ? 0 : (prev - 1 + filteredHobbies.length) % filteredHobbies.length
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredHobbies[activeIndex]) {
          onSelectHobby(filteredHobbies[activeIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, filteredHobbies, activeIndex, onSelectHobby]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh] bg-black/40 backdrop-blur-xs transition-opacity duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command search palette"
        className="w-full max-w-[540px] bg-white rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-white">
          <Search className="w-4 h-4 text-muted mr-3 flex-shrink-0" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search hobbies, categories, or bookmarks..."
            className="w-full text-[14px] text-text-primary font-normal bg-transparent border-none outline-none placeholder:text-muted"
          />
          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
            <kbd className="px-1.5 py-0.5 rounded-[4px] bg-border text-text-secondary text-[11px] font-mono font-normal">
              Esc
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto divide-y divide-border">
          {filteredHobbies.length > 0 ? (
            filteredHobbies.map((hobby, index) => {
              const isSelected = index === activeIndex;
              const weeklyLogs = getWeeklyLogCount(hobby.logs);
              return (
                <div
                  key={hobby.id}
                  onClick={() => onSelectHobby(hobby)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors duration-100 ${
                    isSelected ? 'bg-[#F4F4F8]' : 'hover:bg-canvas'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-display font-bold text-[14px] text-text-primary truncate">
                        {hobby.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#F3F4F6] text-text-secondary border border-border font-normal flex-shrink-0">
                        {hobby.category}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted truncate mt-0.5 font-normal">
                      "{hobby.nextStepBookmark}"
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-[11px] font-mono text-muted font-normal">
                      {weeklyLogs} / {hobby.weeklyTarget} this wk
                    </span>
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-border text-[10px] font-mono text-text-secondary font-normal">
                        ↵ Log
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-text-secondary text-sm font-normal">
              No pursuits matching "{query}"
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 bg-canvas border-t border-border flex items-center justify-between text-[11px] text-muted font-mono font-normal">
          <span>Navigate with ↑ / ↓</span>
          <span>Press Enter to Log Session</span>
        </div>
      </div>
    </div>
  );
}
