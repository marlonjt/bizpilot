import { useState } from "react";
import api from "../services/api";

/**
 * EditClientModal: Component to update existing client information.
 * @param {Object} client - The current client data to be edited.
 * @param {Function} onClose - Closes the modal without saving.
 * @param {Function} onSuccess - Refresh data and close on success.
 */
function EditClientModal({ client, onClose, onSuccess }) {
  // --- FORM STATE (Pre-filled with existing client data) ---
  const [fullName, setFullName] = useState(client.full_name);
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone || "");
  const [notes, setNotes] = useState(client.notes || "");

  // --- UI FEEDBACK STATE ---
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdateInProgress, setIsUpdateInProgress] = useState(false);

  /**
   * Sends the updated information to the Backend using the client ID.
   */
  const handleUpdateSubmit = async (event) => {
    event.preventDefault(); // Prevents standard browser form submission
    setErrorMessage("");
    setIsUpdateInProgress(true);

    try {
      // Logic: Update specifically the record matching client.id
      await api.put(`/clients/${client.id}`, {
        full_name: fullName,
        email: email,
        phone: phone,
        notes: notes,
      });

      onSuccess(); // Triggers table refresh in the parent component
    } catch (error) {
      setErrorMessage("System Error: Could not update client details.");
      console.error("Update Error:", error);
    } finally {
      setIsUpdateInProgress(false);
    }
  };

  return (
    // Overlay: Blurred background for focus
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-indigo-400 text-xl font-bold">
            Edit Client Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Update Form */}
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          {/* Full Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Phone & Notes Section */}
          <div className="grid grid-cols-1 gap-4">
            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="+1 555 123 456"
              />
            </div>
            {/* Notes Field */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                placeholder="Add private notes about this client..."
              />
            </div>
          </div>

          {/* Alert Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-md">
              {errorMessage}
            </div>
          )}

          {/* Modal Footer: Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdateInProgress}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdateInProgress}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isUpdateInProgress ? "Saving Changes..." : "Update Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditClientModal;
