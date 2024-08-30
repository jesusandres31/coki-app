import { key } from "src/config";

export const drawer = {
  set: (open: boolean) => {
    localStorage.setItem(key.DRAWER, String(!open));
  },
  get: () => {
    return localStorage.getItem(key.DRAWER) === "true";
  },
  remove: () => {
    localStorage.removeItem(key.DRAWER);
  },
};
