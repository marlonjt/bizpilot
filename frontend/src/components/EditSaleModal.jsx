import { useState } from "react";
import api from "../services/api";

// sale = the full sale object passed from Sales.jsx when user clicks Edit
// It contains: sale.id, sale.quantity, sale.notes, sale.client_id, etc.
function EditSaleModal({ sale, clients, products, onClose, onSuccess }) {
  // Initialize states with the existing sale data
  // This is why the form shows the current values when it opens
  const [quantity, setQuantity] = useState(sale.quantity);
  const [notes, setNotes] = useState(sale.notes || ""); // || "" prevents null/undefined in the input
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.full_name : clientId;
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : productId;
  };
  // NOTE: client and product are intentionally NOT editable here.
  // The backend only accepts quantity and notes in PUT /sales/{id}.
  // To change client or product, the sale must be deleted and recreated.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // PUT /sales/{id} — plural "sales", not "sale"
      // Only send quantity and notes — the backend ignores anything else
      await api.put(`/sales/${sale.id}`, {
        quantity: Number(quantity), // convert string input to number
        notes,
      });
      onSuccess(); // Tells Sales.jsx to close modal and refresh the table
    } catch {
      setError("Failed to update sale. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-bold">Edit Sale</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Read-only info — shows context but cannot be changed */}
        <div className="bg-gray-900/50 rounded-lg p-3 mb-4 text-sm text-gray-400 space-y-1">
          <p>
            Client:{" "}
            <span className="text-gray-200">
              {getClientName(sale.client_id)}
            </span>
          </p>
          <p>
            Product:{" "}
            <span className="text-gray-200">
              {getProductName(sale.product_id)}
            </span>
          </p>
          <p>
            Unit price:{" "}
            <span className="text-gray-200">
              ${Number(sale.unit_price).toFixed(2)}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            To change client or product, delete this sale and create a new one.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* QUANTITY — editable, affects stock and total on the backend */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)} // updates quantity state on each keystroke
              required
              className="w-full rounded-md bg-gray-900/50 border border-gray-600 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* NOTES — editable, optional */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes} // controlled input — always reflects state
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              className="w-full rounded-md bg-gray-900/50 border border-gray-600 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* ERROR — only shown when error state is not empty */}
          {error && (
            <div className="rounded-md bg-red-500/10 p-3 border border-red-500/50">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSaleModal;
