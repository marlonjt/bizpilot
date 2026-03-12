import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 text-white">
          <h1>Bizpilot</h1>
          <Link to="/products" className="text-gray-300 hover:text-white">
            Productos
          </Link>
          <Link to="/dashboard" className="text-gray-300 hover:text-white">
            Clientes
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 first-letter:uppercase">
              {user?.full_name}
            </span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
