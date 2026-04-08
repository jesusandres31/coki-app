import { useNavigate } from "react-router-dom";
import { authApi } from "src/app/services/authService";
import { logout } from "src/app/auth";
import { AppRoutes, configKey } from "src/config";
import { SignInRequest, SignUpResponse } from "src/interfaces";
import { pb } from "src/libs";

export const useAuth = () => {
  const navigate = useNavigate();
  const [signIn, { isLoading: isSigningIn }] = authApi.useSignInMutation();

  const isLoggedIn = pb.authStore.isValid;

  const authUser = pb.authStore.model as SignUpResponse;

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
  };
};
