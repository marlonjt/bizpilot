import { useState } from "react";
import api from "../services/api";

function EditProductModal({ product, onClose, onSuccess }) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price || "");
  const [stock, setStock] = useState(product.stock || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.put(`/products/${product.id}`, {
        name,
        description,
        price,
        stock,
      });
      onSuccess();
    } catch (err) {
      setError("Error al crear producto");
    } finally {
      setSaving(false);
    }
  };

  return (
    // Backdrop (Fondo oscuro transparente)
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      {/* Contenedor principal del modal */}
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
        {/* Header del modal */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-bold">Editar Producto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej. Pepsi Cola"
              className="w-full rounded-md bg-gray-900/50 border border-gray-600 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md bg-gray-900/50 border border-gray-600 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Precio
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="5.25"
              className="w-full rounded-md bg-gray-900/50 border border-gray-600 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Stock
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Ingresa alguna nota"
              className="w-full rounded-md bg-gray-900/50 border border-gray-600 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="rounded-md bg-red-500/10 p-3 border border-red-500/50">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
