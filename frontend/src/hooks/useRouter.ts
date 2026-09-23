import { useCallback, useMemo } from "react";
import {
  NavigateOptions,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { noLayoutRoutes } from "src/config";

export interface NavigationOrigin {
  path: string;
  label?: string;
}

export interface NavigationState extends Record<string, unknown> {
  navigationOrigin?: NavigationOrigin;
}

const isInternalPath = (path: unknown): path is string =>
  typeof path === "string" && path.startsWith("/") && !path.startsWith("//");

const getNavigationState = (state: unknown): NavigationState =>
  state && typeof state === "object" ? (state as NavigationState) : {};

const getNavigationOrigin = (state: unknown): NavigationOrigin | undefined => {
  const origin = getNavigationState(state).navigationOrigin;

  return origin && isInternalPath(origin.path) ? origin : undefined;
};

export const useRouter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGoTo = useCallback(
    (path: string, options?: NavigateOptions) => {
      navigate(path, options);
    },
    [navigate],
  );

  const currentPath = `${location.pathname}${location.search}${location.hash}`;
  const navigationOrigin = useMemo(
    () => getNavigationOrigin(location.state),
    [location.state],
  );
  const navigationState = useMemo<NavigationState>(
    () => getNavigationState(location.state),
    [location.state],
  );

  /**
   * Opens a route while recording the current page as its origin. Detail pages
   * can use this state to return to whichever list or workflow opened them.
   */
  const handleGoToFromCurrent = useCallback(
    (path: string, originLabel?: string) => {
      navigate(path, {
        state: {
          ...getNavigationState(location.state),
          navigationOrigin: {
            path: currentPath,
            label: originLabel,
          },
        } satisfies NavigationState,
      });
    },
    [currentPath, location.state, navigate],
  );

  const handleGoToOrigin = useCallback(
    (fallbackPath: string) => {
      navigate(navigationOrigin?.path || fallbackPath);
    },
    [navigate, navigationOrigin?.path],
  );

  const route = location.pathname;

  const isLayoutRoutes = !noLayoutRoutes.find((r) => r === route);

  return {
    handleGoTo,
    handleGoToFromCurrent,
    handleGoToOrigin,
    navigationOrigin,
    navigationState,
    route,
    isLayoutRoutes,
  };
};
