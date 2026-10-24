import { useState, useEffect, useRef } from 'react';
import type { Category, Hobby, ViewMode, User } from './types.ts';
import { INITIAL_HOBBIES } from './types.ts';
import {
  loadHobbies,
  saveHobbies,
  exportBackup,
  importBackup,
  getWeeklyLogCount,
  get28DayWindow,
  formatLocalDate,
} from './utils.ts';
import {
  getCurrentUser,
  subscribeAuth,
  signOut,
  getScopedStorageKey,
  getInitials,
  DEMO_USER,
} from './auth.ts';
import { HobbyCard } from './components/HobbyCard.tsx';
import { TimelineView } from './components/TimelineView.tsx';
import { LogModal } from './components/LogModal.tsx';
import { NewHobbyModal } from './components/NewHobbyModal.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { UserMenu } from './components/UserMenu.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AccountView } from './components/AccountView.tsx';
import { LandingView } from './components/LandingView.tsx';
import { Search, Download, Upload, Plus, LogIn } from 'lucide-react';

const CATEGORIES: Category[] = ['Creative', 'Tech', 'Physical', 'Learning'];

function loadUserHobbies(user: User | null): Hobby[] {
  if (!user) return [];
  const scopedKey = getScopedStorageKey(user.id);
  const fallback = user.id === DEMO_USER.id ? INITIAL_HOBBIES : [];
  return loadHobbies(fallback, scopedKey);
}

// ponytail: single unified state container; minimal modal toggle flags.
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [hobbies, setHobbies] = useState<Hobby[]>(() => loadUserHobbies(currentUser));
  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const hash = window.location.hash;
    if (hash === '#landing' || hash === '#overview') return 'landing';
    if (hash === '#timeline') return 'timeline';
    if (hash === '#account') return 'account';
    if (hash === '#dashboard') return 'dashboard';
    return 'dashboard';
  });
  const [windowDates] = useState(() => get28DayWindow());
  const [todayStr] = useState(() => formatLocalDate(new Date()));

  // Interactive modal states
  const [activeLogHobby, setActiveLogHobby] = useState<Hobby | null>(null);
  const [isNewHobbyOpen, setIsNewHobbyOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to auth state changes and refresh scoped hobbies
  useEffect(() => {
    return subscribeAuth((user) => {
      setCurrentUser(user);
      setHobbies(loadUserHobbies(user));
    });
  }, []);

  // Persist hobbies to scoped storage
  useEffect(() => {
    if (currentUser) {
      saveHobbies(hobbies, getScopedStorageKey(currentUser.id));
    }
  }, [hobbies, currentUser]);

  // Synchronize navigation view with window.location.hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#landing' || hash === '#overview') {
        setCurrentView('landing');
      } else if (hash === '#timeline') {
        setCurrentView('timeline');
      } else if (hash === '#account') {
        setCurrentView('account');
      } else {
        setCurrentView('dashboard');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Lock body scroll whenever any dialog or command palette is open
  useEffect(() => {
    const isModalOpen = Boolean(
      activeLogHobby || isNewHobbyOpen || isPaletteOpen || isAuthModalOpen
    );
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeLogHobby, isNewHobbyOpen, isPaletteOpen, isAuthModalOpen]);

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredHobbies =
    selectedCategory === 'All'
      ? hobbies
      : hobbies.filter((h) => h.category === selectedCategory);

  const totalWeeklyCompleted = hobbies.reduce(
    (sum, h) => sum + getWeeklyLogCount(h.logs),
    0
  );
  const totalWeeklyTarget = hobbies.reduce((sum, h) => sum + h.weeklyTarget, 0);
  const overallWeeklyPercent =
    totalWeeklyTarget > 0
      ? Math.round((totalWeeklyCompleted / totalWeeklyTarget) * 100)
      : 0;

  const handleExport = () => {
    exportBackup(hobbies);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        'Importing backup will replace all current pursuits and logs for this account. Do you want to proceed?'
      )
    ) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = importBackup(event.target?.result as string);
        setHobbies(imported);
        alert(`Successfully imported ${imported.length} pursuits.`);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to import backup');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveLog = (updatedHobby: Hobby) => {
    setHobbies((prev) =>
      prev.map((h) => (h.id === updatedHobby.id ? updatedHobby : h))
    );
  };

  const handleCreateHobby = (newHobby: Hobby) => {
    setHobbies((prev) => [newHobby, ...prev]);
  };

  const handleSelectHobbyFromPalette = (hobby: Hobby) => {
    setIsPaletteOpen(false);
    setActiveLogHobby(hobby);
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      {/* 1. Sticky Top Navigation (56px) */}
      <header className="sticky top-0 z-40 w-full h-[56px] bg-surface/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1280px] h-full mx-auto px-6 flex items-center justify-between">
          {/* Left: Wordmark & Brand Accent */}
          <div className="flex items-center space-x-2.5">
            <a
              href="#landing"
              onClick={() => {
                window.location.hash = '#landing';
                setCurrentView('landing');
              }}
              className="flex items-center space-x-2 group"
              title="Cadence Overview"
            >
              <div className="w-6 h-6 rounded-md bg-[#0A0A0A] text-white flex items-center justify-center font-display font-bold text-xs tracking-tight transition-transform duration-200 group-hover:scale-105">
                C
              </div>
              <span className="font-display font-bold text-[18px] text-text-primary tracking-[-0.03em]">
                Cadence
              </span>
            </a>
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#EBF7EA] border border-[#C5E9C0] text-brand-green text-[11px] font-mono font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green mr-1.5 animate-pulse" />
              GENESIS v2.4
            </div>
          </div>

          {/* Center: ⌘K Global Search Trigger Bar */}
          <div className="w-[380px] hidden sm:block">
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="group flex items-center w-full h-[36px] bg-canvas border border-border rounded-xl px-3 cursor-pointer hover:border-primary/50 transition-colors duration-150 text-left"
            >
              <Search
                className="w-4 h-4 text-muted mr-2.5 flex-shrink-0 transition-colors duration-150 group-hover:text-primary"
                strokeWidth={1.5}
              />
              <span className="w-full text-[13px] text-muted font-normal">
                Jump to hobby or log session...
              </span>
              <div className="flex items-center space-x-0.5 px-1.5 py-0.5 rounded-[4px] bg-border text-text-secondary text-[11px] font-mono leading-none flex-shrink-0 font-normal">
                <span>⌘</span>
                <span>K</span>
              </div>
            </button>
          </div>

          {/* Right: Navigation Actions & User Avatar */}
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-5 text-[14px] font-normal text-text-secondary">
              <a
                href="#landing"
                onClick={() => {
                  window.location.hash = '#landing';
                  setCurrentView('landing');
                }}
                className={
                  currentView === 'landing'
                    ? 'text-text-primary font-bold border-b-2 border-text-primary py-3.5 -mb-[1px]'
                    : 'hover:text-text-primary transition-colors py-3.5 font-normal text-text-secondary'
                }
              >
                Overview
              </a>
              <a
                href="#dashboard"
                onClick={() => {
                  window.location.hash = '#dashboard';
                  setCurrentView('dashboard');
                }}
                className={
                  currentView === 'dashboard'
                    ? 'text-text-primary font-bold border-b-2 border-text-primary py-3.5 -mb-[1px]'
                    : 'hover:text-text-primary transition-colors py-3.5 font-normal text-text-secondary'
                }
              >
                Dashboard
              </a>
              <a
                href="#timeline"
                onClick={() => {
                  window.location.hash = '#timeline';
                  setCurrentView('timeline');
                }}
                className={
                  currentView === 'timeline'
                    ? 'text-text-primary font-bold border-b-2 border-text-primary py-3.5 -mb-[1px]'
                    : 'hover:text-text-primary transition-colors py-3.5 font-normal text-text-secondary'
                }
              >
                Timeline
              </a>
              <a
                href="#account"
                onClick={() => {
                  window.location.hash = '#account';
                  setCurrentView('account');
                }}
                className={
                  currentView === 'account'
                    ? 'text-text-primary font-bold border-b-2 border-text-primary py-3.5 -mb-[1px]'
                    : 'hover:text-text-primary transition-colors py-3.5 font-normal text-text-secondary'
                }
              >
                Account
              </a>
              <button
                type="button"
                onClick={handleExport}
                className="hover:text-text-primary transition-colors py-3.5 flex items-center space-x-1 font-normal text-text-secondary bg-transparent border-0 cursor-pointer"
              >
                <span>Export</span>
                <Download
                  className="w-3.5 h-3.5 text-muted transition-transform duration-150"
                  strokeWidth={1.5}
                />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-text-primary transition-colors py-3.5 flex items-center space-x-1 font-normal text-text-secondary bg-transparent border-0 cursor-pointer"
                title="Import JSON backup"
              >
                <span>Import</span>
                <Upload
                  className="w-3.5 h-3.5 text-muted transition-transform duration-150"
                  strokeWidth={1.5}
                />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImport}
              />
            </nav>
            <div className="h-4 w-[1px] bg-border" />

            {/* Avatar & User Dropdown Menu */}
            <div className="relative">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-label="Open user account menu"
                  className="w-8 h-8 rounded-full text-white font-display font-bold text-[12px] flex items-center justify-center border border-transparent hover:border-primary/50 transition-all duration-150 cursor-pointer"
                  style={{ backgroundColor: currentUser.avatarColor || '#4F46E5' }}
                >
                  {getInitials(currentUser.name)}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="h-8 px-2.5 rounded-lg border border-border bg-white text-text-primary hover:border-primary text-[12px] font-normal inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogIn size={13} strokeWidth={1.5} className="text-muted" />
                  <span>Sign In</span>
                </button>
              )}

              <UserMenu
                user={currentUser}
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                onNavigateAccount={() => {
                  window.location.hash = '#account';
                  setCurrentView('account');
                }}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onSignOut={() => signOut()}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="max-w-[1280px] w-full mx-auto px-6 py-10 flex-1">
        {currentView === 'landing' ? (
          <LandingView
            onNavigate={(view) => {
              window.location.hash = `#${view}`;
              setCurrentView(view);
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenPalette={() => setIsPaletteOpen(true)}
            onTransferDemoHobby={(newHobby) => {
              setHobbies((prev) => [newHobby, ...prev]);
            }}
          />
        ) : currentView === 'account' ? (
          currentUser ? (
            <AccountView
              user={currentUser}
              hobbies={hobbies}
              onUpdateUser={(updated) => setCurrentUser(updated)}
              onImportHobbies={(newHobbies) => setHobbies(newHobbies)}
              onResetHobbies={() => setHobbies([])}
              onDeleteAccount={() => {
                window.location.hash = '#dashboard';
                setCurrentView('dashboard');
              }}
            />
          ) : (
            <div className="py-16 text-center bg-surface border border-border rounded-xl p-8">
              <p className="text-text-primary font-bold text-[16px]">
                Authentication Required
              </p>
              <p className="text-text-secondary text-sm font-normal mt-1 mb-4">
                Please sign in to access your sovereign account settings and profile analytics.
              </p>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="h-[38px] px-4 rounded-md border border-border bg-canvas text-text-primary hover:bg-[#F0F0F4] text-[13px] font-normal cursor-pointer"
              >
                Sign In to Cadence
              </button>
            </div>
          )
        ) : (
          <>
            {/* 2. Header Summary & Action Bar */}
            <section className="mb-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
                {/* Left: Heading & Dynamic Subtitle */}
                <div>
                  <h1 className="font-display font-bold text-[32px] text-text-primary tracking-[-0.035em] leading-tight">
                    {currentView === 'dashboard' ? 'Active Pursuits' : 'Practice Timeline'}
                  </h1>
                  <p className="text-[15px] text-text-secondary mt-1 font-normal">
                    {currentView === 'dashboard'
                      ? `${totalWeeklyCompleted} of ${totalWeeklyTarget} weekly sessions completed across ${hobbies.length} hobbies`
                      : `Chronological activity stream of deliberate practice sessions across ${hobbies.length} hobbies`}
                  </p>
                </div>

                {/* Right: Single Primary CTA (+ New Hobby) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsNewHobbyOpen(true)}
                    className="bg-primary text-white rounded-md h-[38px] px-4 font-bold text-[14px] inline-flex items-center gap-1.5 shadow-[0_4px_12px_rgba(99,102,241,0.35)] hover:bg-primary-hover hover:-translate-y-px transition-all duration-200 cursor-pointer"
                  >
                    <Plus size={16} strokeWidth={2} />
                    <span>New Hobby</span>
                  </button>
                </div>
              </div>

              {/* Filter Chips & Target Progress Row for Dashboard */}
              {currentView === 'dashboard' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-5">
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
                      All Hobbies ({hobbies.length})
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
                  </div>

                  {/* Weekly Target Progress Pill */}
                  <div className="flex items-center space-x-2 text-[12px] text-text-secondary font-normal group cursor-default">
                    <span>Weekly Target:</span>
                    <div className="w-24 h-2 bg-border rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-success rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, overallWeeklyPercent)}%` }}
                      />
                    </div>
                    <span className="font-mono text-text-primary font-normal">
                      {overallWeeklyPercent}%
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* 3. View Switcher: Dashboard Card Grid or Practice Timeline */}
            {currentView === 'dashboard' ? (
              filteredHobbies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHobbies.map((hobby) => (
                    <HobbyCard
                      key={hobby.id}
                      hobby={hobby}
                      windowDates={windowDates}
                      todayStr={todayStr}
                      onLogClick={(h) => setActiveLogHobby(h)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center bg-surface border border-border rounded-xl p-8">
                  <p className="text-text-secondary text-sm font-normal">
                    {hobbies.length === 0
                      ? 'No pursuits registered yet. Click "New Hobby" above to start deliberate practice.'
                      : `No pursuits found in "${selectedCategory}".`}
                  </p>
                  {hobbies.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('All')}
                      className="mt-3 text-primary text-sm font-normal hover:underline cursor-pointer"
                    >
                      View all pursuits →
                    </button>
                  )}
                </div>
              )
            ) : (
              <TimelineView
                hobbies={hobbies}
                todayStr={todayStr}
                onLogClick={(h) => setActiveLogHobby(h)}
              />
            )}

            {/* 4. Quick Insights Footer Strip */}
            <div className="mt-12 p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between text-[13px] text-text-secondary font-normal gap-3">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span>
                  Consistent habit streaks:{' '}
                  <strong className="text-text-primary font-bold">Rust</strong> (3 weeks),{' '}
                  <strong className="text-text-primary font-bold">Guitar</strong> (2 weeks)
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-mono text-[12px] text-muted font-normal">
                  Data synced local-first
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    window.location.hash = '#dashboard';
                    setCurrentView('dashboard');
                  }}
                  className="text-primary font-normal hover:underline text-[12px] transition-colors hover:text-primary-hover cursor-pointer"
                >
                  View All {hobbies.length} Hobbies →
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Interactive Modals */}
      {activeLogHobby && (
        <LogModal
          key={activeLogHobby.id}
          hobby={activeLogHobby}
          onClose={() => setActiveLogHobby(null)}
          onSave={handleSaveLog}
        />
      )}

      {isNewHobbyOpen && (
        <NewHobbyModal
          onClose={() => setIsNewHobbyOpen(false)}
          onCreate={handleCreateHobby}
          defaultWeeklyTarget={currentUser?.preferences?.defaultWeeklyTarget ?? 3}
        />
      )}

      {isPaletteOpen && (
        <CommandPalette
          onClose={() => setIsPaletteOpen(false)}
          hobbies={hobbies}
          onSelectHobby={handleSelectHobbyFromPalette}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
          }}
        />
      )}
    </div>
  );
}
