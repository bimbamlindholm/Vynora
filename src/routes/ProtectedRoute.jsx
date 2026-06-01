import { Navigate, useLocation } from "react-router-dom";
import { getRedirectPathByRole, useAuth } from "../contexts/AuthContext";
import SkeletonLoader from "../components/SkeletonLoader";

function ProtectedRoute({ allowedRoles, children }) {
  const { loading, role, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (user && !role) {
    return <Navigate to="/complete-registration" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getRedirectPathByRole(role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
