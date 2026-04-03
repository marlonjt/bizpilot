import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import ClientModal from "../components/ClientModal";
import EditClientModal from "../components/EditClientModal";
import ConfirmModal from "../components/ConfirmModal";
import * as XLSX from "xlsx";

const PAGE_SIZE = 10; // Number of records shown per page

function Clients() {
  // --- DATA & PAGINATION STATE ---
  const [clientsList, setClientsList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // --- UI & MODAL STATE ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [clientToDeleteId, setClientToDeleteId] = useState(null);
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetches the client list from the API with pagination and search
  const fetchClientsData = async (
    pageNumber = currentPage,
    search = searchQuery,
  ) => {
    setIsLoading(true);
    try {
      const response = await api.get("/clients/", {
        params: {
          skip: (pageNumber - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
          search: search,
        },
      });
      setClientsList(response.data.items);
      setTotalRecords(response.data.total);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to handle search debouncing.
  // Prevents calling the API on every single keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClientsData(currentPage, searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, searchQuery]);

  //Handles the permanent removal of a client
  const handleConfirmDelete = async () => {
    if (!clientToDeleteId) return;
    setIsDeleteInProgress(true);

    try {
      await api.delete(`/clients/${clientToDeleteId}`);
      setClientToDeleteId(null);
      fetchClientsData();
    } catch (error) {
      console.error("Delete Error:", error);
    } finally {
      setIsDeleteInProgress(false);
    }
  };

  // Generates and downloads an Excel file with current client data
  const handleExportToExcel = () => {
    const formattedData = clientsList.map((client) => ({
      Name: client.full_name,
      Email: client.email,
      Phone: client.phone || "N/A",
      Notes: client.notes || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ClientsReport");
    XLSX.writeFile(workbook, "bizpilot_clients.xlsx");
  };

  // --- PAGINATION HELPERS ---
  const maxPages = Math.ceil(totalRecords / PAGE_SIZE);
  const showingFrom =
    totalRecords === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, totalRecords);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <ClientModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchClientsData();
          }}
        />
      )}

      {/* EDIT MODAL */}
      {clientToEdit && (
        <EditClientModal
          client={clientToEdit}
          onClose={() => setClientToEdit(null)}
          onSuccess={() => {
            setClientToEdit(null);
            fetchClientsData();
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-white text-xl font-bold">
            Clients Management
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({totalRecords} total)
            </span>
          </h2>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name, contact or notes...."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to page 1 on new search
              }}
              className="w-full sm:w-64 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              + Add Client
            </button>
            <button
              onClick={handleExportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
          <table className="w-full text-left">
            <thead className="text-gray-400 border-b border-gray-700 text-xs uppercase bg-gray-900/40">
              <tr>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {clientsList.map((client) => (
                <tr
                  key={client.id}
                  className="text-gray-300 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">{client.full_name}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{client.email}</div>
                    <div className="text-xs text-gray-500">
                      {client.phone || "No phone"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm italic text-gray-400">
                    {client.notes ? client.notes.substring(0, 30) + "..." : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setClientToEdit(client)}
                        className="text-indigo-400 hover:text-indigo-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setClientToDeleteId(client.id)}
                        className="text-red-400 hover:text-red-300"
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
          {clientsList.length === 0 && !isLoading && (
            <div className="text-center py-20 text-gray-500">
              No clients found.
            </div>
          )}

          {/* PAGINATION BAR */}
          {maxPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-700 bg-gray-900/20">
              <span className="text-gray-400 text-xs italic">
                Showing {showingFrom} to {showingTo}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 bg-gray-700 rounded text-xs disabled:opacity-30 hover:bg-gray-600"
                >
                  Previous
                </button>
                {/* Simplified page numbers could go here */}
                <button
                  disabled={currentPage === maxPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 bg-gray-700 rounded text-xs disabled:opacity-30 hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={clientToDeleteId !== null}
        onClose={() => setClientToDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleteInProgress}
        title="Delete Customer"
        message="This will permanently remove the client from the database. Are you sure?"
      />
    </div>
  );
}

export default Clients;
