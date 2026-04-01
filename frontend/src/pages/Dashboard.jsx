import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Dashboard() {
  // ── STATE ─────────────────────────────────────────────────────────
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── DATA FETCHING ─────────────────────────────────────────────────
  // Promise.all fetches all three endpoints in parallel instead of sequentially
  // This is faster: waits for ALL to finish instead of one by one
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [clientsRes, productsRes, salesRes] = await Promise.all([
          api.get("/clients/"),
          api.get("/products/"),
          api.get("/sales/"),
        ]);
        setClients(clientsRes.data);
        setProducts(productsRes.data);
        setSales(salesRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── CALCULATIONS ──────────────────────────────────────────────────

  // Total revenue — sum of all sale totals
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);

  // Sales today — filter by comparing date strings
  const today = new Date().toDateString();
  const salesToday = sales.filter(
    (s) => new Date(s.created_at).toDateString() === today
  ).length;

  // Top selling product — counts total quantity sold per product_id
  // Result: { "1": 5, "2": 12 } → finds the key with the highest value
  const productSalesMap = {};
  sales.forEach((s) => {
    productSalesMap[s.product_id] = (productSalesMap[s.product_id] || 0) + s.quantity;
  });
  const topProductId = Object.keys(productSalesMap).sort(
    (a, b) => productSalesMap[b] - productSalesMap[a]
  )[0];
  const topProduct = products.find((p) => p.id === Number(topProductId));

  // Low stock — products with less than 5 units
  const lowStockProducts = products.filter((p) => p.stock < 5);

  // Recent sales — last 5 sorted by newest ID first
  const recentSales = [...sales].sort((a, b) => b.id - a.id).slice(0, 5);

  // Resolve IDs to names for the recent sales table
  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.full_name : "—";
  };
  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "—";
  };

  // ── LOADING STATE ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ── LOW STOCK ALERT ──────────────────────────────────────── */}
        {/* Conditionally rendered — only visible when stock is low */}
        {lowStockProducts.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 font-semibold mb-2">
              ⚠️ Low stock alert — {lowStockProducts.length} product{lowStockProducts.length > 1 ? "s" : ""} need restocking
            </p>
            <div className="flex flex-wrap gap-3">
              {lowStockProducts.map((p) => (
                <span
                  key={p.id}
                  className="bg-red-500/20 text-red-300 text-sm px-3 py-1 rounded-full"
                >
                  {p.name} — {p.stock} left
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── ROW 1: CORE METRICS ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm uppercase tracking-wide">Total Clients</p>
            <p className="text-4xl font-bold text-white mt-2">{clients.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm uppercase tracking-wide">Total Products</p>
            <p className="text-4xl font-bold text-white mt-2">{products.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm uppercase tracking-wide">Total Revenue</p>
            <p className="text-4xl font-bold text-green-400 mt-2">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* ── ROW 2: ACTIVITY METRICS ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm uppercase tracking-wide">Sales Today</p>
            <p className="text-4xl font-bold text-indigo-400 mt-2">{salesToday}</p>
            <p className="text-gray-500 text-xs mt-2">transactions registered today</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm uppercase tracking-wide">Top Product</p>
            {topProduct ? (
              <>
                <p className="text-2xl font-bold text-white mt-2">{topProduct.name}</p>
                <p className="text-gray-500 text-xs mt-2">
                  {productSalesMap[topProductId]} units sold total
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-sm mt-2">No sales yet</p>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm uppercase tracking-wide">Low Stock</p>
            <p className={`text-4xl font-bold mt-2 ${
              lowStockProducts.length > 0 ? "text-red-400" : "text-green-400"
            }`}>
              {lowStockProducts.length}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              {lowStockProducts.length > 0
                ? "products need restocking"
                : "all products well stocked"}
            </p>
          </div>
        </div>

        {/* ── RECENT SALES ─────────────────────────────────────────── */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white text-lg font-bold">Recent Sales</h3>
            <span className="text-gray-500 text-sm">{sales.length} total</span>
          </div>
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full text-left">
              <thead className="text-gray-400 border-b border-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Unit Price</th>
                  <th className="px-6 py-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="text-gray-300 hover:bg-gray-700/50">
                    <td className="px-6 py-4">{getClientName(sale.client_id)}</td>
                    <td className="px-6 py-4">{getProductName(sale.product_id)}</td>
                    <td className="px-6 py-4">{sale.quantity}</td>
                    <td className="px-6 py-4">${Number(sale.unit_price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-green-400 font-medium">
                      ${Number(sale.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentSales.length === 0 && (
              <p className="text-gray-500 text-center py-8">No sales yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
