import { useCallback, useEffect, useRef, useState } from "react";

type PendingSessionStorageCleanup = {
  key: string;
  timerId: number;
};

interface UseSessionStorageDraftOptions<T> {
  key: string;
  value: T;
  enabled?: boolean;
  ready?: boolean;
  onHydrate: (value: T) => void;
  getFallbackValue?: () => T | null;
}

const pendingCleanupByKey = new Map<string, PendingSessionStorageCleanup>();

export const buildSessionStorageKey = (prefix: string, context: string) =>
  `${prefix}:${context}`;

export const parseSessionStorageJson = <T,>(value: unknown): T | null => {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") return value as T;
  return null;
};

export const getSessionStorageJson = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;

  try {
    return parseSessionStorageJson<T>(window.sessionStorage.getItem(key));
  } catch {
    return null;
  }
};

export const setSessionStorageJson = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Draft persistence is a convenience; a full or blocked storage should not break the form.
  }
};

export const removeSessionStorageItem = (key: string) => {
  if (typeof window === "undefined") return;

  const pendingCleanup = pendingCleanupByKey.get(key);
  if (pendingCleanup) {
    window.clearTimeout(pendingCleanup.timerId);
    pendingCleanupByKey.delete(key);
  }

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failures for the same reason as setSessionStorageJson.
  }
};

const scheduleSessionStorageCleanup = (key: string) => {
  if (typeof window === "undefined") return;
  if (pendingCleanupByKey.has(key)) return;

  const pendingCleanup: PendingSessionStorageCleanup = {
    key,
    timerId: window.setTimeout(() => {
      removeSessionStorageItem(key);
    }, 0),
  };

  pendingCleanupByKey.set(key, pendingCleanup);
};

export function useSessionStorageDraft<T>({
  key,
  value,
  enabled = true,
  ready = true,
  onHydrate,
  getFallbackValue,
}: UseSessionStorageDraftOptions<T>) {
  const [hydratedKey, setHydratedKey] = useState("");
  const hydratedKeyRef = useRef("");
  const latestKeyRef = useRef("");
  const pageUnloadingRef = useRef(false);

  const clearDraft = useCallback(() => {
    if (!key) return;

    removeSessionStorageItem(key);
    hydratedKeyRef.current = "";
    setHydratedKey("");
  }, [key]);

  useEffect(() => {
    const previousKey = latestKeyRef.current;

    if (previousKey && previousKey !== key) {
      removeSessionStorageItem(previousKey);
    }

    latestKeyRef.current = key;

    if (key && pendingCleanupByKey.has(key)) {
      const pendingCleanup = pendingCleanupByKey.get(key);
      if (pendingCleanup) {
        window.clearTimeout(pendingCleanup.timerId);
        pendingCleanupByKey.delete(key);
      }
    }
  }, [key]);

  useEffect(() => {
    const markPageUnloading = () => {
      pageUnloadingRef.current = true;
    };

    window.addEventListener("beforeunload", markPageUnloading);
    window.addEventListener("pagehide", markPageUnloading);

    return () => {
      window.removeEventListener("beforeunload", markPageUnloading);
      window.removeEventListener("pagehide", markPageUnloading);
    };
  }, []);

  useEffect(() => {
    return () => {
      const latestKey = latestKeyRef.current;
      if (!latestKey || pageUnloadingRef.current) return;

      scheduleSessionStorageCleanup(latestKey);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !key) {
      hydratedKeyRef.current = "";
      setHydratedKey("");
      return;
    }

    if (hydratedKeyRef.current === key) return;
    if (!ready) return;

    const draft = getSessionStorageJson<T>(key);
    const nextValue = draft ?? getFallbackValue?.() ?? null;

    if (nextValue !== null) {
      onHydrate(nextValue);
    }

    hydratedKeyRef.current = key;
    setHydratedKey(key);
  }, [enabled, getFallbackValue, key, onHydrate, ready]);

  useEffect(() => {
    if (!enabled || !key || hydratedKey !== key || !ready) return;

    setSessionStorageJson(key, value);
  }, [enabled, hydratedKey, key, ready, value]);

  return {
    clearDraft,
    hydratedKey,
  };
}
