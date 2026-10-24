// ponytail: localStorage client persistence; upgrade to Cloud Firestore if multi-user sync is needed.
import type { Hobby, SessionLog } from './types.ts';

export const STORAGE_KEY = 'cadence_hobbies_v1';

export function formatLocalDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function loadHobbies(seed: Hobby[]): Hobby[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : seed;
  } catch {
    return seed;
  }
}

export function saveHobbies(hobbies: Hobby[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hobbies));
    }
  } catch {
    // Quota exceeded or private browsing
  }
}

export function exportBackup(hobbies: Hobby[]): void {
  const blob = new Blob([JSON.stringify(hobbies, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cadence-backup-${formatLocalDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackup(jsonString: string): Hobby[] {
  const data = JSON.parse(jsonString);
  if (!Array.isArray(data)) {
    throw new Error('Backup must be an array of hobbies');
  }
  for (const h of data) {
    if (!h.id || !h.title || !h.category || typeof h.weeklyTarget !== 'number' || !Array.isArray(h.logs)) {
      throw new Error('Invalid hobby data format');
    }
  }
  return data as Hobby[];
}

export function get28DayWindow(referenceDate: Date = new Date()): string[] {
  const dates: string[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - i);
    dates.push(formatLocalDate(d));
  }
  return dates;
}

export function getWeeklyLogCount(logs: SessionLog[], referenceDate: Date = new Date()): number {
  const day = referenceDate.getDay() || 7; // ISO week (Mon=1 ... Sun=7)
  const monday = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - day + 1);
  const sunday = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - day + 7);
  const mondayStr = formatLocalDate(monday);
  const sundayStr = formatLocalDate(sunday);
  return logs.filter(l => l.date >= mondayStr && l.date <= sundayStr).length;
}

export function getStatus(logs: SessionLog[], referenceDate: Date = new Date()): { label: string; isGreen: boolean } {
  if (logs.length === 0) {
    return { label: 'Needs Attention — inactive', isGreen: false };
  }
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const lastDate = sorted[0].date;
  const todayStr = formatLocalDate(referenceDate);

  if (lastDate === todayStr) {
    return { label: 'On Track — Active Today', isGreen: true };
  }

  const [ly, lm, ld] = lastDate.split('-').map(Number);
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const lastTime = new Date(ly, lm - 1, ld).getTime();
  const todayTime = new Date(ty, tm - 1, td).getTime();
  const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { label: 'On Track — Active Today', isGreen: true };
  }
  if (diffDays === 1) {
    return { label: 'On Track — Active Yesterday', isGreen: true };
  }
  if (diffDays < 7) {
    return { label: `On Track — ${diffDays}d ago`, isGreen: true };
  }
  return { label: `Needs Attention — ${diffDays}d inactive`, isGreen: false };
}
