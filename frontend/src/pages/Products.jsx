import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import ProductModal from "../components/ProductModal";
import EditProductModal from "../components/EditProductModal";

const PAGE_SIZE = 10;

function Products() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async (currentPage = page) => {
    setLoading(true);
    try {
      const response = await api.get("/products/", {
        params: {
          skip: (currentPage - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
        },
      });
      // Ajuste: Tu API devuelve { items: [], total: X }
      setProducts(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]); // Se dispara al cambiar de página

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await api.delete(`/products/${productId}`);
      fetchProducts();
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    );
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {showCreateModal && (
        <ProductModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); fetchProducts(); }}
        />
      )}
      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => { setSelectedProduct(null); fetchProducts(); }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-white text-xl font-bold">
            Products
            <span className="ml-2 text-sm font-normal text-gray-400">{total} total</span>
          </h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              + New Product
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <table className="w-full text-left">
            <thead className="text-gray-400 border-b border-gray-700 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="text-gray-300 hover:bg-gray-700/50">
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">${Number(product.price).toFixed(2)}</td>
                  <td className={`px-6 py-4 ${product.stock < 5 ? "text-red-400 font-bold" : ""}`}>
                    {product.stock} {product.stock < 5 && "⚠️"}
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button onClick={() => setSelectedProduct(product)} className="text-indigo-400 hover:text-indigo-300 text-sm">Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-700 bg-gray-800/50">
              <p className="text-gray-400 text-sm">Showing {showingFrom}–{showingTo} of {total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1 rounded bg-gray-700 text-gray-300 disabled:opacity-40">← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded ${p === page ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-300"}`}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="px-3 py-1 rounded bg-gray-700 text-gray-300 disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;
