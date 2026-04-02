import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import SaleModal from "../components/SaleModal";
import EditSaleModal from "../components/EditSaleModal";

const PAGE_SIZE = 10;

function Sales() {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSales = async (currentPage = page) => {
    setLoading(true);
    try {
      const response = await api.get("/sales/", {
        params: { skip: (currentPage - 1) * PAGE_SIZE, limit: PAGE_SIZE },
      });
      setSales(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    // Cargamos catálogos (ajustado a estructura {items: []})
    api.get("/clients/").then((r) => setClients(r.data.items || r.data));
    api.get("/products/").then((r) => setProducts(r.data.items || r.data));
  }, [page]);

  const handleDelete = async (saleId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this sale? Stock will be returned.",
      )
    ) {
      await api.delete(`/sales/${saleId}`);
      fetchSales();
    }
  };

  // HELPERS: Manejan casos donde los datos aún no cargan
  const getClientName = (clientId) => {
    if (!clients.length) return "Loading...";
    const client = clients.find((c) => c.id === clientId);
    return client ? client.full_name : "Unknown Client";
  };

  const getProductName = (productId) => {
    if (!products.length) return "Loading...";
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Unknown Product";
  };

  const filteredSales = sales.filter((sale) => {
    const query = searchQuery.toLowerCase();
    return (
      getClientName(sale.client_id).toLowerCase().includes(query) ||
      getProductName(sale.product_id).toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-white text-xl font-bold">
            Sales
            <span className="ml-2 text-sm font-normal text-gray-400">
              {total} total
            </span>
          </h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by client, product or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm transition-colors"
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
                  <td className="px-6 py-4 text-green-400 font-medium">
                    ${Number(sale.total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="text-indigo-400 hover:text-indigo-300 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-700 bg-gray-800/50">
              <p className="text-gray-400 text-sm">
                Showing {showingFrom}–{showingTo} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-gray-700 disabled:opacity-40"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded ${p === page ? "bg-indigo-600 text-white" : "bg-gray-700"}`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded bg-gray-700 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sales;
