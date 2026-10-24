import { useState, useRef } from 'react';
import type { User, Hobby } from '../types.ts';
import { updateProfile, resetAccountPursuits, deleteAccount, getInitials, getScopedStorageKey } from '../auth.ts';
import { exportBackup, importBackup, getWeeklyLogCount } from '../utils.ts';
import {
  User as UserIcon,
  Shield,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  Target,
} from 'lucide-react';

interface AccountViewProps {
  user: User;
  hobbies: Hobby[];
  onUpdateUser: (updatedUser: User) => void;
  onImportHobbies: (newHobbies: Hobby[]) => void;
  onResetHobbies: () => void;
  onDeleteAccount: (userId: string) => void;
}

const AVATAR_COLORS = [
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Forest Green', value: '#059669' },
  { label: 'Charcoal', value: '#18181B' },
  { label: 'Terracotta', value: '#EA580C' },
];

const TARGET_PREFERENCES = [1, 2, 3, 4, 5, 6, 7];

// ponytail: single unified profile view with zero external forms and native storage control.
export function AccountView({
  user,
  hobbies,
  onUpdateUser,
  onImportHobbies,
  onResetHobbies,
  onDeleteAccount,
}: AccountViewProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || '#4F46E5');
  const [defaultWeeklyTarget, setDefaultWeeklyTarget] = useState(
    user.preferences?.defaultWeeklyTarget ?? 3
  );
  const [weekStartsOnMonday, setWeekStartsOnMonday] = useState(
    user.preferences?.weekStartsOnMonday ?? true
  );

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const importFileRef = useRef<HTMLInputElement>(null);

  // Deliberate Practice Analytics Rollup
  const totalSessions = hobbies.reduce((sum, h) => sum + h.logs.length, 0);
  const totalMinutes = hobbies.reduce(
    (sum, h) => sum + h.logs.reduce((s, l) => s + l.durationMinutes, 0),
    0
  );
  const totalHours = (totalMinutes / 60).toFixed(1);
  const thisWeekSessions = hobbies.reduce((sum, h) => sum + getWeeklyLogCount(h.logs), 0);
  const totalWeeklyTarget = hobbies.reduce((sum, h) => sum + h.weeklyTarget, 0);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name.trim()) {
      setErrorMessage('Please provide a display name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    try {
      const updated = updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatarColor,
        preferences: {
          defaultWeeklyTarget,
          weekStartsOnMonday,
        },
      });
      onUpdateUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save changes.');
    }
  };

  const handleExportBackup = () => {
    exportBackup(hobbies);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Importing this backup will replace current pursuits for this account. Continue?')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = importBackup(event.target?.result as string);
        onImportHobbies(imported);
        alert(`Successfully restored ${imported.length} pursuits.`);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Invalid backup format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearHistory = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all pursuit logs and history for this account? This cannot be undone.'
      )
    ) {
      resetAccountPursuits(user.id);
      onResetHobbies();
    }
  };

  const handleDeleteCurrentAccount = () => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete the account "${user.name}" (${user.email})? All scoped data will be removed.`
      )
    ) {
      deleteAccount(user.id);
      onDeleteAccount(user.id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="pb-6 border-b border-border">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-normal">
          Cadence Sovereign Account
        </span>
        <h1 className="font-display font-bold text-[32px] text-text-primary tracking-[-0.035em] mt-0.5">
          Account & Profile
        </h1>
        <p className="text-[14px] text-text-secondary mt-1 font-normal">
          Manage your sovereign profile identity, practice preferences, and local data isolation.
        </p>
      </div>

      {/* 2. Deliberate Practice Analytics Rollup */}
      <section className="bg-surface rounded-xl border border-border p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
          <div className="flex items-center space-x-2.5">
            <Activity className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h2 className="font-display font-bold text-[18px] text-text-primary tracking-[-0.02em]">
              Deliberate Practice Analytics
            </h2>
          </div>
          <span className="text-[11px] font-mono text-muted font-normal">
            Member since {user.createdAt || '2026-08-01'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-canvas border border-border">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-[12px] font-normal">Total Practice</span>
              <Clock className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <div className="font-display font-bold text-[24px] text-text-primary tracking-tight">
              {totalHours} <span className="text-[14px] text-text-secondary font-normal">hrs</span>
            </div>
            <p className="text-[11px] text-muted mt-1 font-normal">
              {totalMinutes} total minutes logged
            </p>
          </div>

          <div className="p-4 rounded-lg bg-canvas border border-border">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-[12px] font-normal">All-Time Sessions</span>
              <CheckCircle className="w-4 h-4 text-brand-green" strokeWidth={1.5} />
            </div>
            <div className="font-display font-bold text-[24px] text-text-primary tracking-tight">
              {totalSessions}
            </div>
            <p className="text-[11px] text-muted mt-1 font-normal">
              Across {hobbies.length} distinct pursuits
            </p>
          </div>

          <div className="p-4 rounded-lg bg-canvas border border-border">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-[12px] font-normal">Active Pursuits</span>
              <Target className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <div className="font-display font-bold text-[24px] text-text-primary tracking-tight">
              {hobbies.length}
            </div>
            <p className="text-[11px] text-muted mt-1 font-normal">
              Current registered disciplines
            </p>
          </div>

          <div className="p-4 rounded-lg bg-canvas border border-border">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-[12px] font-normal">This Week's Target</span>
              <Activity className="w-4 h-4 text-brand-green" strokeWidth={1.5} />
            </div>
            <div className="font-display font-bold text-[24px] text-text-primary tracking-tight">
              {thisWeekSessions} <span className="text-[14px] text-text-secondary font-normal">/ {totalWeeklyTarget}</span>
            </div>
            <p className="text-[11px] text-muted mt-1 font-normal">
              {totalWeeklyTarget > 0 ? Math.round((thisWeekSessions / totalWeeklyTarget) * 100) : 0}% target reached
            </p>
          </div>
        </div>
      </section>

      {/* 3. Profile & Identity Form */}
      <section className="bg-surface rounded-xl border border-border p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
          <div className="flex items-center space-x-2.5">
            <UserIcon className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h2 className="font-display font-bold text-[18px] text-text-primary tracking-[-0.02em]">
              Profile & Identity
            </h2>
          </div>
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 text-brand-green text-[13px] font-normal">
              <CheckCircle size={14} />
              Changes saved successfully
            </span>
          )}
        </div>

        <form onSubmit={handleSaveChanges} className="space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-error text-[13px] font-normal">
              {errorMessage}
            </div>
          )}

          {/* Avatar Preview & Accent Selector */}
          <div>
            <label className="block text-[13px] text-text-primary mb-2 font-normal">
              Avatar Monogram & Accent
            </label>
            <div className="flex items-center space-x-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-[20px] text-white shadow-md transition-all duration-200"
                style={{ backgroundColor: avatarColor }}
              >
                {getInitials(name || 'Cadence')}
              </div>
              <div>
                <p className="text-[12px] text-muted mb-2 font-normal">
                  Select accent color swatch:
                </p>
                <div className="flex items-center space-x-2.5">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setAvatarColor(c.value)}
                      title={c.label}
                      className={`w-7 h-7 rounded-full cursor-pointer transition-transform duration-150 ${
                        avatarColor === c.value
                          ? 'ring-2 ring-offset-2 ring-primary scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="profile-name" className="block text-[13px] text-text-primary mb-1.5 font-normal">
                Display Name
              </label>
              <input
                id="profile-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-border rounded-md py-2 px-3 text-[14px] text-text-primary font-normal focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-[13px] text-text-primary mb-1.5 font-normal">
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-border rounded-md py-2 px-3 text-[14px] text-text-primary font-normal focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Pursuit Preferences */}
          <div className="pt-4 border-t border-border space-y-4">
            <h3 className="font-display font-bold text-[15px] text-text-primary">
              Pursuit Defaults
            </h3>

            <div>
              <label className="block text-[13px] text-text-primary mb-1.5 font-normal">
                Default Weekly Target for New Pursuits
              </label>
              <div className="flex items-center gap-1.5">
                {TARGET_PREFERENCES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDefaultWeeklyTarget(t)}
                    className={`flex-1 h-8 rounded-md font-mono text-[13px] transition-all duration-150 cursor-pointer ${
                      defaultWeeklyTarget === t
                        ? 'bg-primary text-white font-bold shadow-xs'
                        : 'border border-border text-text-secondary hover:border-primary/50 font-normal'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[13px] text-text-primary mb-1.5 font-normal">
                Week Start Day
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWeekStartsOnMonday(true)}
                  className={`px-3 py-1.5 rounded-md text-[13px] transition-all cursor-pointer ${
                    weekStartsOnMonday
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'border border-border text-text-secondary hover:text-text-primary font-normal'
                  }`}
                >
                  Monday (ISO-8601 Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setWeekStartsOnMonday(false)}
                  className={`px-3 py-1.5 rounded-md text-[13px] transition-all cursor-pointer ${
                    !weekStartsOnMonday
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'border border-border text-text-secondary hover:text-text-primary font-normal'
                  }`}
                >
                  Sunday
                </button>
              </div>
            </div>
          </div>

          {/* Primary CTA: Save Changes */}
          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white rounded-md h-[38px] px-5 font-bold text-[14px] shadow-[0_4px_12px_rgba(99,102,241,0.35)] hover:bg-primary-hover hover:-translate-y-px transition-all duration-200 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </section>

      {/* 4. Data Management & Sovereignty */}
      <section className="bg-surface rounded-xl border border-border p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div className="flex items-center space-x-2.5">
            <Shield className="w-5 h-5 text-brand-green" strokeWidth={1.5} />
            <h2 className="font-display font-bold text-[18px] text-text-primary tracking-[-0.02em]">
              Data Sovereignty & Backups
            </h2>
          </div>
          <span className="font-mono text-[11px] text-muted px-2 py-0.5 rounded-[4px] bg-canvas border border-border font-normal">
            {getScopedStorageKey(user.id)}
          </span>
        </div>

        <p className="text-[13px] text-text-secondary font-normal mb-5 leading-relaxed">
          Your pursuit history and deliberate practice logs are stored in an isolated, per-user local partition. You can export an offline JSON backup or restore an existing backup at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="h-[38px] px-4 rounded-md border border-border bg-white text-text-primary hover:bg-canvas transition-colors text-[13px] font-normal inline-flex items-center gap-2 cursor-pointer"
          >
            <Download size={15} className="text-muted" strokeWidth={1.5} />
            <span>Export User Backup JSON</span>
          </button>

          <button
            type="button"
            onClick={() => importFileRef.current?.click()}
            className="h-[38px] px-4 rounded-md border border-border bg-white text-text-primary hover:bg-canvas transition-colors text-[13px] font-normal inline-flex items-center gap-2 cursor-pointer"
          >
            <Upload size={15} className="text-muted" strokeWidth={1.5} />
            <span>Restore Backup JSON</span>
          </button>
          <input
            ref={importFileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </section>

      {/* 5. Danger Zone */}
      <section className="bg-surface rounded-xl border border-red-200 p-6 shadow-xs">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-red-100 mb-4">
          <AlertTriangle className="w-5 h-5 text-error" strokeWidth={1.5} />
          <h2 className="font-display font-bold text-[18px] text-error tracking-[-0.02em]">
            Danger Zone
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-red-50/50 border border-red-100">
            <div>
              <p className="font-bold text-[14px] text-text-primary">
                Clear Pursuit History
              </p>
              <p className="text-[12px] text-muted font-normal">
                Deletes all session logs and hobbies for this account. Your account credentials remain intact.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearHistory}
              className="h-[34px] px-3.5 rounded-md border border-red-200 bg-white text-error hover:bg-red-50 transition-colors text-[12px] font-normal flex-shrink-0 cursor-pointer"
            >
              Clear All Pursuits
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-red-50/50 border border-red-100">
            <div>
              <p className="font-bold text-[14px] text-text-primary">
                Delete Sovereign Account
              </p>
              <p className="text-[12px] text-muted font-normal">
                Permanently erases this account credentials and all scoped practice data from this device.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeleteCurrentAccount}
              className="h-[34px] px-3.5 rounded-md border border-red-300 bg-red-600 text-white hover:bg-red-700 transition-colors text-[12px] font-bold flex-shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} strokeWidth={1.5} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
