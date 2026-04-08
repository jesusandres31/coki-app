import { storageKey } from "src/config";

export const drawer = {
  set: (open: boolean) => {
    localStorage.setItem(storageKey.DRAWER, String(!open));
  },
  get: () => {
    return localStorage.getItem(storageKey.DRAWER) === "true";
  },
  remove: () => {
    localStorage.removeItem(storageKey.DRAWER);
  },
};
