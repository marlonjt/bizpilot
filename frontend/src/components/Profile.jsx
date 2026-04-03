import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

//Profile: Component to manage the current user's account settings.
//Handles name updates and password changes.
function Profile() {
  const { user, setUser } = useAuth(); // Global auth context
  const navigate = useNavigate();

  // --- FORM STATE ---
  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || "",
    newPassword: "",
    confirmPassword: "",
  });

  // --- UI FEEDBACK STATE ---
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  // Validates and sends the profile updates to the API.
  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    setStatusMessage({ type: "", text: "" });

    // Validation: Check if passwords match if a new one is provided
    if (
      profileData.newPassword &&
      profileData.newPassword !== profileData.confirmPassword
    ) {
      return setStatusMessage({
        type: "error",
        text: "Passwords do not match.",
      });
    }

    setIsUpdating(true);

    try {
      // API request to update profile details
      const response = await api.put("/auth/profile", {
        full_name: profileData.fullName,
        password: profileData.newPassword || undefined, // Only send if not empty
      });

      // Update the global user state so the Navbar reflects the change
      setUser(response.data);
      setStatusMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: "Error: Could not save changes.",
      });
      console.error("Profile Update Error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <Navbar />

      <main className="max-w-md mx-auto mt-16 p-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-indigo-400 text-2xl font-bold">
              User Settings
            </h2>
            <p className="text-gray-500 text-sm">
              Update your personal information
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Feedback Alert */}
        {statusMessage.text && (
          <div
            className={`p-4 mb-6 rounded-lg border ${
              statusMessage.type === "error"
                ? "bg-red-500/10 border-red-500/50 text-red-400"
                : "bg-green-500/10 border-green-500/50 text-green-400"
            } text-sm font-medium`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          {/* Full Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={profileData.fullName}
              onChange={(e) =>
                setProfileData({ ...profileData, fullName: e.target.value })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Your full name"
            />
          </div>

          {/* Password Section */}
          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
              Change Password
            </h3>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                value={profileData.newPassword}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={profileData.confirmPassword}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <p className="text-[10px] text-gray-500 text-center italic">
                * Leave fields blank if you don't want to change your password.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={isUpdating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Saving Changes..." : "Apply Updates"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Profile;
