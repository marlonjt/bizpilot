import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import ProductModal from "../components/ProductModal";
import EditProductModal from "../components/EditProductModal";
import ConfirmModal from "../components/ConfirmModal";
import * as XLSX from "xlsx";

const PAGE_SIZE = 10;

function Products() {
  // --- DATA & PAGINATION STATE ---
  const [productList, setProductList] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // --- SEARCH & UI STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // --- DELETE STATES ---
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  const [isDeletingInProgress, setIsDeletingInProgress] = useState(false);

  // Fetches data from Server.
  // Now includes 'search' in the request params.
  const fetchProductsData = async (
    pageNumber = currentPage,
    search = searchQuery,
  ) => {
    setIsLoading(true);
    try {
      const response = await api.get("/products/", {
        params: {
          skip: (pageNumber - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
          search: search,
        },
      });
      setProductList(response.data.items || []);
      setTotalProducts(response.data.total || 0);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // SEARCH DEBOUNCE LOGIC
  // This effect runs every time 'searchQuery' or 'currentPage' changes.
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      fetchProductsData(currentPage, searchQuery);
    }, 300);

    return () => clearTimeout(searchTimer); // Cleanup to avoid memory leaks
  }, [currentPage, searchQuery]);

  // --- ACTIONS ---
  const handleConfirmDelete = async () => {
    if (!productIdToDelete) return;
    setIsDeletingInProgress(true);
    try {
      await api.delete(`/products/${productIdToDelete}`);
      setProductIdToDelete(null);
      fetchProductsData();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Error: This product might be linked to existing sales.");
      setProductIdToDelete(null);
    } finally {
      setIsDeletingInProgress(false);
    }
  };

  const handleExportToExcel = () => {
    const dataToExport = productList.map((p) => ({
      Name: p.name,
      Price: p.price,
      Stock: p.stock,
      Description: p.description || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "BizPilot_Inventory.xlsx");
  };

  // --- PAGINATION HELPERS ---
  const maxPages = Math.ceil(totalProducts / PAGE_SIZE);
  const showingFrom =
    totalProducts === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, totalProducts);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* MODALS */}
      {isCreateModalOpen && (
        <ProductModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchProductsData();
          }}
        />
      )}

      {productToEdit && (
        <EditProductModal
          product={productToEdit}
          onClose={() => setProductToEdit(null)}
          onSuccess={() => {
            setProductToEdit(null);
            fetchProductsData();
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER & SEARCH */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-white text-xl font-bold">
            Inventory Management
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({totalProducts} total)
            </span>
          </h2>

          <div className="flex gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Crucial: Reset to page 1 on new search
              }}
              className="w-full sm:w-64 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              + Add Product
            </button>
            <button
              onClick={handleExportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Export
            </button>
          </div>
        </div>

        {/* INVENTORY TABLE */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-900/50 text-gray-400 text-xs uppercase border-b border-gray-700">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {productList.map((product) => (
                <tr
                  key={product.id}
                  className="text-gray-300 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-400 italic">
                    {product.description
                      ? product.description.substring(0, 30) + "..."
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-green-400">
                    ${Number(product.price).toFixed(2)}
                  </td>
                  <td
                    className={`px-6 py-4 ${product.stock < 5 ? "text-red-400 font-bold" : ""}`}
                  >
                    {product.stock} {product.stock < 5 ? "left" : ""}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setProductToEdit(product)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setProductIdToDelete(product.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* EMPTY STATE */}
          {productList.length === 0 && !isLoading && (
            <div className="p-20 text-center text-gray-500">
              {searchQuery
                ? `No matches found for "${searchQuery}"`
                : "No products in inventory."}
            </div>
          )}

          {/* PAGINATION */}
          {maxPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-700 bg-gray-900/10">
              <p className="text-gray-400 text-xs">
                Showing {showingFrom}–{showingTo} of {totalProducts}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded bg-gray-700 text-gray-300 text-xs disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === maxPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(maxPages, p + 1))
                  }
                  className="px-3 py-1 rounded bg-gray-700 text-gray-300 text-xs disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={productIdToDelete !== null}
        onClose={() => setProductIdToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingInProgress}
        title="Confirm Deletion"
        message="This product will be permanently removed. This might affect historical sales reports."
      />
    </div>
  );
}

export default Products;
