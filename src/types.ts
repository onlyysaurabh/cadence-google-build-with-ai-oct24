export type Category = 'Creative' | 'Tech' | 'Physical' | 'Learning';
export type SessionDuration = 15 | 30 | 45 | 60;
export type ViewMode = 'landing' | 'dashboard' | 'timeline' | 'account';

export interface UserPreferences {
  defaultWeeklyTarget: number;
  weekStartsOnMonday: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarColor?: string;
  createdAt: string;
  preferences: UserPreferences;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface SessionLog {
  id: string;
  date: string; // "YYYY-MM-DD"
  durationMinutes: SessionDuration;
  note: string;
  timestamp: number;
}

export interface Hobby {
  id: string;
  title: string;
  category: Category;
  weeklyTarget: number;
  nextStepBookmark: string;
  createdAt: string;
  logs: SessionLog[];
}

export interface TimelineEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  durationMinutes: SessionDuration;
  note: string;
  timestamp: number;
  hobbyId: string;
  hobbyTitle: string;
  category: Category;
  nextStepBookmark: string;
}

export const INITIAL_HOBBIES: Hobby[] = [
  {
    id: 'hobby-rust',
    title: 'Systems Programming in Rust',
    category: 'Tech',
    weeklyTarget: 3,
    nextStepBookmark: 'Implement Arc<Mutex<T>> worker pool in Chapter 20',
    createdAt: '2026-09-01',
    logs: [
      { id: 'log-r1', date: '2026-10-24', durationMinutes: 60, note: 'Chapter 19 concurrency primitives', timestamp: 1729746000000 },
      { id: 'log-r2', date: '2026-10-22', durationMinutes: 45, note: 'Smart pointers and Deref', timestamp: 1729573200000 },
      { id: 'log-r3', date: '2026-10-20', durationMinutes: 45, note: 'Mutex locking mechanics', timestamp: 1729400400000 }
    ]
  },
  {
    id: 'hobby-guitar',
    title: 'Acoustic Fingerpicking',
    category: 'Creative',
    weeklyTarget: 4,
    nextStepBookmark: 'Practice Bm to F barre transitions at 95 BPM',
    createdAt: '2026-09-10',
    logs: [
      { id: 'log-g1', date: '2026-10-24', durationMinutes: 30, note: 'Clean barre execution at 98 BPM', timestamp: 1729746000000 },
      { id: 'log-g2', date: '2026-10-22', durationMinutes: 30, note: 'Alternating thumb bass with melody sync', timestamp: 1729573200000 },
      { id: 'log-g3', date: '2026-10-19', durationMinutes: 30, note: 'Dust in the Wind fingerstyle pattern intro', timestamp: 1729314000000 }
    ]
  },
  {
    id: 'hobby-running',
    title: '5K Aerobic Base Building',
    category: 'Physical',
    weeklyTarget: 3,
    nextStepBookmark: 'Easy 30-minute Zone 2 jog + calf mobility routine',
    createdAt: '2026-08-15',
    logs: [
      { id: 'log-run1', date: '2026-10-16', durationMinutes: 30, note: 'Slow recovery 3.2km run around park', timestamp: 1729054800000 }
    ]
  },
  {
    id: 'hobby-japanese',
    title: 'Japanese Kanji & Grammar',
    category: 'Learning',
    weeklyTarget: 2,
    nextStepBookmark: 'Review Wanikani Level 14 vocabulary & Genki II Ch 18',
    createdAt: '2026-09-15',
    logs: [
      { id: 'log-j1', date: '2026-10-23', durationMinutes: 45, note: 'Wanikani 40 reviews + JLPT N4 grammar test', timestamp: 1729659600000 },
      { id: 'log-j2', date: '2026-10-21', durationMinutes: 30, note: 'Genki chapter 18 conditional forms', timestamp: 1729486800000 }
    ]
  },
  {
    id: 'hobby-photo',
    title: 'Analog 35mm Photography',
    category: 'Creative',
    weeklyTarget: 2,
    nextStepBookmark: 'Develop Kodak Tri-X 400 roll in D-76 (1:1 dilution)',
    createdAt: '2026-08-20',
    logs: [
      { id: 'log-p1', date: '2026-10-24', durationMinutes: 45, note: 'Street photography session at morning market', timestamp: 1729746000000 },
      { id: 'log-p2', date: '2026-10-21', durationMinutes: 30, note: 'Archival negative sleeve labeling', timestamp: 1729486800000 },
      { id: 'log-p3', date: '2026-10-20', durationMinutes: 60, note: 'Darkroom chemical preparation and test strips', timestamp: 1729400400000 }
    ]
  }
];
