import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Layout route that protects all nested routes.
// While auth state is loading, shows a spinner to prevent flash of redirect.
// If authenticated → renders child routes via <Outlet />.
// If not authenticated → redirects to /login.
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
