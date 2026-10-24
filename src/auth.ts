// ponytail: Local-first sovereign auth engine using Web Crypto; zero external dependencies.
import type { User, UserPreferences } from './types.ts';
import { formatLocalDate } from './utils.ts';

export const STORAGE_ACCOUNTS_KEY = 'cadence_accounts_v1';
export const STORAGE_SESSION_KEY = 'cadence_active_session_v1';
export const STORAGE_LEGACY_HOBBIES_KEY = 'cadence_hobbies_v1';

export const DEMO_USER: User = {
  id: 'usr-alex-kim',
  email: 'alex.kim@cadence.internal',
  name: 'Alex Kim',
  avatarColor: '#4F46E5',
  createdAt: '2026-08-01',
  preferences: {
    defaultWeeklyTarget: 3,
    weekStartsOnMonday: true,
  },
};

const DEMO_PASSWORD = 'cadence2026';

export interface StoredAccount {
  user: User;
  passwordHash: string;
}

// In-memory fallback for environments without localStorage (e.g. Node.js unit tests)
const memoryStore = new Map<string, string>();

function getStorageItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // localStorage restricted or inaccessible
  }
  return memoryStore.get(key) ?? null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    // localStorage restricted or quota exceeded
  }
  memoryStore.set(key, value);
}

function removeStorageItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
  } catch {
    // localStorage restricted
  }
  memoryStore.delete(key);
}

export function getScopedStorageKey(userId: string): string {
  return `cadence_hobbies_user_${userId}`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function hashPassword(password: string): Promise<string> {
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : (globalThis as unknown as { crypto?: Crypto }).crypto;
  if (cryptoObj?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`cadence-salt:${password}`);
    const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Deterministic fallback for restricted environments
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}`;
}

// Internal accounts manager
function getStoredAccounts(): StoredAccount[] {
  const raw = getStorageItem(STORAGE_ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredAccounts(accounts: StoredAccount[]): void {
  setStorageItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
}

// Active session state and reactive subscribers
let currentUser: User | null = null;
const authListeners = new Set<(user: User | null) => void>();

function notifyAuthListeners(): void {
  for (const listener of authListeners) {
    try {
      listener(currentUser);
    } catch {
      // Ignore subscriber errors
    }
  }
}

// Pre-seed demo user & migrate legacy un-scoped data
let isInitialized = false;

export async function initAuth(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  let accounts = getStoredAccounts();
  const demoHash = await hashPassword(DEMO_PASSWORD);

  // If no accounts exist, register demo user
  const demoAccount = accounts.find((a) => a.user.id === DEMO_USER.id);
  if (!demoAccount) {
    accounts = [{ user: DEMO_USER, passwordHash: demoHash }, ...accounts];
    saveStoredAccounts(accounts);
  }

  // Automatic legacy migration: copy legacy cadence_hobbies_v1 into Alex Kim's scoped storage
  const legacyData = getStorageItem(STORAGE_LEGACY_HOBBIES_KEY);
  const alexScopedKey = getScopedStorageKey(DEMO_USER.id);
  const alexExistingData = getStorageItem(alexScopedKey);

  if (legacyData && !alexExistingData) {
    setStorageItem(alexScopedKey, legacyData);
  }

  // Restore active session or default to demo user
  const activeSessionUserId = getStorageItem(STORAGE_SESSION_KEY);
  if (activeSessionUserId) {
    const activeAccount = accounts.find((a) => a.user.id === activeSessionUserId);
    if (activeAccount) {
      currentUser = activeAccount.user;
    } else {
      currentUser = DEMO_USER;
      setStorageItem(STORAGE_SESSION_KEY, DEMO_USER.id);
    }
  } else {
    currentUser = DEMO_USER;
    setStorageItem(STORAGE_SESSION_KEY, DEMO_USER.id);
  }

  notifyAuthListeners();
}

// Trigger initial sync synchronously for immediate state readiness
try {
  const accounts = getStoredAccounts();
  const activeSessionUserId = getStorageItem(STORAGE_SESSION_KEY);
  if (activeSessionUserId) {
    const activeAccount = accounts.find((a) => a.user.id === activeSessionUserId);
    currentUser = activeAccount ? activeAccount.user : DEMO_USER;
  } else {
    currentUser = DEMO_USER;
  }
} catch {
  currentUser = DEMO_USER;
}

// Asynchronously ensure hashing and legacy migration
if (typeof window !== 'undefined') {
  initAuth().catch(() => {});
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function subscribeAuth(listener: (user: User | null) => void): () => void {
  authListeners.add(listener);
  listener(currentUser);
  return () => {
    authListeners.delete(listener);
  };
}

export function getAllAccounts(): User[] {
  const accounts = getStoredAccounts();
  if (accounts.length === 0) {
    return [DEMO_USER];
  }
  return accounts.map((a) => a.user);
}

export async function signIn(email: string, password: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getStoredAccounts();
  const account = accounts.find((a) => a.user.email.toLowerCase() === normalizedEmail);

  if (!account) {
    throw new Error('No account found with this email address.');
  }

  const inputHash = await hashPassword(password);
  if (account.passwordHash !== inputHash) {
    throw new Error('Incorrect password. Please try again.');
  }

  currentUser = account.user;
  setStorageItem(STORAGE_SESSION_KEY, account.user.id);
  notifyAuthListeners();
  return account.user;
}

export async function signInDemo(): Promise<User> {
  await initAuth();
  const accounts = getStoredAccounts();
  const demo = accounts.find((a) => a.user.id === DEMO_USER.id);
  const user = demo ? demo.user : DEMO_USER;
  currentUser = user;
  setStorageItem(STORAGE_SESSION_KEY, user.id);
  notifyAuthListeners();
  return user;
}

export async function signUp(name: string, email: string, password: string): Promise<User> {
  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!trimmedName) {
    throw new Error('Please provide your name.');
  }
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const accounts = getStoredAccounts();
  const existing = accounts.find((a) => a.user.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }

  const passwordHash = await hashPassword(password);
  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    name: trimmedName,
    avatarColor: '#4F46E5',
    createdAt: formatLocalDate(new Date()),
    preferences: {
      defaultWeeklyTarget: 3,
      weekStartsOnMonday: true,
    },
  };

  const updatedAccounts = [...accounts, { user: newUser, passwordHash }];
  saveStoredAccounts(updatedAccounts);

  // Initialize empty pursuits for new user
  setStorageItem(getScopedStorageKey(newUser.id), JSON.stringify([]));

  currentUser = newUser;
  setStorageItem(STORAGE_SESSION_KEY, newUser.id);
  notifyAuthListeners();
  return newUser;
}

export function signOut(): void {
  currentUser = null;
  removeStorageItem(STORAGE_SESSION_KEY);
  notifyAuthListeners();
}

export function switchAccount(userId: string): User {
  const accounts = getStoredAccounts();
  const account = accounts.find((a) => a.user.id === userId);
  if (!account) {
    throw new Error('Account not found.');
  }
  currentUser = account.user;
  setStorageItem(STORAGE_SESSION_KEY, account.user.id);
  notifyAuthListeners();
  return account.user;
}

export function updateProfile(
  updates: Partial<Pick<User, 'name' | 'email' | 'avatarColor'>> & {
    preferences?: Partial<UserPreferences>;
  }
): User {
  if (!currentUser) {
    throw new Error('No user is currently signed in.');
  }

  const accounts = getStoredAccounts();
  const index = accounts.findIndex((a) => a.user.id === currentUser?.id);

  const updatedPreferences: UserPreferences = {
    ...currentUser.preferences,
    ...(updates.preferences || {}),
  };

  const updatedUser: User = {
    ...currentUser,
    ...(updates.name ? { name: updates.name.trim() } : {}),
    ...(updates.email ? { email: updates.email.trim().toLowerCase() } : {}),
    ...(updates.avatarColor ? { avatarColor: updates.avatarColor } : {}),
    preferences: updatedPreferences,
  };

  if (index !== -1) {
    accounts[index] = {
      ...accounts[index],
      user: updatedUser,
    };
    saveStoredAccounts(accounts);
  }

  currentUser = updatedUser;
  notifyAuthListeners();
  return updatedUser;
}

export function deleteAccount(userId: string): void {
  let accounts = getStoredAccounts();
  accounts = accounts.filter((a) => a.user.id !== userId);
  saveStoredAccounts(accounts);

  // Remove user scoped pursuits
  removeStorageItem(getScopedStorageKey(userId));

  if (currentUser?.id === userId) {
    const remaining = accounts[0];
    if (remaining) {
      currentUser = remaining.user;
      setStorageItem(STORAGE_SESSION_KEY, remaining.user.id);
    } else {
      currentUser = null;
      removeStorageItem(STORAGE_SESSION_KEY);
    }
    notifyAuthListeners();
  }
}

export function resetAccountPursuits(userId: string): void {
  setStorageItem(getScopedStorageKey(userId), JSON.stringify([]));
}
