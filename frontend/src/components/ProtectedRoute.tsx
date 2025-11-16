import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { routes } from "../utils/constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={routes.login} replace />;
  }

  return <>{children}</>;
}
