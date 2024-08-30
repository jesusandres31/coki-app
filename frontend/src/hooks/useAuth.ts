import { useNavigate } from "react-router-dom";
import { authApi } from "src/app/services/authService";
import { logout } from "src/app/auth";
import { AppRoutes, conf, key } from "src/config";
import { SignInReq, SignUpRes } from "src/interfaces";
import { pb } from "src/libs";
import { ls } from "src/utils/localStorage";

export const useAuth = () => {
  const navigate = useNavigate();
  const [signIn, { isLoading: isSigningIn }] = authApi.useSignInMutation();

  const isLoggedIn = pb.authStore.isValid;

  const authUser = pb.authStore.model as SignUpRes;

  const setCurrentLocation = (location: string) =>
    ls.set(key.LOCATION, location);

  const currentLocation = ls.get(key.LOCATION);

  const setCurrentCanteen = (canteen: string) => ls.set(key.CANTEEN, canteen);

  const currentCanteen = ls.get(key.CANTEEN);

  const handleSignIn = async (data: SignInReq) => {
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
    currentCanteen,
    currentLocation,
    setCurrentCanteen,
    setCurrentLocation,
  };
};
