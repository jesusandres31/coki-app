import { Navigate } from "react-router-dom";
import { AppRoutes } from "src/config";
import { useAuth } from "src/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to={AppRoutes.Login} />;
  }
  return children;
};

export default ProtectedRoute;
