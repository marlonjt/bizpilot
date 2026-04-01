import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Explicitly redirect after logout
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 text-white">
          {/* Left: brand + navigation links */}
          <div className="flex items-center gap-6">
            <h1 className="font-bold text-lg">BizPilot</h1>
            <Link
              to="/dashboard"
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Clients
            </Link>
            <Link
              to="/products"
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Products
            </Link>
            <Link
              to="/sales"
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              Sales
            </Link>
          </div>

          {/* Right: user name + logout button */}
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">{user?.full_name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
