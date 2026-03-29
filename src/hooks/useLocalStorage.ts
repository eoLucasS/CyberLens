'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * React hook that mirrors a localStorage entry as React state.
 *
 * - SSR-safe: initialises with `initialValue` on the server and during the
 *   first render, then hydrates from localStorage after mount.
 * - The setter accepts either a new value or an updater function, mirroring
 *   the React `useState` setter API.
 *
 * @param key          The localStorage key to read from / write to.
 * @param initialValue The value used when the key is absent or on the server.
 * @returns            A `[value, setValue]` tuple.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialise with `initialValue` so the first render is SSR-safe.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // After mount, hydrate the state from localStorage (client-only).
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // Keep the initial value when the stored data cannot be parsed.
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch {
          // localStorage may be full or restricted; fail silently.
        }
        return valueToStore;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
