/**
 * Type-safe localStorage utilities with SSR safety and CyberLens-scoped key management.
 */

/** Constant keys used by CyberLens to read/write localStorage. */
export const STORAGE_KEYS = {
  SETTINGS: 'cyberlens_settings',
  CONSENT: 'cyberlens_consent',
  RESUME_CACHE: 'cyberlens_resume_cache',
  HISTORY: 'cyberlens_history',
} as const;

/**
 * Cached resume data persisted between sessions so the user does not need
 * to re-upload the same file to analyze multiple job descriptions.
 * Only the extracted text is stored, never the PDF binary.
 */
export interface CachedResume {
  /** Original file name for display purposes. */
  fileName: string;
  /** File size in bytes, for display purposes. */
  fileSize: number;
  /** Plain text extracted from the PDF (or OCR output). */
  text: string;
  /** ISO 8601 timestamp of when the extraction happened. */
  savedAt: string;
  /** True when the text came from OCR and may contain errors. */
  isOcr: boolean;
}

/** Hard cap on cached resume text length. Protects against tampered localStorage. */
export const MAX_CACHED_RESUME_TEXT_LENGTH = 500_000;

/** Hard cap on cached file name length. */
const MAX_CACHED_FILE_NAME_LENGTH = 256;

/**
 * Type guard that validates a value read from localStorage is a well-formed
 * CachedResume. Protects the app against tampered or corrupted cache entries
 * without throwing.
 */
export function isValidCachedResume(value: unknown): value is CachedResume {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;

  if (typeof v.fileName !== 'string' || v.fileName.length === 0) return false;
  if (v.fileName.length > MAX_CACHED_FILE_NAME_LENGTH) return false;

  if (typeof v.fileSize !== 'number' || !Number.isFinite(v.fileSize)) return false;
  if (v.fileSize < 0) return false;

  if (typeof v.text !== 'string' || v.text.length === 0) return false;
  if (v.text.length > MAX_CACHED_RESUME_TEXT_LENGTH) return false;

  if (typeof v.savedAt !== 'string') return false;
  if (typeof v.isOcr !== 'boolean') return false;

  return true;
}

/**
 * Reads and JSON-parses an item from localStorage.
 * Returns `fallback` when running on the server, when the key is absent,
 * or when the stored value cannot be parsed.
 */
export function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * JSON-stringifies `value` and writes it to localStorage under `key`.
 * Silently no-ops on the server or when storage is unavailable/full.
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be full or blocked by the browser; fail silently.
  }
}

/**
 * Removes a single item from localStorage by key.
 * Silently no-ops on the server or when storage is unavailable.
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore errors; storage may not be accessible.
  }
}

/**
 * Removes every localStorage entry whose key starts with the "cyberlens_" prefix.
 * Does not touch entries belonging to other applications.
 */
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key !== null && key.startsWith('cyberlens_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore errors; storage may not be accessible.
  }
}
