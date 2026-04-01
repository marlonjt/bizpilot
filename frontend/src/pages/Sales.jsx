import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import SaleModal from "../components/SaleModal";
import EditSaleModal from "../components/EditSaleModal";

function Sales() {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSales = async () => {
    try {
      const response = await api.get("/sales/");
      setSales(response.data);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    api.get("/clients/").then((r) => setClients(r.data));
    api.get("/products/").then((r) => setProducts(r.data));
  }, []);

  const handleDelete = async (saleId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sale? Stock will be returned.",
    );
    if (confirmed) {
      await api.delete(`/sales/${saleId}`);
      fetchSales();
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.full_name : "—";
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "—";
  };

  const filteredSales = sales.filter((sale) => {
    const query = searchQuery.toLowerCase();
    return (
      getClientName(sale.client_id).toLowerCase().includes(query) ||
      getProductName(sale.product_id).toLowerCase().includes(query) ||
      (sale.notes && sale.notes.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      {showCreateModal && (
        <SaleModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchSales();
          }}
        />
      )}
      {selectedSale && (
        <EditSaleModal
          sale={selectedSale}
          clients={clients}
          products={products}
          onClose={() => setSelectedSale(null)}
          onSuccess={() => {
            setSelectedSale(null);
            fetchSales();
          }}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-white text-xl font-bold">
            Sales
            <span className="ml-2 text-sm font-normal text-gray-400">
              {filteredSales.length} of {sales.length}
            </span>
          </h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by client, product or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              + New Sale
            </button>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
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
            <tbody className="divide-y divide-gray-700">
              {filteredSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="text-gray-300 hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4">{getClientName(sale.client_id)}</td>
                  <td className="px-6 py-4">
                    {getProductName(sale.product_id)}
                  </td>
                  <td className="px-6 py-4">{sale.quantity}</td>
                  <td className="px-6 py-4">
                    ${Number(sale.unit_price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-green-400 font-medium">
                    ${Number(sale.total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-10">
              {searchQuery
                ? `No sales found for "${searchQuery}"`
                : "No sales registered yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sales;
