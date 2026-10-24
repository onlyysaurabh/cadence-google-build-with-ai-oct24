import { useState } from 'react';
import type { ViewMode, SessionDuration, Category, Hobby } from '../types.ts';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Bookmark,
  Calendar,
  Layers,
  Terminal,
  CheckCircle2,
  Lock,
  Code2,
  Music,
  Activity,
  Languages,
  RotateCcw,
} from 'lucide-react';

interface LandingViewProps {
  onNavigate: (view: ViewMode) => void;
  onOpenAuth?: () => void;
  onOpenPalette?: () => void;
  onTransferDemoHobby?: (hobby: Hobby) => void;
}

interface SandboxState {
  pursuit: string;
  category: Category;
  duration: SessionDuration;
  note: string;
  bookmark: string;
  recorded: boolean;
  historyCount: number;
}

const PRESET_PURSUITS: { title: string; category: Category; defaultBookmark: string; defaultNote: string }[] = [
  {
    title: 'Systems Programming in Rust',
    category: 'Tech',
    defaultBookmark: 'Implement lock-free ring buffer for event loop',
    defaultNote: 'Drafted bounded MPSC channel with atomic pointers; verified memory safety.',
  },
  {
    title: 'Acoustic Fingerpicking',
    category: 'Creative',
    defaultBookmark: 'Travis picking pattern on 16-bar blues progression in E',
    defaultNote: '30 mins of metronome synchronization at 84 BPM, alternating thumb bass.',
  },
  {
    title: '5K Aerobic Base Building',
    category: 'Physical',
    defaultBookmark: 'Zone 2 aerobic run: 5.2km maintaining HR under 142 bpm',
    defaultNote: 'Completed 35-min steady cadence run at 178 spm; recovered smoothly.',
  },
  {
    title: 'Japanese Kanji & Grammar',
    category: 'Learning',
    defaultBookmark: 'Master stroke order and on-yomi for JLPT N3 section 4',
    defaultNote: 'Reviewed 25 radical compounds and practiced sentence construction.',
  },
];

export function LandingView({
  onNavigate,
  onOpenAuth,
  onOpenPalette,
  onTransferDemoHobby,
}: LandingViewProps) {
  // Hero interactive card state
  const [heroSessionLogged, setHeroSessionLogged] = useState(false);
  const [hoveredDot, setHoveredDot] = useState<string | null>(null);

  // Sandbox interactive simulator state
  const [sandbox, setSandbox] = useState<SandboxState>({
    pursuit: PRESET_PURSUITS[0].title,
    category: PRESET_PURSUITS[0].category,
    duration: 30,
    note: PRESET_PURSUITS[0].defaultNote,
    bookmark: PRESET_PURSUITS[0].defaultBookmark,
    recorded: false,
    historyCount: 3,
  });

  const handleSelectPreset = (preset: typeof PRESET_PURSUITS[number]) => {
    setSandbox((prev) => ({
      ...prev,
      pursuit: preset.title,
      category: preset.category,
      note: preset.defaultNote,
      bookmark: preset.defaultBookmark,
      recorded: false,
    }));
  };

  const handleRecordSandboxSession = () => {
    setSandbox((prev) => ({
      ...prev,
      recorded: true,
      historyCount: prev.historyCount + 1,
    }));
  };

  const handleTransferToDashboard = () => {
    if (onTransferDemoHobby) {
      const simulatedHobby: Hobby = {
        id: `hobby-${Date.now()}`,
        title: sandbox.pursuit,
        category: sandbox.category,
        weeklyTarget: 3,
        nextStepBookmark: sandbox.bookmark,
        createdAt: new Date().toISOString().split('T')[0],
        logs: [
          {
            id: `log-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            durationMinutes: sandbox.duration,
            note: sandbox.note,
            timestamp: Date.now(),
          },
        ],
      };
      onTransferDemoHobby(simulatedHobby);
    }
    window.location.hash = '#dashboard';
    onNavigate('dashboard');
  };

  return (
    <div className="space-y-24 py-4 selection:bg-primary/10 selection:text-primary">
      {/* 1. HERO SECTION */}
      <section className="relative text-center max-w-[960px] mx-auto px-4 pt-6 pb-2">
        {/* Editorial Genesis Version Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF7EA] border border-[#C5E9C0] text-brand-green text-[12px] font-mono font-normal mb-8 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          <span>GENESIS v2.4 • DELIBERATE PRACTICE • LOCAL-FIRST SOVEREIGNTY</span>
        </div>

        {/* Display Headline */}
        <h1 className="font-display font-bold text-[44px] sm:text-[60px] lg:text-[72px] text-text-primary tracking-[-0.04em] leading-[1.05] mb-6">
          Translate deliberate practice into visual momentum.
        </h1>

        {/* Lead Paragraph */}
        <p className="font-sans font-normal text-[17px] sm:text-[20px] text-text-secondary leading-relaxed max-w-[760px] mx-auto mb-10">
          The editorial multi-hobby tracker engineered for polymaths, creators, and engineers.
          Replace guilt-driven streaks with 28-day habit density matrices, resume deep work with
          instant context bookmarks, and retain 100% local data sovereignty.
        </p>

        {/* Hero Action Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#dashboard';
              onNavigate('dashboard');
            }}
            className="w-full sm:w-auto h-[44px] px-6 rounded-md bg-primary text-white font-bold text-[15px] inline-flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:bg-primary-hover hover:-translate-y-px transition-all duration-200 cursor-pointer"
          >
            <span>Launch Active Dashboard</span>
            <ArrowRight size={17} strokeWidth={2} />
          </button>

          <a
            href="#sandbox"
            className="w-full sm:w-auto h-[44px] px-6 rounded-md border border-border bg-surface text-text-primary font-normal text-[15px] inline-flex items-center justify-center gap-2 hover:border-text-primary hover:-translate-y-px transition-all duration-200 cursor-pointer"
          >
            <Sparkles size={16} strokeWidth={1.5} className="text-primary" />
            <span>Interactive Simulator</span>
          </a>
        </div>

        {/* Sovereign Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] font-mono text-muted font-normal">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} strokeWidth={1.5} className="text-brand-green" />
            100% Local-First
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock size={13} strokeWidth={1.5} className="text-text-secondary" />
            Zero Tracking Cookies
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap size={13} strokeWidth={1.5} className="text-primary" />
            Instant JSON Export
          </span>
          <button
            type="button"
            onClick={onOpenPalette}
            className="inline-flex items-center gap-1.5 hover:text-text-primary transition-colors cursor-pointer bg-transparent border-0 p-0"
          >
            <kbd className="px-1.5 py-0.5 rounded-[4px] bg-border text-text-primary text-[10px] font-mono font-normal">
              ⌘K
            </kbd>
            Command Palette
          </button>
        </div>
      </section>

      {/* 2. LIVE INTERACTIVE HERO SHOWCASE CARD */}
      <section className="max-w-[1040px] mx-auto px-4">
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative overflow-hidden transition-all duration-200 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
          {/* Top Frame Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0A0A0A] text-white flex items-center justify-center font-display font-bold text-base">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-[20px] text-text-primary tracking-[-0.03em]">
                    Systems Programming in Rust
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] text-text-secondary border border-border text-[11px] font-normal">
                    Tech
                  </span>
                </div>
                <p className="text-[13px] text-text-secondary font-normal mt-0.5">
                  Async runtimes, zero-copy parsers, and concurrent memory models
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-normal border flex items-center gap-1.5 transition-colors duration-200 ${
                  heroSessionLogged
                    ? 'bg-[#EBF7EA] text-brand-green border-[#C5E9C0]'
                    : 'bg-[#FEF3C7] text-warning border-[#FDE68A]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    heroSessionLogged ? 'bg-brand-green' : 'bg-warning'
                  }`}
                />
                {heroSessionLogged ? 'Target Achieved (3 of 3)' : 'Weekly Target: 2 of 3'}
              </span>

              <button
                type="button"
                onClick={() => setHeroSessionLogged((prev) => !prev)}
                className={`h-[34px] px-3.5 rounded-md text-[13px] font-normal inline-flex items-center gap-1.5 border transition-all duration-150 cursor-pointer ${
                  heroSessionLogged
                    ? 'bg-[#EBF7EA] text-brand-green border-[#C5E9C0]'
                    : 'bg-canvas border-border text-text-primary hover:border-primary hover:text-primary'
                }`}
              >
                {heroSessionLogged ? (
                  <>
                    <CheckCircle2 size={14} strokeWidth={2} />
                    <span>Logged Today</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={13} strokeWidth={1.5} />
                    <span>Simulate Practice (+45m)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive 28-Day Habit Matrix Demonstration */}
          <div className="py-6 border-b border-border">
            <div className="flex items-center justify-between mb-3 text-[12px] font-mono text-muted font-normal">
              <span className="uppercase tracking-wider">28-Day Practice Rhythm Matrix</span>
              <span>{heroSessionLogged ? '14 sessions / 28 days' : '13 sessions / 28 days'}</span>
            </div>

            {/* Matrix 28 Dots */}
            <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-2 p-4 bg-canvas rounded-lg border border-border justify-items-center">
              {Array.from({ length: 28 }, (_, i) => {
                const dayIndex = i + 1;
                const isToday = dayIndex === 28;
                // Pre-populated active days in 28-day window
                const activeDays = [2, 3, 5, 8, 9, 12, 15, 17, 19, 22, 23, 26];
                const isActive = activeDays.includes(dayIndex) || (isToday && heroSessionLogged);

                const tooltip = isToday
                  ? heroSessionLogged
                    ? 'Day 28 • Today: 45m session completed'
                    : 'Day 28 • Today: Pending (Click simulate above)'
                  : isActive
                    ? `Day ${dayIndex} • 45m focused practice`
                    : `Day ${dayIndex} • Scheduled rest`;

                return (
                  <div
                    key={dayIndex}
                    className="relative group/matrix flex items-center justify-center p-0.5"
                    onMouseEnter={() => setHoveredDot(tooltip)}
                    onMouseLeave={() => setHoveredDot(null)}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-primary scale-100 hover:scale-125'
                          : isToday
                            ? 'bg-border ring-2 ring-primary ring-offset-2 ring-offset-canvas'
                            : 'bg-border/60 hover:bg-border'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="h-5 mt-2 flex items-center justify-between text-[11px] font-mono text-muted font-normal px-1">
              <span>{hoveredDot ?? 'Hover any dot to inspect deliberate session metrics'}</span>
              <span>Mon — Sun Rhythms</span>
            </div>
          </div>

          {/* Recessed "Where I Left Off" Next Step Bookmark */}
          <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="p-3.5 rounded-lg bg-canvas border border-border flex items-start gap-3 flex-1 w-full">
              <Bookmark size={16} strokeWidth={1.5} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <span className="block font-mono text-[11px] text-muted uppercase tracking-wider font-normal mb-0.5">
                  Where I Left Off (Next Step Bookmark)
                </span>
                <p className="text-[13px] text-text-primary font-normal">
                  Implement lock-free bounded channel buffer in Tokio; verify backpressure telemetry.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.hash = '#dashboard';
                onNavigate('dashboard');
              }}
              className="h-[40px] px-5 rounded-md border border-border bg-surface hover:bg-[#F3F4F6] text-text-primary text-[13px] font-normal inline-flex items-center gap-2 transition-colors cursor-pointer w-full md:w-auto justify-center"
            >
              <span>Explore in Dashboard</span>
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>

      {/* 3. PHILOSOPHY: DELIBERATE PRACTICE VS GENERIC HABIT TRACKERS */}
      <section className="max-w-[1040px] mx-auto px-4">
        <div className="text-center max-w-[680px] mx-auto mb-12">
          <h2 className="font-display font-bold text-[32px] sm:text-[40px] text-text-primary tracking-[-0.035em] mb-4">
            Craft is built through intention, not mindless streaks.
          </h2>
          <p className="font-sans font-normal text-[16px] text-text-secondary leading-relaxed">
            Generic habit trackers treat learning a programming language or playing the cello like
            flossing your teeth. Cadence is built on Anders Ericsson’s deliberate practice framework.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Habit Trackers Column */}
          <div className="p-6 rounded-xl bg-surface border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-error" />
                <h3 className="font-display font-bold text-[18px] text-text-primary">
                  The Generic Habit Trap
                </h3>
              </div>
              <p className="text-[14px] text-text-secondary font-normal mb-6 leading-relaxed">
                Binary checkboxes incentivize shallow repetition just to avoid losing an arbitrary streak number.
              </p>
              <ul className="space-y-3.5 text-[14px] text-text-secondary font-normal">
                <li className="flex items-start gap-2.5">
                  <span className="text-error font-bold">✕</span>
                  <span><strong>Guilt-driven streaks</strong> that punish planned rest days and destroy momentum when interrupted.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-error font-bold">✕</span>
                  <span><strong>Zero context preservation</strong>: you start every session asking "What was I working on again?"</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-error font-bold">✕</span>
                  <span><strong>Cloud lock-in and tracking</strong>: your personal practice journal held hostage on third-party servers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-error font-bold">✕</span>
                  <span><strong>Gamification bloat</strong>: confetti animations, ads, and coins that break focus and dilute craft.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-border font-mono text-[12px] text-muted font-normal">
              Status quo: High churn, superficial engagement
            </div>
          </div>

          {/* Cadence Deliberate Practice Column */}
          <div className="p-6 rounded-xl bg-surface border-2 border-primary/40 flex flex-col justify-between relative shadow-sm">
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-mono font-normal">
                THE CADENCE WAY
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-brand-green" />
                <h3 className="font-display font-bold text-[18px] text-text-primary">
                  Cadence Deliberate Practice
                </h3>
              </div>
              <p className="text-[14px] text-text-secondary font-normal mb-6 leading-relaxed">
                Designed for mastery. Deep feedback loops, contextual bookmarks, and visual density.
              </p>
              <ul className="space-y-3.5 text-[14px] text-text-primary font-normal">
                <li className="flex items-start gap-2.5">
                  <span className="text-brand-green font-bold">✓</span>
                  <span><strong>28-Day Rhythm Matrix</strong>: captures practice frequency and depth over a sliding window without anxiety.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-brand-green font-bold">✓</span>
                  <span><strong>Where I Left Off Bookmarks</strong>: resume flow state in 0 seconds with contextual next steps.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-brand-green font-bold">✓</span>
                  <span><strong>100% Sovereign & Offline</strong>: stored in your browser; instant JSON backups with cryptographic scope.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-brand-green font-bold">✓</span>
                  <span><strong>Editorial Precision</strong>: Genesis two-weight typography and ⌘K velocity for deep, calm focus.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-border font-mono text-[12px] text-brand-green font-normal">
              Outcome: Long-term compound skill acquisition
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE FOUR PILLARS OF CADENCE */}
      <section className="max-w-[1040px] mx-auto px-4">
        <div className="text-center max-w-[680px] mx-auto mb-12">
          <h2 className="font-display font-bold text-[32px] sm:text-[40px] text-text-primary tracking-[-0.035em] mb-4">
            Engineered around the mechanics of mastery.
          </h2>
          <p className="font-sans font-normal text-[16px] text-text-secondary leading-relaxed">
            Every feature in Cadence is deliberately tuned to eliminate cognitive overhead and keep you in deep practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-200">
            <div>
              <div className="w-10 h-10 rounded-lg bg-canvas border border-border flex items-center justify-center text-primary mb-4">
                <Calendar size={18} strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-bold text-[17px] text-text-primary mb-2">
                28-Day Habit Matrix
              </h3>
              <p className="text-[13px] text-text-secondary font-normal leading-relaxed">
                A rolling four-week habit canvas that visualizes consistency without punishing planned rest days.
              </p>
            </div>
            <span className="mt-6 font-mono text-[11px] text-muted font-normal">
              FEATURE 01 / VISUAL CADENCE
            </span>
          </div>

          {/* Pillar 2 */}
          <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-200">
            <div>
              <div className="w-10 h-10 rounded-lg bg-canvas border border-border flex items-center justify-center text-primary mb-4">
                <Bookmark size={18} strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-bold text-[17px] text-text-primary mb-2">
                Contextual Bookmarks
              </h3>
              <p className="text-[13px] text-text-secondary font-normal leading-relaxed">
                "Where I left off" frames save your exact practice state, so you skip the 20-minute ramp-up penalty.
              </p>
            </div>
            <span className="mt-6 font-mono text-[11px] text-muted font-normal">
              FEATURE 02 / ZERO RAMP-UP
            </span>
          </div>

          {/* Pillar 3 */}
          <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-200">
            <div>
              <div className="w-10 h-10 rounded-lg bg-canvas border border-border flex items-center justify-center text-primary mb-4">
                <Layers size={18} strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-bold text-[17px] text-text-primary mb-2">
                Practice Timeline
              </h3>
              <p className="text-[13px] text-text-secondary font-normal leading-relaxed">
                Reverse-chronological activity stream with relative day clustering, session notes, and duration metrics.
              </p>
            </div>
            <span className="mt-6 font-mono text-[11px] text-muted font-normal">
              FEATURE 03 / EDITORIAL STREAM
            </span>
          </div>

          {/* Pillar 4 */}
          <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-200">
            <div>
              <div className="w-10 h-10 rounded-lg bg-canvas border border-border flex items-center justify-center text-primary mb-4">
                <Terminal size={18} strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-bold text-[17px] text-text-primary mb-2">
                Local-First Sovereignty
              </h3>
              <p className="text-[13px] text-text-secondary font-normal leading-relaxed">
                Zero network lag, 100% offline capability, and portable JSON export/import that guarantees ownership.
              </p>
            </div>
            <span className="mt-6 font-mono text-[11px] text-muted font-normal">
              FEATURE 04 / DATA SOVEREIGNTY
            </span>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE PRACTICE SANDBOX ("TEST DRIVE CADENCE") */}
      <section id="sandbox" className="max-w-[1040px] mx-auto px-4 scroll-mt-20">
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-text-secondary border border-border text-[11px] font-mono font-normal mb-2">
                <span>INTERACTIVE TEST DRIVE</span>
              </div>
              <h3 className="font-display font-bold text-[24px] sm:text-[28px] text-text-primary tracking-[-0.03em]">
                Experience logging deliberate practice in real time.
              </h3>
              <p className="text-[14px] text-text-secondary font-normal mt-1">
                Choose a pursuit below, configure session details, and test how Cadence updates state instantly.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono text-muted font-normal">
                Simulated Streak: {sandbox.historyCount} sessions
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
            {/* Left Controls: Select Preset & Duration */}
            <div className="lg:col-span-5 space-y-6">
              {/* Preset Selector */}
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider text-muted font-normal mb-2">
                  1. Select or Switch Pursuit
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_PURSUITS.map((p) => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`px-3 py-1.5 rounded-md text-[13px] font-normal border transition-all duration-150 cursor-pointer text-left ${
                        sandbox.pursuit === p.title
                          ? 'bg-primary text-white border-primary shadow-xs font-bold'
                          : 'bg-canvas border-border text-text-primary hover:border-primary/50'
                      }`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selector Chips */}
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider text-muted font-normal mb-2">
                  2. Select Practice Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([15, 30, 45, 60] as SessionDuration[]).map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setSandbox((prev) => ({ ...prev, duration: dur, recorded: false }))}
                      className={`h-[36px] rounded-md text-[13px] font-mono border transition-all duration-150 cursor-pointer flex items-center justify-center ${
                        sandbox.duration === dur
                          ? 'bg-text-primary text-white border-text-primary font-bold'
                          : 'bg-canvas border-border text-text-secondary hover:border-text-primary/40 font-normal'
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Step Bookmark Editor */}
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider text-muted font-normal mb-2">
                  3. Update "Where I Left Off" Bookmark
                </label>
                <input
                  type="text"
                  value={sandbox.bookmark}
                  onChange={(e) => setSandbox((prev) => ({ ...prev, bookmark: e.target.value }))}
                  className="w-full h-[40px] px-3 rounded-md bg-canvas border border-border text-[13px] text-text-primary font-normal focus:border-primary"
                  placeholder="What is your immediate next technical step?"
                />
              </div>

              {/* Notes Editor */}
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-wider text-muted font-normal mb-2">
                  4. Deliberate Session Reflection
                </label>
                <textarea
                  value={sandbox.note}
                  onChange={(e) => setSandbox((prev) => ({ ...prev, note: e.target.value }))}
                  rows={2}
                  className="w-full p-3 rounded-md bg-canvas border border-border text-[13px] text-text-primary font-normal focus:border-primary resize-none"
                  placeholder="What specifically did you practice or solve?"
                />
              </div>

              {/* Record Action */}
              <button
                type="button"
                onClick={handleRecordSandboxSession}
                className="w-full h-[42px] rounded-md bg-primary text-white font-bold text-[14px] inline-flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:bg-primary-hover hover:-translate-y-px transition-all duration-150 cursor-pointer"
              >
                <CheckCircle2 size={16} strokeWidth={2} />
                <span>Simulate Logging {sandbox.duration}m Session</span>
              </button>
            </div>

            {/* Right Result Preview Card */}
            <div className="lg:col-span-7 bg-canvas border border-border rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-white border border-border text-[11px] font-mono text-text-secondary font-normal">
                      {sandbox.category}
                    </span>
                    <span className="font-display font-bold text-[16px] text-text-primary">
                      {sandbox.pursuit}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-normal border ${
                      sandbox.recorded
                        ? 'bg-[#EBF7EA] text-brand-green border-[#C5E9C0]'
                        : 'bg-white text-muted border-border'
                    }`}
                  >
                    {sandbox.recorded ? '✓ Session Saved' : 'Live Mockup'}
                  </span>
                </div>

                {/* 28-Day Mini Grid Simulation */}
                <div className="my-6">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-2 font-normal">
                    <span>28-Day Sliding Window</span>
                    <span>{sandbox.recorded ? 'Active Today' : 'Ready to Log'}</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2 justify-items-center p-3 bg-surface rounded-lg border border-border">
                    {Array.from({ length: 28 }, (_, idx) => {
                      const isToday = idx === 27;
                      const hasSeedLog = [1, 4, 8, 12, 16, 20, 24].includes(idx);
                      const isFilled = hasSeedLog || (isToday && sandbox.recorded);

                      return (
                        <div
                          key={idx}
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            isFilled
                              ? 'bg-primary'
                              : isToday
                                ? 'bg-border ring-2 ring-primary ring-offset-2 ring-offset-surface'
                                : 'bg-border/60'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Next Step Bookmark Container */}
                <div className="p-3.5 rounded-lg bg-surface border border-border">
                  <span className="block font-mono text-[10px] text-muted uppercase tracking-wider font-normal mb-1">
                    Where I Left Off Bookmark
                  </span>
                  <p className="text-[13px] text-text-primary font-normal">
                    {sandbox.bookmark || 'No next step bookmark set.'}
                  </p>
                </div>

                {sandbox.recorded && (
                  <div className="mt-4 p-3 rounded-lg bg-[#EBF7EA] border border-[#C5E9C0] text-[13px] text-brand-green font-normal flex items-center gap-2">
                    <CheckCircle2 size={16} strokeWidth={2} />
                    <span>
                      Recorded {sandbox.duration} minutes of deliberate practice. Weekly progress updated.
                    </span>
                  </div>
                )}
              </div>

              {/* Direct Handoff to App Button */}
              <div className="pt-6 border-t border-border mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[12px] font-mono text-muted font-normal">
                  Take this pursuit directly into your live workspace:
                </span>
                <button
                  type="button"
                  onClick={handleTransferToDashboard}
                  className="w-full sm:w-auto h-[36px] px-4 rounded-md bg-text-primary text-white hover:bg-[#2A2A2A] text-[13px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Transfer to Dashboard</span>
                  <ArrowRight size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. POLYMATH PERSONA CASE STUDIES */}
      <section className="max-w-[1040px] mx-auto px-4">
        <div className="text-center max-w-[680px] mx-auto mb-12">
          <h2 className="font-display font-bold text-[32px] sm:text-[40px] text-text-primary tracking-[-0.035em] mb-4">
            Curated for multidisciplinary pursuits.
          </h2>
          <p className="font-sans font-normal text-[16px] text-text-secondary leading-relaxed">
            See how polymaths, engineers, and creatives balance heterogeneous skills with zero cognitive friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Persona 1 */}
          <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Code2 size={18} strokeWidth={1.5} className="text-primary" />
                <span className="font-mono text-[11px] text-muted font-normal uppercase">
                  Systems Architect
                </span>
              </div>
              <h3 className="font-display font-bold text-[17px] text-text-primary mb-2">
                Rust & Distributed Systems
              </h3>
              <p className="text-[13px] text-text-secondary font-normal mb-4 leading-relaxed">
                Tracks 3x weekly deep work sessions on low-level memory layout, Tokio runtimes, and raft consensus.
              </p>
              <div className="p-2.5 rounded-lg bg-canvas border border-border text-[12px] text-text-primary font-normal">
                <strong className="block font-mono text-[10px] text-muted uppercase">Bookmark</strong>
                Debug tail latency spike in Raft replication RPC.
              </div>
            </div>
            <span className="mt-5 font-mono text-[11px] text-brand-green font-normal">
              Target: 3 sessions / week
            </span>
          </div>

          {/* Persona 2 */}
          <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Music size={18} strokeWidth={1.5} className="text-primary" />
                <span className="font-mono text-[11px] text-muted font-normal uppercase">
                  Multi-Instrumentalist
                </span>
              </div>
              <h3 className="font-display font-bold text-[17px] text-text-primary mb-2">
                Jazz Improvisation & Guitar
              </h3>
              <p className="text-[13px] text-text-secondary font-normal mb-4 leading-relaxed">
                Practices ii-V-I voice leading across all 12 keys, alternating between archtop jazz and fingerstyle guitar.
              </p>
              <div className="p-2.5 rounded-lg bg-canvas border border-border text-[12px] text-text-primary font-normal">
                <strong className="block font-mono text-[10px] text-muted uppercase">Bookmark</strong>
                Work through Barry Harris 6th diminished scales on B♭.
              </div>
            </div>
            <span className="mt-5 font-mono text-[11px] text-brand-green font-normal">
              Target: 4 sessions / week
            </span>
          </div>

          {/* Persona 3 */}
          <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity size={18} strokeWidth={1.5} className="text-primary" />
                <span className="font-mono text-[11px] text-muted font-normal uppercase">
                  Endurance Athlete
                </span>
              </div>
              <h3 className="font-display font-bold text-[17px] text-text-primary mb-2">
                5K Aerobic Base & Mobility
              </h3>
              <p className="text-[13px] text-text-secondary font-normal mb-4 leading-relaxed">
                Maintains Zone 2 cardiovascular threshold without overtraining or burning out joint mobility.
              </p>
              <div className="p-2.5 rounded-lg bg-canvas border border-border text-[12px] text-text-primary font-normal">
                <strong className="block font-mono text-[10px] text-muted uppercase">Bookmark</strong>
                6.5km recovery jog under 140 bpm + hip mobility series.
              </div>
            </div>
            <span className="mt-5 font-mono text-[11px] text-brand-green font-normal">
              Target: 3 sessions / week
            </span>
          </div>

          {/* Persona 4 */}
          <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Languages size={18} strokeWidth={1.5} className="text-primary" />
                <span className="font-mono text-[11px] text-muted font-normal uppercase">
                  Polyglot
                </span>
              </div>
              <h3 className="font-display font-bold text-[17px] text-text-primary mb-2">
                Japanese Kanji & Reading
              </h3>
              <p className="text-[13px] text-text-secondary font-normal mb-4 leading-relaxed">
                Daily spaced repetition coupled with untranslated literary immersion to reach native reading comprehension.
              </p>
              <div className="p-2.5 rounded-lg bg-canvas border border-border text-[12px] text-text-primary font-normal">
                <strong className="block font-mono text-[10px] text-muted uppercase">Bookmark</strong>
                Chapter 3 of Botchan with dictionary lookups for on-yomi.
              </div>
            </div>
            <span className="mt-5 font-mono text-[11px] text-brand-green font-normal">
              Target: 2 sessions / week
            </span>
          </div>
        </div>
      </section>

      {/* 7. GENESIS ARCHITECTURE & DESIGN CRAFT */}
      <section className="max-w-[1040px] mx-auto px-4">
        <div className="p-8 sm:p-10 rounded-xl bg-surface border border-border">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
            <div>
              <span className="font-mono text-[11px] text-brand-green uppercase tracking-wider font-normal">
                GENESIS DESIGN SYSTEM SPECIFICATION
              </span>
              <h3 className="font-display font-bold text-[24px] sm:text-[28px] text-text-primary tracking-[-0.035em] mt-1">
                The typography of calm, intentional software.
              </h3>
            </div>
            <div className="font-mono text-[12px] text-muted font-normal">
              Compliant with Google Stitch standards
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
            <div>
              <span className="block font-display font-bold text-[28px] text-text-primary">2</span>
              <span className="text-[13px] text-text-secondary font-normal">
                Font weights only (400 & 700) for clean typographic rhythm
              </span>
            </div>
            <div>
              <span className="block font-display font-bold text-[28px] text-text-primary">4px</span>
              <span className="text-[13px] text-text-secondary font-normal">
                Baseline geometric grid for flawless spacing harmony
              </span>
            </div>
            <div>
              <span className="block font-display font-bold text-[28px] text-text-primary">0ms</span>
              <span className="text-[13px] text-text-secondary font-normal">
                Network latency via browser local-first persistence
              </span>
            </div>
            <div>
              <span className="block font-display font-bold text-[28px] text-text-primary">100%</span>
              <span className="text-[13px] text-text-secondary font-normal">
                Offline capable with zero tracking telemetry
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PRE-FOOTER CONVERSION CALLOUT BANNER */}
      <section className="max-w-[1040px] mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-xl bg-[#0A0A0A] text-white text-center relative overflow-hidden shadow-lg">
          <div className="max-w-[640px] mx-auto relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/20 text-[11px] font-mono font-normal mb-4">
              READY IN SECONDS
            </span>
            <h2 className="font-display font-bold text-[32px] sm:text-[42px] tracking-[-0.035em] leading-tight mb-4">
              Begin your deliberate practice today.
            </h2>
            <p className="font-sans font-normal text-[16px] text-white/70 leading-relaxed mb-8">
              No account creation required, no email verification, and no cloud dependencies.
              Start directly in your browser with sovereign local storage.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#dashboard';
                  onNavigate('dashboard');
                }}
                className="w-full sm:w-auto h-[44px] px-6 rounded-md bg-primary text-white font-bold text-[14px] inline-flex items-center justify-center gap-2 hover:bg-primary-hover hover:-translate-y-px transition-all duration-200 cursor-pointer shadow-[0_4px_16px_rgba(99,102,241,0.4)]"
              >
                <span>Open Cadence Dashboard</span>
                <ArrowRight size={16} strokeWidth={2} />
              </button>

              {onOpenAuth && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-full sm:w-auto h-[44px] px-6 rounded-md border border-white/20 bg-transparent text-white font-normal text-[14px] inline-flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/40 transition-colors cursor-pointer"
                >
                  <span>Sign In / Sovereign Identity</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 9. EDITORIAL FOOTER */}
      <footer className="pt-12 border-t border-border">
        <div className="max-w-[1040px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-md bg-[#0A0A0A] text-white flex items-center justify-center font-display font-bold text-xs tracking-tight">
              C
            </div>
            <span className="font-display font-bold text-[16px] text-text-primary tracking-[-0.03em]">
              Cadence
            </span>
            <span className="text-[12px] font-mono text-muted font-normal">
              Editorial Deliberate Practice
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-6 text-[13px] text-text-secondary font-normal">
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#landing';
                onNavigate('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-text-primary transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#dashboard';
                onNavigate('dashboard');
              }}
              className="hover:text-text-primary transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#timeline';
                onNavigate('timeline');
              }}
              className="hover:text-text-primary transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              Timeline
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#account';
                onNavigate('account');
              }}
              className="hover:text-text-primary transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              Account
            </button>
            <button
              type="button"
              onClick={onOpenPalette}
              className="hover:text-text-primary transition-colors cursor-pointer bg-transparent border-0 p-0 flex items-center gap-1"
            >
              <kbd className="px-1.5 py-0.5 rounded-[4px] bg-border text-text-primary text-[10px] font-mono font-normal">
                ⌘K
              </kbd>
              <span>Command Palette</span>
            </button>
          </div>
        </div>

        <div className="max-w-[1040px] mx-auto px-4 pb-12 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-muted font-normal gap-2">
          <span>Genesis Design System v2.4 • Built with React 19 & Tailwind CSS</span>
          <span>100% Local-First Software Sovereignty</span>
        </div>
      </footer>
    </div>
  );
}
