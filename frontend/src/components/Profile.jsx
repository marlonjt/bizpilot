import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Usamos tu contexto
import api from "../services/api";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, setUser } = useAuth(); // Para obtener y actualizar el nombre globalmente
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setMessage({ type: "error", text: "Passwords do not match" });
    }

    try {
      const response = await api.put("/auth/profile", {
        full_name: formData.full_name,
        password: formData.password || undefined,
      });

      setUser(response.data); // Actualiza el nombre en el Navbar inmediatamente
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update profile" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-md mx-auto mt-12 p-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-indigo-400 text-xl font-bold">Edit User</h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>
        {message.text && (
          <div
            className={`p-3 mb-4 rounded ${message.type === "error" ? "bg-red-900/50 text-red-200" : "bg-green-900/50 text-green-200"}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="border-t border-gray-800 pt-5">
            <p className="text-xs text-gray-500 mb-4 text-center">
              Leave blank to keep current password
            </p>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-500/20">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
