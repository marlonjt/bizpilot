import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import SaleModal from "../components/SaleModal";
import EditSaleModal from "../components/EditSaleModal";

function Sales() {
  // ── STATE ────────────────────────────────────────────────────────
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true); // setLoading — NOT serLoading (typo fixed)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null); // null = no modal open, object = edit modal open
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  // ── DATA FETCHING ─────────────────────────────────────────────────
  // fetchSales is defined outside useEffect so it can be called again
  // after create, edit, or delete to refresh the table
  const fetchSales = async () => {
    try {
      const response = await api.get("/sales/");
      setSales(response.data); // store the array of sales in state
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    } finally {
      setLoading(false); // stop showing loading state whether it succeeded or failed
    }
  };

  // Run fetchSales once when the component first renders
  // The clients and products fetches happen inside SaleModal — not here
  useEffect(() => {
    fetchSales();
    api.get("/clients/").then((r) => setClients(r.data));
    api.get("/products/").then((r) => setProducts(r.data));
  }, []); // [] = run only on mount

  // ── HANDLERS ─────────────────────────────────────────────────────
  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.full_name : clientId; // si no encuentra, muestra el ID
  };

  // Busca en el array de productos y devuelve el nombre
  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : productId;
  };

  const handleDelete = async (saleId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sale? Stock will be returned.",
    );
    if (confirmed) {
      await api.delete(`/sales/${saleId}`);
      fetchSales(); // refresh the table after deletion
    }
  };

  const handleEdit = (sale) => {
    setSelectedSale(sale); // store the full sale object — EditSaleModal needs sale.id, sale.quantity, etc.
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* CREATE MODAL — only mounted when showCreateModal is true */}
      {showCreateModal && (
        <SaleModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchSales(); // refresh table after successful creation
          }}
        />
      )}

      {/* EDIT MODAL — only mounted when a sale is selected */}
      {/* selectedSale is the full sale object, not just the ID */}
      {selectedSale && (
        <EditSaleModal
          sale={selectedSale} // pass the full object so the modal can pre-fill fields
          clients={clients} 
          products={products}
          onClose={() => setSelectedSale(null)}
          onSuccess={() => {
            setSelectedSale(null);
            fetchSales(); // refresh table after successful update
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">Sales</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + New Sale
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-gray-400 border-b border-gray-700 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Unit Price</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 ">
              {sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="text-gray-300 hover:bg-gray-700/50"
                >
                  {/* For now shows IDs — later we can show names using relationships */}
                  <td className="px-6 py-4">{getClientName(sale.client_id)}</td>
                  <td className="px-6 py-4">
                    {getProductName(sale.product_id)}
                  </td>
                  <td className="px-6 py-4">{sale.quantity}</td>
                  {/* toFixed(2) formats the decimal: 5 → 5.00 */}
                  <td className="px-6 py-4">
                    ${Number(sale.unit_price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    ${Number(sale.total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(sale)} // passes the full sale object
                      className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id)} // only needs the ID to delete
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty state — only shown when loading is done and there are no sales */}
          {sales.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-10">
              No sales registered yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sales;
