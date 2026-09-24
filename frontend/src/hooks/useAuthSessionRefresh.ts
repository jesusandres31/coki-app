import { useEffect } from "react";
import {
  AUTH_REFRESH_CHECK_INTERVAL_MS,
  refreshAuth,
} from "src/app/auth/session";

export const useAuthSessionRefresh = () => {
  useEffect(() => {
    void refreshAuth({ force: true });

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshAuth();
      }
    };

    document.addEventListener("visibilitychange", refreshIfVisible);
    const intervalId = window.setInterval(
      () => void refreshAuth(),
      AUTH_REFRESH_CHECK_INTERVAL_MS,
    );

    return () => {
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.clearInterval(intervalId);
    };
  }, []);
};
