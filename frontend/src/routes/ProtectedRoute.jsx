import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/common/Loading";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading text="Checking authentication..." />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;