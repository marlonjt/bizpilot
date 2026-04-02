import { useState, useEffect } from "react";
import api from "../services/api";

// Props destructured correctly — { } extracts onClose and onSuccess from the props object
// Without { } React would pass the entire props object as the first argument
function SaleModal({ onClose, onSuccess }) {
  // ── FORM STATE ──────────────────────────────────────────────────
  // clientId and productId store the selected IDs from the dropdowns
  // These are what the API expects: { client_id: 1, product_id: 2 }
  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // ── DROPDOWN DATA ────────────────────────────────────────────────
  // These lists populate the <select> dropdowns
  // They are fetched once when the modal opens (empty dependency array [])
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Añadimos limit: 1000 para traer todos a los selectores
    // Y usamos r.data.items porque tu API devuelve { items: [], total: X }
    api
      .get("/clients/", { params: { limit: 1000 } })
      .then((r) => setClients(r.data.items || []))
      .catch((err) => console.error("Error cargando clientes", err));

    api
      .get("/products/", { params: { limit: 1000 } })
      .then((r) => setProducts(r.data.items || []))
      .catch((err) => console.error("Error cargando productos", err));
  }, []);
  // ── SUBMIT ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the browser from reloading the page
    setError("");
    setSaving(true);

    try {
      // Send to /sales/ — NOT /products/
      // The API expects client_id and product_id as integers
      await api.post("/sales/", {
        client_id: Number(clientId), // convert string from select to number
        product_id: Number(productId), // convert string from select to number
        quantity: Number(quantity),
        notes,
      });
      onSuccess(); // Tells the parent (Sales.jsx) to close modal and refresh table
    } catch {
      setError("Failed to create sale. Please try again.");
    } finally {
      setSaving(false); // Re-enables the button whether it succeeded or failed
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-bold">New Sale</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CLIENT DROPDOWN ── loads from /clients/ */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Client
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)} // e.target.value = selected option value
              required
              className="w-full rounded-md bg-gray-900/50 border border-gray-600 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a client...</option>
              {/* Map over the clients array — each client becomes an <option> */}
              {/* value={c.id} is what gets sent to the API */}
              {/* c.full_name is what the user sees */}
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* PRODUCT DROPDOWN ── loads from /products/ */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Product
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="w-full rounded-md bg-gray-900/50 border border-gray-600 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                // Shows name and current price so the user knows what they're selecting
                <option key={p.id} value={p.id}>
                  {p.name} — ${Number(p.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* QUANTITY */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1" // minimum 1 unit
              step="1" // whole numbers only
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              placeholder="0"
              className="w-full rounded-md bg-gray-900/50 border border-gray-600 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* NOTES — optional */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              className="w-full rounded-md bg-gray-900/50 border border-gray-600 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* ERROR MESSAGE — only renders if error is not empty */}
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
              {saving ? "Saving..." : "Save Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SaleModal;
