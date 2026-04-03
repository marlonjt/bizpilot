import { useState, useEffect } from "react";
import api from "../services/api";

/**
 * SaleModal: Handles the creation of new sales records.
 * Fetches clients and products to populate dropdown menus.
 */
function SaleModal({ onClose, onSuccess }) {
  // --- FORM DATA STATE ---
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("");
  const [saleNotes, setSaleNotes] = useState("");

  // --- CATALOG DATA STATE ---
  const [availableClients, setAvailableClients] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);

  // --- UI FEEDBACK STATE ---
  const [errorMessage, setErrorMessage] = useState("");
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);

  /**
   * Initial Load: Fetch clients and products from the API.
   * Uses a high limit to ensure all items are available for selection.
   */
  useEffect(() => {
    // Fetch Clients
    api
      .get("/clients/", { params: { limit: 1000 } })
      .then((response) => setAvailableClients(response.data.items || []))
      .catch((err) => console.error("Error loading clients:", err));

    // Fetch Products
    api
      .get("/products/", { params: { limit: 1000 } })
      .then((response) => setAvailableProducts(response.data.items || []))
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  /**
   * Handles the submission of a new sale.
   * Ensures IDs and quantities are sent as numeric values.
   */
  const handleSaleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSavingInProgress(true);

    try {
      await api.post("/sales/", {
        client_id: Number(selectedClientId),
        product_id: Number(selectedProductId),
        quantity: Number(saleQuantity),
        notes: saleNotes,
      });

      onSuccess(); // Refresh table and close
    } catch (error) {
      setErrorMessage(
        "System Error: Failed to register the sale. Check stock or connection.",
      );
      console.error("Sale Creation Error:", error);
    } finally {
      setIsSavingInProgress(false);
    }
  };

  return (
    // Overlay with focus effect
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-indigo-400 text-xl font-bold">New Sale</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Sale Form */}
        <form onSubmit={handleSaleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Client
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              required
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choose a client...</option>
              {availableClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choose a product...</option>
              {availableProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — ${Number(product.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Notes */}
          <div className="grid grid-cols-1 gap-4">
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
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="How many units?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Additional Notes
              </label>
              <textarea
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                placeholder="Add notes about this sale..."
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-md">
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSavingInProgress}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingInProgress}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSavingInProgress ? "Processing..." : "Create Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SaleModal;
