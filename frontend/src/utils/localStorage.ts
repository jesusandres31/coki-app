export const ls = {
  set: (key: string, value: string) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get: (key: string, defaultValue?: string) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  },
};
