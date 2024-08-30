import { useLocation, useNavigate } from "react-router-dom";
import { noLayoutRoutes } from "src/config";

export const useRouter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGoTo = (path: string) => {
    navigate(path);
  };

  const route = location.pathname;

  const isLayoutRoutes = !noLayoutRoutes.find((r) => r === route);

  return {
    handleGoTo,
    route,
    isLayoutRoutes,
  };
};
