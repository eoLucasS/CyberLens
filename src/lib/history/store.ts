/**
 * History store for analysis entries.
 *
 * Stores up to MAX_HISTORY_ENTRIES analyses in localStorage under
 * STORAGE_KEYS.HISTORY. Operations are defensive: every read validates
 * structure, every write respects the FIFO cap and quota limits.
 *
 * Security posture:
 * - Zero trust on what comes from localStorage (schema validated on read)
 * - Hard caps on entry size and count (anti-DoS)
 * - Silent recovery on quota exceeded (drops oldest, retries)
 * - No server transmission; everything stays in the browser
 */

import {
  STORAGE_KEYS,
  getStorageItem,
  removeStorageItem,
} from '@/lib/utils/storage';
import type {
  AnalysisHistoryEntry,
  AnalysisResult,
  Classification,
} from '@/types/analysis';

/** Maximum number of entries retained. Oldest are evicted first. */
export const MAX_HISTORY_ENTRIES = 10;

/** Hard cap for a single entry once JSON-stringified. Protects quota. */
export const MAX_ENTRY_BYTES = 50_000;

/** Hard cap for text fields to prevent oversized payloads (xss/dos). */
const MAX_STRING_FIELD_LENGTH = 20_000;

/** Valid classifications accepted when validating an entry from storage. */
const VALID_CLASSIFICATIONS: readonly Classification[] = [
  'Baixa Aderência',
  'Aderência Parcial',
  'Alta Aderência',
  'Aderência Excelente',
];

// ─── Type guards ──────────────────────────────────────────────────────────────

function isString(value: unknown, maxLength = MAX_STRING_FIELD_LENGTH): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

function isFiniteNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function isAnalysisResultShape(value: unknown): value is AnalysisResult {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;

  if (!isFiniteNumber(v.score, 0, 100)) return false;
  if (!isString(v.classification, 64)) return false;
  if (!(VALID_CLASSIFICATIONS as readonly string[]).includes(v.classification)) {
    return false;
  }
  // Summary may be empty on very old cached entries; tolerate absence
  if (v.executiveSummary !== undefined && typeof v.executiveSummary !== 'string') {
    return false;
  }
  if (!Array.isArray(v.matchedSkills)) return false;
  if (!Array.isArray(v.gaps)) return false;
  if (!Array.isArray(v.missingKeywords)) return false;
  if (!Array.isArray(v.studyPlan)) return false;
  if (typeof v.experienceAnalysis !== 'object' || v.experienceAnalysis === null) {
    return false;
  }
  return true;
}

/**
 * Strict type guard for a single history entry. Rejects anything tampered,
 * oversized or malformed without throwing.
 */
export function isValidHistoryEntry(value: unknown): value is AnalysisHistoryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;

  if (!isString(v.id, 128)) return false;
  if (!isString(v.savedAt, 64)) return false;
  if (!isString(v.jobTitle, 256)) return false;
  if (v.jobCompany !== undefined && !isString(v.jobCompany, 256)) return false;
  if (!isString(v.resumeFileName, 256)) return false;
  if (!isFiniteNumber(v.score, 0, 100)) return false;
  if (!isString(v.classification, 64)) return false;
  if (v.provider !== undefined && !isString(v.provider, 128)) return false;
  if (!isAnalysisResultShape(v.result)) return false;

  return true;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function readRaw(): unknown {
  return getStorageItem<unknown>(STORAGE_KEYS.HISTORY, null);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function sortByMostRecentFirst(entries: AnalysisHistoryEntry[]): AnalysisHistoryEntry[] {
  return [...entries].sort((a, b) => {
    const ta = Date.parse(a.savedAt);
    const tb = Date.parse(b.savedAt);
    const safeA = Number.isFinite(ta) ? ta : 0;
    const safeB = Number.isFinite(tb) ? tb : 0;
    return safeB - safeA;
  });
}

function estimateBytes(entry: AnalysisHistoryEntry): number {
  try {
    return JSON.stringify(entry).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

/** Generates a UUID using the platform API with a weak fallback. */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random. Not cryptographically strong, but sufficient
  // as a local identifier in a single-user context.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Persists the list to localStorage. If the quota is exceeded, drops the
 * oldest entries one by one and retries, up to the number of available
 * entries. Returns true on success, false if even a single entry cannot fit.
 */
function writeList(entries: AnalysisHistoryEntry[]): boolean {
  if (typeof window === 'undefined') return false;

  let remaining = [...entries];

  while (remaining.length > 0) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(remaining));
      return true;
    } catch {
      // Quota exceeded or storage blocked. Drop oldest and retry.
      remaining = sortByMostRecentFirst(remaining).slice(0, remaining.length - 1);
    }
  }

  // Could not persist anything; clean up to avoid stale data.
  try {
    window.localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch {
    // Ignore.
  }
  return false;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the current history list, sorted by most recent first.
 * Any tampered or malformed entries are filtered out silently.
 */
export function getHistory(): AnalysisHistoryEntry[] {
  const raw = readRaw();
  if (!isArray(raw)) return [];

  const valid: AnalysisHistoryEntry[] = [];
  for (const item of raw) {
    if (isValidHistoryEntry(item)) valid.push(item);
  }
  return sortByMostRecentFirst(valid);
}

/** Returns a specific entry by id, or null if not found or invalid. */
export function getHistoryEntry(id: string): AnalysisHistoryEntry | null {
  if (typeof id !== 'string' || id.length === 0 || id.length > 128) return null;
  const entries = getHistory();
  return entries.find((e) => e.id === id) ?? null;
}

/**
 * Adds a new entry, enforcing the FIFO cap of MAX_HISTORY_ENTRIES.
 * Returns the new entry on success, or null if the entry could not be
 * persisted (quota full even after eviction).
 */
export function addToHistory(
  data: Omit<AnalysisHistoryEntry, 'id' | 'savedAt'>,
): AnalysisHistoryEntry | null {
  const entry: AnalysisHistoryEntry = {
    ...data,
    id: generateId(),
    savedAt: new Date().toISOString(),
  };

  // Defensive size check before touching storage
  if (estimateBytes(entry) > MAX_ENTRY_BYTES) {
    return null;
  }

  if (!isValidHistoryEntry(entry)) {
    return null;
  }

  const current = getHistory();
  const next = sortByMostRecentFirst([entry, ...current]).slice(0, MAX_HISTORY_ENTRIES);

  const ok = writeList(next);
  return ok ? entry : null;
}

/** Removes a single entry by id. Silent no-op if id is not found. */
export function removeFromHistory(id: string): void {
  if (typeof id !== 'string' || id.length === 0) return;
  const current = getHistory();
  const next = current.filter((e) => e.id !== id);
  if (next.length === current.length) return;
  if (next.length === 0) {
    removeStorageItem(STORAGE_KEYS.HISTORY);
    return;
  }
  writeList(next);
}

/** Removes all history entries. */
export function clearHistory(): void {
  removeStorageItem(STORAGE_KEYS.HISTORY);
}

/** Maximum length accepted for a user-edited job title. */
export const MAX_EDITABLE_TITLE_LENGTH = 160;

/**
 * Updates the job title (and optionally the company) of an existing entry.
 * Safely normalizes the input and enforces length bounds.
 * Returns the updated entry on success, or null if the id is invalid,
 * the new title is empty after trimming, or the write fails.
 */
export function updateHistoryEntryTitle(
  id: string,
  newTitle: string,
  newCompany?: string,
): AnalysisHistoryEntry | null {
  if (typeof id !== 'string' || id.length === 0) return null;
  if (typeof newTitle !== 'string') return null;

  const trimmedTitle = newTitle.trim().slice(0, MAX_EDITABLE_TITLE_LENGTH);
  if (trimmedTitle.length === 0) return null;

  const trimmedCompany =
    typeof newCompany === 'string' && newCompany.trim().length > 0
      ? newCompany.trim().slice(0, MAX_EDITABLE_TITLE_LENGTH)
      : undefined;

  const current = getHistory();
  let updated: AnalysisHistoryEntry | null = null;

  const next = current.map((e) => {
    if (e.id !== id) return e;
    updated = {
      ...e,
      jobTitle: trimmedTitle,
      jobCompany: trimmedCompany,
    };
    return updated;
  });

  if (updated === null) return null;

  const ok = writeList(next);
  return ok ? updated : null;
}
