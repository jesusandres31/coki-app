import { useNavigate } from "react-router-dom";
import { authApi } from "src/app/services/authService";
import { logout } from "src/app/auth";
import { AppRoutes, conf, key } from "src/config";
import { SignInRequest, SignUpResponse } from "src/interfaces";
import { pb } from "src/libs";
import { ls } from "src/utils/localStorage";

export const useAuth = () => {
  const navigate = useNavigate();
  const [signIn, { isLoading: isSigningIn }] = authApi.useSignInMutation();

  const isLoggedIn = pb.authStore.isValid;

  const authUser = pb.authStore.model as SignUpResponse;

  const setCurrentStore = (store: string) => ls.set(key.STORE, store);

  const currentStore = ls.get(key.STORE);

  const handleSignIn = async (data: SignInRequest) => {
    await signIn(data).unwrap();
    navigate(conf.LANDING_PAGE);
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
    currentStore,
    setCurrentStore,
  };
};
