import { useState } from "react"; // Añadido para el dropdown
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Estado para abrir/cerrar el menú

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    setIsOpen(false); // Cerramos el menú antes de navegar
    navigate("/profile");
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 text-white">
          {/* Left: brand + navigation links */}
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="font-bold text-lg hover:text-indigo-400 transition-colors"
            >
              BizPilot
            </Link>
            <Link
              to="/clients"
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

          {/* Right: User Section con Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors group"
            >
              {/* Icono de usuario circular */}
              <div className="bg-gray-700 p-1.5 rounded-full group-hover:bg-indigo-600 transition-colors">
                <User size={18} className="text-gray-200" />
              </div>

              <span className="text-gray-300 text-sm font-medium capitalize">
                {user?.full_name}
              </span>

              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Menú Desplegable (Dropdown) */}
            {isOpen && (
              <>
                {/* Capa para cerrar al hacer clic fuera */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsOpen(false)}
                ></div>

                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-20 py-1 overflow-hidden">
                  {/* Opción Edit Profile */}

                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <Settings size={16} />
                    Edit Profile
                  </button>

                  {/* Opción Logout */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors border-t border-gray-700"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
