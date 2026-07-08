const NAMESPACE = 'kotoba-do';

/** Reads a namespaced key from localStorage. Falls back silently if storage is unavailable (private mode, quota, SSR). */
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`${NAMESPACE}:${key}`);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(`${NAMESPACE}:${key}`, JSON.stringify(value));
  } catch {
    // Storage unavailable — app still works for the session, just won't persist.
  }
}

export function clearStorage(key: string): void {
  try {
    window.localStorage.removeItem(`${NAMESPACE}:${key}`);
  } catch {
    // ignore
  }
}
