import { useState } from "react";
import api from "../services/api";

///Modal component to register new clients.
function ClientModal({ onClose, onSuccess }) {
  // --- FORM STATE ---
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // --- UI STATE ---
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Handles form submission to the API
  const handleClientSubmit = async (event) => {
    event.preventDefault(); // Prevents page reload
    setErrorMessage(""); // Clears previous errors
    setIsSaving(true); // Starts loading state

    try {
      await api.post("/clients/", { full_name: fullName, email, phone, notes });
      onSuccess();
    } catch (error) {
      setErrorMessage("Failed to create client. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    // Overlay: dark background that covers the entire screen
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-indigo-400 text-xl font-bold">New Client</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Client Form */}
        <form onSubmit={handleClientSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Smith"
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 123 456"
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Notes Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-20"
              placeholder="Add private notes about this client..."
            />
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="rounded-md bg-red-500/10 p-3 border border-red-500/50 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientModal;
