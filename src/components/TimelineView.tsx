import { useState, useMemo } from 'react';
import type { Category, Hobby, TimelineEntry } from '../types.ts';
import { getTimelineEntries, formatTimelineDate } from '../utils.ts';
import { Clock, BookOpen, Plus, Calendar } from 'lucide-react';

interface TimelineViewProps {
  hobbies: Hobby[];
  todayStr: string;
  onLogClick: (hobby: Hobby) => void;
}

const CATEGORIES: Category[] = ['Creative', 'Tech', 'Physical', 'Learning'];

// ponytail: direct array reduction for chronological feed; no heavy virtualizer or date-picker dependencies.
export function TimelineView({ hobbies, todayStr, onLogClick }: TimelineViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [selectedHobbyId, setSelectedHobbyId] = useState<'All' | string>('All');

  const allEntries = useMemo(() => getTimelineEntries(hobbies), [hobbies]);

  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      if (selectedCategory !== 'All' && entry.category !== selectedCategory) {
        return false;
      }
      if (selectedHobbyId !== 'All' && entry.hobbyId !== selectedHobbyId) {
        return false;
      }
      return true;
    });
  }, [allEntries, selectedCategory, selectedHobbyId]);

  // Aggregate metrics
  const totalMinutes = useMemo(() => {
    return filteredEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
  }, [filteredEntries]);

  const totalHoursDisplay = useMemo(() => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }, [totalMinutes]);

  const activeDaysCount = useMemo(() => {
    return new Set(filteredEntries.map((e) => e.date)).size;
  }, [filteredEntries]);

  // Group entries by date
  const groupedDates = useMemo(() => {
    const groups: Record<string, TimelineEntry[]> = {};
    for (const entry of filteredEntries) {
      if (!groups[entry.date]) {
        groups[entry.date] = [];
      }
      groups[entry.date].push(entry);
    }
    return Object.keys(groups).sort((a, b) => b.localeCompare(a));
  }, [filteredEntries]);

  const hobbyMap = useMemo(() => {
    const map = new Map<string, Hobby>();
    for (const h of hobbies) {
      map.set(h.id, h);
    }
    return map;
  }, [hobbies]);

  return (
    <div className="space-y-8">
      {/* 1. Filter Chips & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills & Pursuit Filter */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-full text-[12px] transition-all duration-150 cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-primary text-white font-bold shadow-[0_2px_8px_rgba(99,102,241,0.22)]'
                : 'bg-[#F3F4F6] text-text-secondary hover:bg-[#E5E7EB] hover:text-text-primary font-normal'
            }`}
          >
            All Categories ({allEntries.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[12px] transition-all duration-150 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-white font-bold shadow-[0_2px_8px_rgba(99,102,241,0.22)]'
                  : 'bg-[#F3F4F6] text-text-secondary hover:bg-[#E5E7EB] hover:text-text-primary font-normal'
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Pursuit selector */}
          <select
            aria-label="Filter by pursuit"
            value={selectedHobbyId}
            onChange={(e) => setSelectedHobbyId(e.target.value)}
            className="border border-border rounded-md px-2.5 py-1 text-[12px] bg-surface text-text-secondary hover:text-text-primary focus:border-primary font-normal cursor-pointer ml-1"
          >
            <option value="All">All Pursuits ({hobbies.length})</option>
            {hobbies.map((h) => (
              <option key={h.id} value={h.id}>
                {h.title}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center space-x-3 text-[12px] text-text-secondary font-normal">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-surface border border-border">
            <Clock className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
            <span>Time:</span>
            <span className="font-mono text-text-primary font-normal">{totalHoursDisplay}</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-surface border border-border">
            <Calendar className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
            <span>Days:</span>
            <span className="font-mono text-text-primary font-normal">{activeDaysCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Chronological Timeline Stream */}
      {groupedDates.length > 0 ? (
        <div className="relative pt-2">
          {/* Continuous vertical timeline guide line */}
          <div className="absolute top-4 bottom-4 left-[15px] w-[2px] bg-border z-0" />

          <div className="space-y-8 relative z-10">
            {groupedDates.map((dateKey) => {
              const entriesForDate = filteredEntries.filter((e) => e.date === dateKey);
              const dayMinutes = entriesForDate.reduce((sum, e) => sum + e.durationMinutes, 0);
              const isToday = dateKey === todayStr;
              const formattedHeader = formatTimelineDate(dateKey, todayStr);

              return (
                <div key={dateKey} className="relative">
                  {/* Date Cluster Header */}
                  <div className="flex items-center mb-4 pl-10">
                    <div className="flex items-center space-x-3">
                      <span className="font-display font-bold text-[18px] text-text-primary tracking-[-0.03em]">
                        {formattedHeader}
                      </span>
                      {isToday && (
                        <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                      )}
                      <span className="font-mono text-[11px] text-muted font-normal bg-[#F3F4F6] px-2 py-0.5 rounded-full border border-border">
                        {dateKey} · {entriesForDate.length} {entriesForDate.length === 1 ? 'session' : 'sessions'} ({dayMinutes}m)
                      </span>
                    </div>
                  </div>

                  {/* Sessions within this date */}
                  <div className="space-y-4">
                    {entriesForDate.map((entry) => {
                      const hobby = hobbyMap.get(entry.hobbyId);

                      return (
                        <div key={entry.id} className="relative pl-10">
                          {/* Timeline Node Bullet */}
                          <div className="absolute left-[9px] top-6 w-3.5 h-3.5 rounded-full bg-surface border-2 border-primary ring-4 ring-canvas z-10" />

                          {/* Session Card Frame */}
                          <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                            {/* Card Header Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="font-display font-bold text-[16px] text-text-primary tracking-[-0.02em]">
                                  {entry.hobbyTitle}
                                </span>
                                <span className="rounded-full border border-border bg-[#F3F4F6] text-text-secondary text-[11px] font-normal px-2.5 py-0.5">
                                  {entry.category}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className="rounded-full bg-canvas border border-border px-2.5 py-0.5 text-[12px] font-mono font-normal text-text-primary inline-flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-muted" strokeWidth={1.5} />
                                  {entry.durationMinutes}m
                                </span>
                                {hobby && (
                                  <button
                                    type="button"
                                    onClick={() => onLogClick(hobby)}
                                    className="border border-border bg-transparent hover:bg-canvas text-text-primary rounded-md px-2.5 py-1 text-[12px] font-normal inline-flex items-center gap-1 cursor-pointer transition-colors"
                                    title={`Log another session for ${entry.hobbyTitle}`}
                                  >
                                    <Plus className="w-3 h-3 text-muted" strokeWidth={2} />
                                    <span>Log Again</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Session Note Body */}
                            {entry.note ? (
                              <div className="mt-3 bg-[#FAFAFA] border border-border rounded-lg p-3 text-[14px] text-text-primary font-normal leading-relaxed">
                                {entry.note}
                              </div>
                            ) : (
                              <p className="mt-2 text-[13px] text-muted font-normal italic">
                                Deliberate practice session completed without notes.
                              </p>
                            )}

                            {/* Recessed Bookmark Context */}
                            {entry.nextStepBookmark && (
                              <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[12px] text-text-secondary font-normal">
                                <div className="flex items-center space-x-1.5 min-w-0">
                                  <BookOpen className="w-3.5 h-3.5 text-muted flex-shrink-0" strokeWidth={1.5} />
                                  <span className="font-mono text-[10px] uppercase text-muted tracking-wider flex-shrink-0">
                                    Next Step:
                                  </span>
                                  <span className="text-text-primary truncate font-normal">
                                    {entry.nextStepBookmark}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center bg-surface border border-border rounded-xl p-8">
          <p className="text-text-secondary text-sm font-normal">
            No practice sessions found for the current filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedHobbyId('All');
            }}
            className="mt-3 text-primary text-sm font-normal hover:underline cursor-pointer"
          >
            Clear filters →
          </button>
        </div>
      )}
    </div>
  );
}
