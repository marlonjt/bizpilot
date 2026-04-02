import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import ClientModal from "../components/ClientModal";
import EditClientModal from "../components/EditClientModal";
import * as XLSX from "xlsx";

const PAGE_SIZE = 10;

function Clients() {
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- FUNCIONES HELPER (Lógica reutilizable) ---

  // Obtener un cliente específico por nombre desde la API
  const getClientByName = async (name) => {
    try {
      const res = await api.get("/clients/", { params: { search: name, limit: 1 } });
      return res.data.items[0] || null;
    } catch (err) {
      console.error("Error finding client:", err);
      return null;
    }
  };

  // Obtener un producto por nombre (útil para otras secciones)
  const getProductByName = async (name) => {
    try {
      const res = await api.get("/products/", { params: { search: name, limit: 1 } });
      return res.data.items[0] || null;
    } catch (err) {
      console.error("Error finding product:", err);
      return null;
    }
  };

  // --- LÓGICA DE CARGA ---

  const fetchClients = async (currentPage = page, search = searchQuery) => {
    setLoading(true);
    try {
      const response = await api.get("/clients/", {
        params: {
          skip: (currentPage - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
          search: search // Enviamos la búsqueda al backend
        },
      });
      setClients(response.data.items);
      setTotal(response.data.total);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para buscar cuando cambia la página o la búsqueda (con delay opcional)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchClients(page, searchQuery);
    }, 300); // 300ms de espera para no saturar el server mientras escribes

    return () => clearTimeout(delayDebounceFn);
  }, [page, searchQuery]);

  const handleDelete = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      await api.delete(`/clients/${clientId}`);
      fetchClients();
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  const exportToExcel = () => {
    const data = clients.map((c) => ({
      Name: c.full_name,
      Email: c.email,
      Phone: c.phone || "",
      Notes: c.notes || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    XLSX.writeFile(workbook, "clients.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {showCreateModal && (
        <ClientModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); fetchClients(); }}
        />
      )}

      {selectedClient && (
        <EditClientModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onSuccess={() => { setSelectedClient(null); fetchClients(); }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-white text-xl font-bold">
            Clients
            <span className="ml-2 text-sm font-normal text-gray-400">
              {total} total
            </span>
          </h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reiniciar a página 1 al buscar
              }}
              className="w-full sm:w-64 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              + New Client
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              ↓ Export Xlsx
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <table className="w-full text-left">
            <thead className="text-gray-400 border-b border-gray-700 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {clients.map((client) => (
                <tr key={client.id} className="text-gray-300 hover:bg-gray-700/50">
                  <td className="px-6 py-4">{client.full_name}</td>
                  <td className="px-6 py-4">{client.email}</td>
                  <td className="px-6 py-4">{client.phone || "—"}</td>
                  <td className="px-6 py-4">{client.notes || "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
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

          {clients.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-10">
              {searchQuery ? `No clients found for "${searchQuery}"` : "No clients registered yet."}
            </p>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Showing {showingFrom}–{showingTo} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-gray-700 text-gray-300 text-sm disabled:opacity-40"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded text-sm ${p === page ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-300"}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded bg-gray-700 text-gray-300 text-sm disabled:opacity-40"
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

export default Clients;

