import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

// Navbar Component: Manages global navigation and user session state.

function Navbar() {
  // Global authentication data (Current user and logout action)
  const { user, logout } = useAuth();

  // Navigation tools to move between routes and identify current location
  const navigate = useNavigate();
  const location = useLocation();

  // Local state to toggle the user dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Checks if the given path matches the current active route.
  const checkActiveStatus = (path) => location.pathname === path;

  // Logic to clear session and redirect user to login.
  const handleUserLogout = () => {
    logout();
    navigate("/login");
  };

  // Closes menu and navigates to the profile editor.
  const navigateToProfile = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  return (
    // 'sticky top-0' keeps the navbar visible during scrolling. 'z-50' ensures it stays on top.
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* --- LEFT SECTION: BRAND & LINKS --- */}
          <div className="flex items-center gap-8">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 font-bold text-xl text-white hover:text-indigo-400 transition-colors"
            >
              <LayoutDashboard size={20} className="text-indigo-500" />
              <span>BizPilot</span>
            </Link>

            {/* Navigation links with conditional logic for active styling */}
            <div className="hidden md:flex items-center gap-5">
              {["clients", "products", "sales"].map((item) => (
                <Link
                  key={item}
                  to={`/${item}`}
                  className={`text-sm font-medium transition-colors capitalize ${
                    checkActiveStatus(`/${item}`)
                      ? "text-indigo-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* --- RIGHT SECTION: USER PROFILE --- */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full transition-all group"
            >
              <div className="bg-indigo-600 p-1.5 rounded-full text-white shadow-lg shadow-indigo-500/20">
                <User size={16} />
              </div>
              <span className="hidden sm:block text-gray-200 text-sm font-medium capitalize">
                {user?.full_name?.split(" ")[0] || "User"}
              </span>
              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* --- DROPDOWN LOGIC --- */}
            {isDropdownOpen && (
              <>
                {/* Overlay: Closes the dropdown when clicking the background */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                ></div>

                <div className="absolute right-0 mt-3 w-52 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in duration-150">
                  {/* Account Info Header */}
                  <div className="px-4 py-2 border-b border-gray-700 mb-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                      Account
                    </p>
                    <p className="text-sm text-gray-200 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={navigateToProfile}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <Settings size={16} className="text-gray-400" />
                    Edit Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleUserLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors border-t border-gray-700"
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
