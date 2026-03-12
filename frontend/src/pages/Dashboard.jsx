import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import api from "../services/api";
import ClientModal from "../components/ClientModal"


function Dashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchClients = async () => {
    try {
      const response = await api.get("/clients/");
      setClients(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* 1. EL MODAL: Se muestra solo si showModal es true */}
      {showModal && (
        <ClientModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchClients(); // Refrescamos la lista automáticamente
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ... (tus cards de métricas) ... */}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">Clientes</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            + Nuevo Cliente
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-gray-400 border-b border-gray-700 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Acciones</th>
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
                  <td className="px-6 py-4">
                    <button className="text-indigo-400 hover:text-indigo-300">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-10">
              No hay clientes registrados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
