import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import ClientModal from "../components/ClientModal";
import EditClientModal from "../components/EditClientModal";

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchClients = async () => {
    try {
      const response = await api.get("/clients/");
      setClients(response.data);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this client?",
    );
    if (confirmed) {
      await api.delete(`/clients/${clientId}`);
      fetchClients();
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {showCreateModal && (
        <ClientModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchClients();
          }}
        />
      )}

      {selectedClient && (
        <EditClientModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onSuccess={() => {
            setSelectedClient(null);
            fetchClients();
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">Clients</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + New Client
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <table className="w-full text-left">
            <thead className="text-gray-400 border-b border-gray-700 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="text-gray-300 hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4">{client.full_name}</td>
                  <td className="px-6 py-4">{client.email}</td>
                  <td className="px-6 py-4">{client.phone || "—"}</td>
                  <td className="px-6 py-4">{client.notes || "—"}</td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {clients.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-10">
              No clients registered yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Clients;
