import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../model/AuthContext";
import { PATHS } from "../../app/router/paths";

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) return children;

  return (
    <Navigate
      to={PATHS.LOGIN}
      replace
      state={{ from: location?.pathname || PATHS.HOME }}
    />
  );
}

