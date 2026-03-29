/**
 * Type-safe localStorage utilities with SSR safety and CyberLens-scoped key management.
 */

/** Constant keys used by CyberLens to read/write localStorage. */
export const STORAGE_KEYS = {
  SETTINGS: 'cyberlens_settings',
  CONSENT: 'cyberlens_consent',
  LAST_ANALYSIS: 'cyberlens_last_analysis',
} as const;

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
