import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "src/app/services/authService";
import { logout } from "src/app/auth";
import { AppRoutes, configKey } from "src/config";
import { SignInRequest, SignUpResponse } from "src/interfaces";
import { pb } from "src/libs";
import { RolesResponse, UsersResponse } from "src/types/pocketbase-types";

const isPocketBaseId = (value: unknown): value is string =>
  typeof value === "string" && /^[a-z0-9]{15}$/i.test(value);

export const useAuth = () => {
  const navigate = useNavigate();
  const [signIn, { isLoading: isSigningIn }] = authApi.useSignInMutation();
  const [roleName, setRoleName] = useState("");

  const isLoggedIn = pb.authStore.isValid;
  const authUser = pb.authStore.model as SignUpResponse;

  useEffect(() => {
    let ignore = false;
    const isDev = import.meta.env.DEV;

    const debug = (message: string, payload?: unknown) => {
      if (isDev) {
        console.debug(`[useAuth] ${message}`, payload ?? "");
      }
    };

    const loadRoleName = async () => {
      if (!isLoggedIn || !authUser?.id) {
        debug("No active auth user");
        if (!ignore) setRoleName("");
        return;
      }

      const expandedName = authUser.expand?.role?.name || "";
      if (expandedName) {
        debug("Using expanded role from auth store", expandedName);
        if (!ignore) setRoleName(expandedName);
        return;
      }

      if (!isPocketBaseId(authUser.role)) {
        debug("Role value is not a record id; using role text directly", {
          role: authUser.role,
        });
        if (!ignore) setRoleName(String(authUser.role || ""));
        return;
      }

      try {
        debug("Validating current user session with users.getOne()", {
          userId: authUser.id,
        });

        const userWithExpand = await pb
          .collection("users")
          .getOne<UsersResponse<{ role: RolesResponse }>>(authUser.id, {
            expand: "role",
          });
        const expandedRoleName = userWithExpand.expand?.role?.name;
        if (expandedRoleName) {
          debug("users.getOne expanded role success", expandedRoleName);
          if (!ignore) setRoleName(expandedRoleName);
          return;
        }

        const roleId = userWithExpand.role;
        if (!isPocketBaseId(roleId)) {
          if (!ignore) setRoleName(String(roleId || ""));
          return;
        }

        debug("Trying roles.getOne() with validated role id", { roleId });
        const role = await pb.collection("roles").getOne<RolesResponse>(roleId);
        if (!ignore) setRoleName(role.name);
        return;
      } catch (error: any) {
        debug("Role resolution failed", error);

        if (error?.status === 404) {
          debug("Clearing stale auth session after 404", {
            userId: authUser.id,
          });
          logout();
          if (!ignore) {
            setRoleName("");
          }
          navigate(AppRoutes.Login);
          return;
        }
      }

      debug("Role name could not be resolved");
      if (!ignore) setRoleName("");
    };

    loadRoleName();

    return () => {
      ignore = true;
    };
  }, [authUser?.id, authUser?.role, authUser?.expand?.role?.name, isLoggedIn, navigate]);

  const handleSignIn = async (data: SignInRequest) => {
    await signIn(data).unwrap();
    navigate(configKey.LANDING_PAGE);
  };

  const handleSignOut = async () => {
    logout();
    navigate(AppRoutes.Login);
  };

  return {
    handleSignIn,
    handleSignOut,
    isSigningIn,
    isLoggedIn,
    authUser,
    roleName,
  };
};
