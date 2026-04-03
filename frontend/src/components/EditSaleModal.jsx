import { useState } from "react";
import api from "../services/api";

/**
 * EditSaleModal: Allows editing quantity and notes for an existing sale.
 * Note: Client and Product are read-only to maintain transaction integrity.
 */
function EditSaleModal({ sale, clients, products, onClose, onSuccess }) {
  // --- FORM STATE ---
  const [saleQuantity, setSaleQuantity] = useState(sale.quantity);
  const [saleNotes, setSaleNotes] = useState(sale.notes || "");

  // --- UI FEEDBACK STATE ---
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdateInProgress, setIsUpdateInProgress] = useState(false);

  // --- HELPERS to display readable names instead of IDs ---
  const getClientName = (id) =>
    clients.find((c) => c.id === id)?.full_name || id;
  const getProductName = (id) => products.find((p) => p.id === id)?.name || id;

  /**
   * Handles the update request.
   * Only quantity and notes are sent to the API.
   */
  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsUpdateInProgress(true);

    try {
      // Logic: Update the specific sale record in PostgreSQL via Docker
      await api.put(`/sales/${sale.id}`, {
        quantity: Number(saleQuantity),
        notes: saleNotes,
      });
      onSuccess(); // Close and refresh Sales.jsx table
    } catch (error) {
      setErrorMessage("System Error: Could not update the sale record.");
      console.error("Sale Update Error:", error);
    } finally {
      setIsUpdateInProgress(false);
    }
  };

  return (
    // Overlay: Dimmed background with focus effect
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-indigo-400 text-xl font-bold">
            Edit Sale Record
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* READ-ONLY CONTEXT: Client, Product & Unit Price */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6 text-sm space-y-2">
          <p className="text-gray-400 font-medium italic">
            Current details (Read Only):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-gray-500">Client:</span>
            <span className="text-gray-200 font-medium">
              {getClientName(sale.client_id)}
            </span>

            <span className="text-gray-500">Product:</span>
            <span className="text-gray-200 font-medium">
              {getProductName(sale.product_id)}
            </span>

            <span className="text-gray-500">Unit Price:</span>
            <span className="text-green-400 font-bold">
              ${Number(sale.unit_price).toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 pt-2 border-t border-gray-800">
            * To change client/product, please delete and create a new sale.
          </p>
        </div>

        {/* EDITABLE FORM */}
        <form onSubmit={handleUpdateSubmit} className="space-y-5">
          {/* Quantity Field */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              required
              value={saleQuantity}
              onChange={(e) => setSaleQuantity(e.target.value)}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Notes Field (TextArea) */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Sale Notes
            </label>
            <textarea
              value={saleNotes}
              onChange={(e) => setSaleNotes(e.target.value)}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none transition-all"
              placeholder="Add internal notes about this transaction..."
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-md">
              {errorMessage}
            </div>
          )}

          {/* Footer Actions */}
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
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              {isUpdateInProgress ? "Saving..." : "Update Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSaleModal;
