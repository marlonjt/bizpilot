import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import SaleModal from "../components/SaleModal";
import EditSaleModal from "../components/EditSaleModal";
import ConfirmModal from "../components/ConfirmModal";
import * as XLSX from "xlsx";

const PAGE_SIZE = 10;

function Sales() {
  // --- DATA & PAGINATION STATE ---
  const [salesList, setSalesList] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // --- SEARCH & UI STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState(null);

  // --- DELETE STATES ---
  const [saleToDeleteId, setSaleToDeleteId] = useState(null);
  const [isDeletingInProgress, setIsDeletingInProgress] = useState(false);

  /**
   * Fetches sales from the server using pagination and database search.
   */
  const fetchSalesData = async (
    pageNumber = currentPage,
    search = searchQuery,
  ) => {
    setIsLoading(true);
    try {
      const response = await api.get("/sales/", {
        params: {
          skip: (pageNumber - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
          search: search, // Sent to FastAPI search parameter
        },
      });
      setSalesList(response.data.items || []);
      setTotalSales(response.data.total || 0);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load for catalogs (Clients & Products).
  // Needed to map IDs to Names in the table.
  useEffect(() => {
    api
      .get("/clients/", { params: { limit: 1000 } })
      .then((r) => setClients(r.data.items || []));
    api
      .get("/products/", { params: { limit: 1000 } })
      .then((r) => setProducts(r.data.items || []));
  }, []);

  // SEARCH DEBOUNCE LOGIC Triggers fetchSalesData when searchQuery or currentPage changes.
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      fetchSalesData(currentPage, searchQuery);
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [currentPage, searchQuery]);

  // --- HELPERS ---
  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.full_name : "Loading...";
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Loading...";
  };

  // --- ACTIONS ---
  const handleConfirmDelete = async () => {
    if (!saleToDeleteId) return;
    setIsDeletingInProgress(true);
    try {
      await api.delete(`/sales/${saleToDeleteId}`);
      setSaleToDeleteId(null);
      fetchSalesData();
    } catch (error) {
      console.error("Delete Error:", error);
      setSaleToDeleteId(null);
    } finally {
      setIsDeletingInProgress(false);
    }
  };

  const handleExportToExcel = () => {
    const dataToExport = salesList.map((s) => ({
      Client: getClientName(s.client_id),
      Product: getProductName(s.product_id),
      UnitPrice: s.unit_price,
      Quantity: s.quantity,
      Total: s.total,
      Notes: s.notes || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales_Report");
    XLSX.writeFile(workbook, "BizPilot_Sales.xlsx");
  };

  // --- PAGINATION HELPERS ---
  const maxPages = Math.ceil(totalSales / PAGE_SIZE);
  const showingFrom = totalSales === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, totalSales);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* MODALS */}
      {isCreateModalOpen && (
        <SaleModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchSalesData();
          }}
        />
      )}
      {saleToEdit && (
        <EditSaleModal
          sale={saleToEdit}
          clients={clients}
          products={products}
          onClose={() => setSaleToEdit(null)}
          onSuccess={() => {
            setSaleToEdit(null);
            fetchSalesData();
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER & SEARCH */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl font-bold">
            Sales Records
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({totalSales} total)
            </span>
          </h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by client, product or notes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
            />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              + New Sale
            </button>
            <button
              onClick={handleExportToExcel}
              disabled={isLoading || salesList.length === 0}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              ↓ Export Xlsx
            </button>
          </div>
        </div>

        {/* SALES TABLE */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-900/50 text-gray-400 border-b border-gray-700 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {salesList.map((sale) => (
                <tr
                  key={sale.id}
                  className="text-gray-300 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">{getClientName(sale.client_id)}</td>
                  <td className="px-6 py-4">
                    {getProductName(sale.product_id)}
                  </td>
                  <td className="px-6 py-4 text-sm italic text-gray-400">
                    {sale.notes || "—"}
                  </td>
                  <td className="px-6 py-4">{sale.quantity}</td>
                  <td className="px-6 py-4 text-green-400 font-medium">
                    ${Number(sale.total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setSaleToEdit(sale)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setSaleToDeleteId(sale.id)}
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
          {salesList.length === 0 && !isLoading && (
            <div className="p-20 text-center text-gray-500">
              {searchQuery
                ? `No matches found for "${searchQuery}"`
                : "No sales recorded yet."}
            </div>
          )}

          {/* PAGINATION */}
          {maxPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-700 bg-gray-900/10">
              <p className="text-gray-400 text-xs">
                Showing {showingFrom}–{showingTo} of {totalSales}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded bg-gray-700 text-xs disabled:opacity-30 hover:bg-gray-600"
                >
                  ← Prev
                </button>
                <button
                  disabled={currentPage === maxPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(maxPages, p + 1))
                  }
                  className="px-3 py-1 rounded bg-gray-700 text-xs disabled:opacity-30 hover:bg-gray-600"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={saleToDeleteId !== null}
        onClose={() => setSaleToDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingInProgress}
        title="Delete Sale"
        message="Are you sure you want to delete this sale? This action cannot be undone."
      />
    </div>
  );
}

export default Sales;
