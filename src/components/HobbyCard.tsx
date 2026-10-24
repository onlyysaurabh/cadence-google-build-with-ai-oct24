import type { Hobby } from '../types.ts';
import { getWeeklyLogCount, getStatus } from '../utils.ts';
import { Plus } from 'lucide-react';

interface HobbyCardProps {
  hobby: Hobby;
  windowDates: string[];
  todayStr: string;
  onLogClick?: (hobby: Hobby) => void;
}

export function HobbyCard({ hobby, windowDates, todayStr, onLogClick }: HobbyCardProps) {
  const weeklyLogs = getWeeklyLogCount(hobby.logs);
  const status = getStatus(hobby.logs);
  const logMap = new Map(hobby.logs.map((log) => [log.date, log]));
  const percentGoal = Math.min(100, Math.round((weeklyLogs / hobby.weeklyTarget) * 100));

  return (
    <article className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      {/* 200px Preview Area */}
      <div className="h-[200px] bg-surface border-b border-border p-4 flex flex-col justify-between">
        {/* Top Overlays */}
        <div className="flex items-center justify-between w-full">
          <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-text-secondary border border-border text-xs font-normal">
            {hobby.category}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-normal border flex items-center gap-1.5 ${
              status.isGreen
                ? 'bg-[#EBF7EA] text-success border-[#A7F3D0]'
                : 'bg-[#FEF3C7] text-warning border-[#FDE68A]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status.isGreen ? 'bg-success' : 'bg-warning'
              }`}
            />
            {status.label}
          </span>
        </div>

        {/* 28-Day Dot Matrix */}
        <div className="my-auto py-1">
          <div className="text-[11px] font-mono text-muted mb-1.5 uppercase tracking-wider flex justify-between font-normal">
            <span>28-Day Cadence</span>
            <span>4w trail</span>
          </div>
          <div className="grid grid-cols-7 gap-2.5 justify-items-center">
            {windowDates.map((date, index) => {
              const log = logMap.get(date);
              const isToday = date === todayStr;
              const hasLog = Boolean(log);
              const readableDate = new Intl.DateTimeFormat(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }).format(new Date(`${date}T00:00:00`));

              const tooltipDetails = hasLog
                ? `${log?.durationMinutes}m${log?.note ? ` • ${log.note}` : ''}`
                : isToday
                  ? 'Today (Pending)'
                  : 'Rest';
              const tooltipAlignment = index % 7 === 0
                ? 'left-0'
                : index % 7 === 6
                  ? 'right-0'
                  : 'left-1/2 -translate-x-1/2';

              return (
                <div key={date} className="relative group/dot z-0 hover:z-20 focus-within:z-20 flex items-center justify-center p-0.5">
                  <button
                    type="button"
                    tabIndex={0}
                    aria-label={`${readableDate} • ${tooltipDetails}`}
                    className={`block w-3 h-3 rounded-full cursor-pointer transition-transform duration-150 hover:scale-125 border-0 p-0 ${
                      hasLog ? 'bg-primary' : 'bg-border'
                    } ${
                      isToday
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface'
                        : ''
                    }`}
                  />
                  <span
                    role="tooltip"
                    className={`pointer-events-none absolute top-full ${tooltipAlignment} mt-2 w-max max-w-[200px] rounded-md bg-text-primary px-2.5 py-1.5 text-[11px] leading-snug text-white shadow-lg opacity-0 invisible transition-opacity group-hover/dot:opacity-100 group-hover/dot:visible group-focus-within/dot:opacity-100 group-focus-within/dot:visible`}
                  >
                    <span className="block font-bold">{readableDate}</span>
                    <span className="block break-words">{tooltipDetails}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Preview Metric */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-text-primary font-normal flex items-center">
            <span
              className={`w-2 h-2 rounded-full mr-1.5 ${
                weeklyLogs >= hobby.weeklyTarget ? 'bg-primary' : 'bg-warning'
              }`}
            />
            {weeklyLogs} / {hobby.weeklyTarget} sessions this week
          </span>
          <span className="text-[11px] text-text-secondary font-normal">
            {percentGoal}% goal
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <h2 className="font-display font-bold text-[22px] text-text-primary leading-tight">
            {hobby.title}
          </h2>
          <p className="text-[13px] text-text-secondary mt-1 font-normal">
            Target: {hobby.weeklyTarget} {hobby.weeklyTarget === 1 ? 'session' : 'sessions'} / week
          </p>

          {/* Recessed Bookmark Box */}
          <div className="mt-4 p-3 rounded-lg bg-canvas border border-border">
            <div className="text-[10px] font-mono uppercase text-muted tracking-wider mb-1 font-normal">
              NEXT STEP BOOKMARK
            </div>
            <p className="text-[13px] text-text-primary font-normal leading-snug line-clamp-2">
              "{hobby.nextStepBookmark}"
            </p>
          </div>
        </div>

        {/* Card Footer Action */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => onLogClick?.(hobby)}
            className="w-full h-[38px] rounded-md border border-border bg-transparent text-text-primary hover:bg-[#F8F8FA] hover:border-[#D3D3DB] transition-all duration-200 hover:-translate-y-px text-[13px] font-normal flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} strokeWidth={1.5} className="text-text-secondary" />
            <span>Log Session</span>
          </button>
        </div>
      </div>
    </article>
  );
}
