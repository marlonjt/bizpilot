import { useState } from "react";
import api from "../services/api";

/**
 * ProductModal: Component to register new inventory items.
 * @param {Function} onClose - Function to hide the modal.
 * @param {Function} onSuccess - Function to refresh the product list.
 */
function ProductModal({ onClose, onSuccess }) {
  // --- FORM DATA STATE ---
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");

  // --- UI FEEDBACK STATE ---
  const [errorMessage, setErrorMessage] = useState("");
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);

  /**
   * Handles the submission of the product form.
   * Converts numeric strings to actual Numbers before sending.
   */
  const handleProductSubmit = async (event) => {
    event.preventDefault(); // Prevents page refresh
    setErrorMessage("");
    setIsSavingInProgress(true);

    try {
      // Data transformation: price and stock must be numeric for the DB
      await api.post("/products/", {
        name: productName,
        description: productDescription,
        price: Number(productPrice), // Convert string "10.5" to number 10.5
        stock: Number(productStock), // Convert string "5" to number 5
      });

      onSuccess(); // Triggers parent table refresh
    } catch (error) {
      setErrorMessage("System Error: Failed to register the product.");
      console.error("API Product Post Error:", error);
    } finally {
      setIsSavingInProgress(false);
    }
  };

  return (
    // Overlay: Dimmed background to focus on the modal
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-indigo-400 text-xl font-bold">New Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Product Form */}
        <form onSubmit={handleProductSubmit} className="space-y-4">
          {/* Product Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Premium Coffee Bean"
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Numeric Row: Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Stock Qty
              </label>
              <input
                type="number"
                min="0"
                required
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Description
            </label>
            <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                placeholder="Add notes about this product..."
              />
          </div>

          {/* Feedback Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-md">
              {errorMessage}
            </div>
          )}

          {/* Action Footer */}
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
              {isSavingInProgress ? "Registering..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
