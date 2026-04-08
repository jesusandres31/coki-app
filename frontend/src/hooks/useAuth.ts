import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "src/app/services/authService";
import { logout } from "src/app/auth";
import { AppRoutes, configKey } from "src/config";
import { SignInRequest, SignUpResponse } from "src/interfaces";
import { pb } from "src/libs";
import { RolesResponse, UsersResponse } from "src/types/pocketbase-types";

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
      if (!authUser?.role) {
        debug("No role id on auth user");
        if (!ignore) setRoleName("");
        return;
      }

      const expandedName = authUser.expand?.role?.name;
      if (expandedName) {
        debug("Using expanded role from auth store", expandedName);
        if (!ignore) setRoleName(expandedName);
        return;
      }

      try {
        debug("Trying direct roles.getOne()", { roleId: authUser.role });
        const role = await pb
          .collection("roles")
          .getOne<RolesResponse>(authUser.role);
        debug("roles.getOne() success", role.name);
        if (!ignore) setRoleName(role.name);
        return;
      } catch (error) {
        debug("roles.getOne() failed", error);
      }

      try {
        debug("Trying users.getOne({ expand: role })", { userId: authUser.id });
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
      } catch (error) {
        debug("users.getOne({ expand: role }) failed", error);
      }

      debug("Role name could not be resolved");
      if (!ignore) setRoleName("");
    };

    loadRoleName();

    return () => {
      ignore = true;
    };
  }, [authUser?.role, authUser?.expand?.role?.name]);

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
