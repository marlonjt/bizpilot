import { useState } from "react";
import api from "../services/api";

/**
 * EditProductModal: Handles updating existing product details (price, stock, etc.)
 * @param {Object} product - The current product data provided by the parent.
 * @param {Function} onClose - Closes the modal without making changes.
 * @param {Function} onSuccess - Refresh data and close after successful update.
 */
function EditProductModal({ product, onClose, onSuccess }) {
  // --- FORM STATE (Pre-filled with product data) ---
  const [productName, setProductName] = useState(product.name);
  const [productDescription, setProductDescription] = useState(
    product.description || "",
  );
  const [productPrice, setProductPrice] = useState(product.price);
  const [productStock, setProductStock] = useState(product.stock);

  // --- UI FEEDBACK STATE ---
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdateInProgress, setIsUpdateInProgress] = useState(false);

  /**
   * Sends the updated product data to the API.
   * Converts strings to Numbers to match Backend requirements.
   */
  const handleUpdateSubmit = async (event) => {
    event.preventDefault(); // Prevents page reload
    setErrorMessage("");
    setIsUpdateInProgress(true);

    try {
      // Logic: Update specific record using its unique ID
      await api.put(`/products/${product.id}`, {
        name: productName,
        description: productDescription,
        price: Number(productPrice), // Ensure numeric type for DB calculations
        stock: Number(productStock), // Ensure numeric type for inventory
      });

      onSuccess(); // Triggers refresh in the main table
    } catch (error) {
      setErrorMessage("System Error: Could not save product changes.");
      console.error("Product Update Error:", error);
    } finally {
      setIsUpdateInProgress(false);
    }
  };

  return (
    // Overlay: Dimmed background to isolate the modal
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-indigo-400 text-xl font-bold">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Update Form */}
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Numeric Fields: Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Stock
              </label>
              <input
                type="number"
                min="0"
                required
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description Input */}
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

          {/* Error Alert Display */}
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
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isUpdateInProgress ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
