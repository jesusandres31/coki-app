import { ClientResponseError, isTokenExpired } from "pocketbase";
import { pb } from "src/libs";

const AUTH_REFRESH_THRESHOLD_SECONDS = 7 * 24 * 60 * 60;
export const AUTH_REFRESH_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const AUTH_REFRESH_REQUEST_KEY = "auth_session_refresh";

let pendingRefresh: Promise<boolean> | null = null;

const isAuthenticationError = (error: unknown) =>
  error instanceof ClientResponseError &&
  (error.status === 401 || error.status === 403);

interface RefreshAuthOptions {
  force?: boolean;
}

/**
 * Renews the PocketBase auth token while the current token is still valid.
 * Network errors are intentionally ignored so an offline user isn't logged out.
 */
export const refreshAuth = ({ force = false }: RefreshAuthOptions = {}) => {
  if (pendingRefresh) return pendingRefresh;

  const token = pb.authStore.token;
  if (!token) return Promise.resolve(false);

  if (!pb.authStore.isValid) {
    pb.authStore.clear();
    return Promise.resolve(false);
  }

  if (!force && !isTokenExpired(token, AUTH_REFRESH_THRESHOLD_SECONDS)) {
    return Promise.resolve(false);
  }

  pendingRefresh = pb
    .collection("users")
    .authRefresh({
      expand: "role",
      requestKey: AUTH_REFRESH_REQUEST_KEY,
    })
    .then(() => true)
    .catch((error: unknown) => {
      if (isAuthenticationError(error)) {
        pb.authStore.clear();
      }

      return false;
    })
    .finally(() => {
      pendingRefresh = null;
    });

  return pendingRefresh;
};

export const cancelAuthRefresh = () => {
  pb.cancelRequest(AUTH_REFRESH_REQUEST_KEY);
};
