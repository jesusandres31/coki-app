import { pb } from "src/libs";
import { cancelAuthRefresh } from "./session";

export const getAccessToken = () => {
  return pb.authStore.token;
};

export const logout = () => {
  cancelAuthRefresh();
  return pb.authStore.clear();
};
