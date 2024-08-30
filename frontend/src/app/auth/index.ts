import { pb } from "src/libs";

export const getAccessToken = () => {
  return pb.authStore.token;
};

export const logout = () => {
  return pb.authStore.clear();
};
