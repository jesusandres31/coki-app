export const parseJsonValue = <T,>(value: unknown): T | null => {
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

export const toNumber = (value: unknown) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

export const getRecordDisplayName = (value: unknown, fallback = "-") => {
  if (typeof value === "string") {
    const parsed = parseJsonValue<{ name?: string }>(value);
    return parsed?.name || value || fallback;
  }

  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === "string" ? name : fallback;
  }

  return fallback;
};
