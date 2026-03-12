import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import api from "../services/api";
import EditProductModal from "../components/EditProductModal";
import ProductModal from "../components/ProductModal";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products/");
      setProducts(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    const isConfirm = window.confirm("¿Estás seguro?");
    if (isConfirm) {
      await api.delete(`/products/${productId}`);
      fetchProducts();
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* 1. EL MODAL: Se muestra solo si showModal es true */}
      {showModal && (
        <ProductModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchProducts();
          }}
        />
      )}

      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => {
            setSelectedProduct(null);
            fetchProducts();
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ... (tus cards de métricas) ... */}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">Productos</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            + Nuevo Producto
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-gray-400 border-b border-gray-700 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="text-gray-300 hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">{product.price}</td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-10">
              No hay productos registrados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;
