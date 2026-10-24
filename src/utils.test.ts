import assert from 'node:assert/strict';
import {
  formatLocalDate,
  get28DayWindow,
  getWeeklyLogCount,
  getStatus,
  loadHobbies,
  importBackup,
  getTimelineEntries,
  formatTimelineDate,
} from './utils.ts';
import { INITIAL_HOBBIES } from './types.ts';
import type { SessionLog, Hobby } from './types.ts';

// 1. Date formatting & leap years
assert.equal(formatLocalDate(new Date(2024, 1, 29)), '2024-02-29'); // Leap day
assert.equal(formatLocalDate(new Date(2026, 9, 5)), '2026-10-05'); // Single-digit day
assert.equal(formatLocalDate(new Date(2026, 0, 1)), '2026-01-01'); // Month 0 = Jan

// 2. 28-day sliding window
const refDate = new Date(2026, 9, 24); // 2026-10-24
const window28 = get28DayWindow(refDate);
assert.equal(window28.length, 28);
assert.equal(window28[27], '2026-10-24');
assert.equal(window28[0], '2026-09-27'); // 27 days before 10-24 is 09-27

// 3. Weekly log count across ISO week (Mon–Sun)
// 2026-10-24 is Saturday. Monday is 2026-10-19. Sunday is 2026-10-25.
const mockLogs: SessionLog[] = [
  { id: '1', date: '2026-10-18', durationMinutes: 30, note: 'Prior week Sunday', timestamp: 0 },
  { id: '2', date: '2026-10-19', durationMinutes: 45, note: 'Monday', timestamp: 0 },
  { id: '3', date: '2026-10-22', durationMinutes: 60, note: 'Thursday', timestamp: 0 },
  { id: '4', date: '2026-10-24', durationMinutes: 15, note: 'Saturday (Today)', timestamp: 0 },
  { id: '5', date: '2026-10-26', durationMinutes: 30, note: 'Next week Monday', timestamp: 0 },
];
assert.equal(getWeeklyLogCount(mockLogs, refDate), 3);

// 4. Status determination
// No logs
assert.deepEqual(getStatus([], refDate), { label: 'Needs Attention — inactive', isGreen: false });

// Active today
assert.deepEqual(getStatus([{ id: 'a', date: '2026-10-24', durationMinutes: 30, note: '', timestamp: 0 }], refDate), {
  label: 'On Track — Active Today',
  isGreen: true,
});

// Active yesterday
assert.deepEqual(getStatus([{ id: 'b', date: '2026-10-23', durationMinutes: 30, note: '', timestamp: 0 }], refDate), {
  label: 'On Track — Active Yesterday',
  isGreen: true,
});

// 3 days ago
assert.deepEqual(getStatus([{ id: 'c', date: '2026-10-21', durationMinutes: 30, note: '', timestamp: 0 }], refDate), {
  label: 'On Track — 3d ago',
  isGreen: true,
});

// 7 days inactive
assert.deepEqual(getStatus([{ id: 'd', date: '2026-10-17', durationMinutes: 30, note: '', timestamp: 0 }], refDate), {
  label: 'Needs Attention — 7d inactive',
  isGreen: false,
});

// 5. Fallback storage load
const loaded = loadHobbies(INITIAL_HOBBIES);
assert.equal(loaded.length, 5);

// 6. Backup import verification
const validBackup = JSON.stringify(INITIAL_HOBBIES);
const imported = importBackup(validBackup);
assert.equal(imported.length, 5);
assert.equal(imported[0].title, 'Systems Programming in Rust');

// Invalid backup throws
assert.throws(() => importBackup('{}'), /array of hobbies/);
assert.throws(() => importBackup(JSON.stringify([{ invalid: true }])), /Invalid hobby data format/);

// 7. Phase 4 Session Logging & State Transitions
const testHobby: Hobby = {
  id: 'test-hobby-1',
  title: 'Test Pursuit',
  category: 'Tech',
  weeklyTarget: 2,
  nextStepBookmark: 'Initial step',
  createdAt: '2026-10-01',
  logs: [
    { id: 'old-1', date: '2026-10-10', durationMinutes: 30, note: 'Old note', timestamp: 100 },
  ],
};

// Before session: status is inactive
assert.equal(getStatus(testHobby.logs, refDate).isGreen, false);
assert.equal(getWeeklyLogCount(testHobby.logs, refDate), 0);

// Add new session for today with updated bookmark
const newLog: SessionLog = {
  id: 'new-1',
  date: formatLocalDate(refDate),
  durationMinutes: 45,
  note: 'Practiced concurrency',
  timestamp: refDate.getTime(),
};

const updatedHobby: Hobby = {
  ...testHobby,
  nextStepBookmark: 'Updated next step',
  logs: [newLog, ...testHobby.logs],
};

assert.equal(updatedHobby.logs.length, 2);
assert.equal(updatedHobby.nextStepBookmark, 'Updated next step');
assert.equal(getWeeklyLogCount(updatedHobby.logs, refDate), 1);
assert.equal(getStatus(updatedHobby.logs, refDate).label, 'On Track — Active Today');
assert.equal(getStatus(updatedHobby.logs, refDate).isGreen, true);

// 8. Phase 4 New Hobby creation structure
const createdHobby: Hobby = {
  id: `hobby-${Date.now()}`,
  title: 'Analog Photography',
  category: 'Creative',
  weeklyTarget: 3,
  nextStepBookmark: 'Develop Kodak Tri-X 400 roll',
  createdAt: formatLocalDate(refDate),
  logs: [],
};
assert.equal(createdHobby.title, 'Analog Photography');
assert.equal(createdHobby.logs.length, 0);

// 9. Timeline calculations and sorting
const timelineEntries = getTimelineEntries(INITIAL_HOBBIES);
assert.equal(timelineEntries.length, 12);
// Verify sorted descending by date
for (let i = 0; i < timelineEntries.length - 1; i++) {
  assert.ok(
    timelineEntries[i].date >= timelineEntries[i + 1].date,
    `Timeline entries should be sorted descending by date: ${timelineEntries[i].date} vs ${timelineEntries[i + 1].date}`
  );
}
// Top entry is 2026-10-24
assert.equal(timelineEntries[0].date, '2026-10-24');

// Date formatting helper
assert.equal(formatTimelineDate('2026-10-24', '2026-10-24'), 'Today');
assert.equal(formatTimelineDate('2026-10-23', '2026-10-24'), 'Yesterday');
assert.equal(formatTimelineDate('2026-10-22', '2026-10-24'), 'Thu, Oct 22, 2026');

// 10. Phase 6 Authentication & Sovereign Identity Tests
import {
  initAuth,
  signUp,
  signIn,
  signOut,
  signInDemo,
  updateProfile,
  deleteAccount,
  getScopedStorageKey,
  getInitials,
  getCurrentUser,
  DEMO_USER,
} from './auth.ts';

// Init auth and test demo account
await initAuth();
const currentDemo = getCurrentUser();
assert.ok(currentDemo);
assert.equal(currentDemo.id, DEMO_USER.id);
assert.equal(getInitials('Alex Kim'), 'AK');
assert.equal(getInitials('Sarah'), 'SA');
assert.equal(getInitials('John Michael Doe'), 'JD');

// Scoped storage key isolation
assert.equal(getScopedStorageKey('user-123'), 'cadence_hobbies_user_user-123');
assert.equal(getScopedStorageKey(DEMO_USER.id), 'cadence_hobbies_user_usr-alex-kim');

// Sign up new user
const newUser = await signUp('Taylor Reed', 'taylor@example.com', 'secret123');
assert.equal(newUser.name, 'Taylor Reed');
assert.equal(newUser.email, 'taylor@example.com');
assert.equal(newUser.preferences.defaultWeeklyTarget, 3);
assert.equal(getCurrentUser()?.id, newUser.id);

// Duplicate sign up throws error
await assert.rejects(
  () => signUp('Duplicate Taylor', 'taylor@example.com', 'password999'),
  /already exists/
);

// Sign out
signOut();
assert.equal(getCurrentUser(), null);

// Sign in with invalid password throws error
await assert.rejects(
  () => signIn('taylor@example.com', 'wrongpassword'),
  /Incorrect password/
);

// Sign in with valid credentials
const loggedInUser = await signIn('taylor@example.com', 'secret123');
assert.equal(loggedInUser.id, newUser.id);
assert.equal(getCurrentUser()?.id, newUser.id);

// Profile updates
const updated = updateProfile({
  name: 'Taylor R.',
  avatarColor: '#059669',
  preferences: { defaultWeeklyTarget: 5, weekStartsOnMonday: false },
});
assert.equal(updated.name, 'Taylor R.');
assert.equal(updated.avatarColor, '#059669');
assert.equal(updated.preferences.defaultWeeklyTarget, 5);
assert.equal(updated.preferences.weekStartsOnMonday, false);
assert.equal(getCurrentUser()?.name, 'Taylor R.');

// Account deletion
deleteAccount(newUser.id);
assert.notEqual(getCurrentUser()?.id, newUser.id);

// Sign back in as Demo user
const demoAgain = await signInDemo();
assert.equal(demoAgain.id, DEMO_USER.id);

// 11. Phase 5 & 6 Genesis Design System & Two-Weight Rule Verification
import fs from 'node:fs';

const UI_FILES = [
  'src/App.tsx',
  'src/components/HobbyCard.tsx',
  'src/components/TimelineView.tsx',
  'src/components/LogModal.tsx',
  'src/components/NewHobbyModal.tsx',
  'src/components/CommandPalette.tsx',
  'src/components/AccountView.tsx',
  'src/components/AuthModal.tsx',
  'src/components/UserMenu.tsx',
  'src/components/LandingView.tsx',
];

for (const filePath of UI_FILES) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Two-Weight Rule: Only 400 (normal) and 700 (bold) allowed
  assert.equal(/font-(medium|semibold|light|thin|black|extrabold)/.test(content), false, `${filePath} contains forbidden intermediate font weights`);
  
  // Radius Hierarchy: only allowed tokens
  const roundedMatches = content.match(/rounded(-[a-zA-Z0-9[\]]+)?/g) || [];
  const allowedTokens = new Set(['rounded-xl', 'rounded-lg', 'rounded-md', 'rounded-[4px]', 'rounded-full']);
  for (const token of roundedMatches) {
    assert.ok(allowedTokens.has(token), `${filePath} contains unauthorized radius token: ${token}`);
  }
}

// Single Primary CTA Rule: Exactly one primary button on main dashboard
const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const mainPrimaryButtons = appContent.match(/bg-primary text-white[^>]*rounded-md/g) || [];
assert.equal(mainPrimaryButtons.length, 1, 'Dashboard must have strictly one primary CTA button');

console.log('All utility smoke tests passed successfully!');
