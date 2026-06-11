import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../model/AuthContext";
import { PATHS } from "../../app/router/paths";

export default function RequireAuth({ children, role }) {
  const { isAuthenticated, userRole, bootstrapped } = useAuth();
  const location = useLocation();

  if (!bootstrapped) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm font-semibold text-slate-500">
        Loading your session...
      </div>
    );
  }

  if (isAuthenticated && (!role || userRole === role)) return children;

  if (isAuthenticated && role && userRole !== role) {
    return <Navigate to={PATHS.HOME} replace />;
  }

  return (
    <Navigate
      to={PATHS.LOGIN}
      replace
      state={{ from: location?.pathname || PATHS.HOME }}
    />
  );
}

