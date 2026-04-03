import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import RevenueChart from "../components/RevenueChart";

function Dashboard() {
  // --- DATA STATE ---
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetching all core data simultaneously for performance
        const [clientsRes, productsRes, salesRes] = await Promise.all([
          api.get("/clients/", { params: { skip: 0, limit: 100 } }),
          api.get("/products/", { params: { skip: 0, limit: 100 } }),
          api.get("/sales/", { params: { skip: 0, limit: 100 } }),
        ]);

        setClients(clientsRes.data.items);
        setProducts(productsRes.data.items);
        setSales(salesRes.data.items);
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- BUSINESS LOGIC & CALCULATIONS ---

  // Calculate Total Money Earned
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);

  // Count Sales from Today
  const todayDate = new Date().toDateString();
  const salesCountToday = sales.filter(
    (sale) => new Date(sale.created_at).toDateString() === todayDate,
  ).length;

  // Find the Best Selling Product
  const productSalesMap = {};
  sales.forEach((sale) => {
    productSalesMap[sale.product_id] = (productSalesMap[sale.product_id] || 0) + sale.quantity;
  });

  const topProductId = Object.keys(productSalesMap).sort(
    (a, b) => productSalesMap[b] - productSalesMap[a]
  )[0];
  const topProduct = products.find((p) => p.id === Number(topProductId));

  // Filter Low Inventory Items
  const lowStockProducts = products.filter((p) => p.stock < 5);

  // Get the 5 most recent transactions
  const recentSalesList = [...sales].sort((a, b) => b.id - a.id).slice(0, 5);

  // --- HELPER FUNCTIONS ---
  const findClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.full_name : "—";
  };

  const findProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "—";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-indigo-500 animate-spin text-4xl">↻</div>
        <p className="text-gray-400 ml-4">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ALERT: Low Stock Notification */}
        {lowStockProducts.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 animate-[pulse_1s_ease-in-out_1]">
            <p className="text-red-400 font-semibold mb-2">
              Inventory Alert — {lowStockProducts.length} items need restocking
            </p>
            <div className="flex flex-wrap gap-3">
              {lowStockProducts.map((product) => (
                <span key={product.id} className="bg-red-500/20 text-red-300 text-sm px-3 py-1 rounded-full">
                  {product.name}: {product.stock} left
                </span>
              ))}
            </div>
          </div>
        )}

        {/* METRICS GRID: Overview */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white text-lg font-bold">General Statistics</h3>
            <span className="text-gray-500 text-sm">{sales.length} Sales Total</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard title="Total Clients" value={clients.length} footer="Registered customers" />
            <MetricCard title="Total Products" value={products.length} footer="Inventory items" />
            <MetricCard
              title="Total Revenue"
              value={`$${totalRevenue.toFixed(2)}`}
              footer="Accumulated earnings"
              isGreen
            />
          </div>
        </section>

        {/* METRICS GRID: Daily Activity */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="Sales Today" value={salesCountToday} footer="Transactions today" isIndigo />

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm uppercase">Top Selling Product</p>
            {topProduct ? (
              <>
                <p className="text-2xl font-bold text-white mt-2">{topProduct.name}</p>
                <p className="text-gray-500 text-xs mt-2">{productSalesMap[topProductId]} units sold</p>
              </>
            ) : (
              <p className="text-gray-500 text-sm mt-2">No data yet</p>
            )}
          </div>

          <MetricCard
            title="Low Stock"
            value={lowStockProducts.length}
            footer="Needs attention"
            isRed={lowStockProducts.length > 0}
          />
        </section>

        {/* RECENT ACTIVITY TABLE */}
        <section className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-white font-bold">Recent Sales Activity</h3>
          </div>
          <table className="w-full text-left">
            <thead className="text-gray-400 text-xs uppercase bg-gray-900/50">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {recentSalesList.map((sale) => (
                <tr key={sale.id} className="text-gray-300 hover:bg-gray-700/30">
                  <td className="px-6 py-4">{findClientName(sale.client_id)}</td>
                  <td className="px-6 py-4">{findProductName(sale.product_id)}</td>
                  <td className="px-6 py-4">{sale.quantity}</td>
                  <td className="px-6 py-4 text-green-400">${Number(sale.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* CHARTS SECTION */}
        <section className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-white text-lg font-bold mb-6">Revenue Growth Chart</h3>
          <RevenueChart sales={sales} />
        </section>

      </div>
    </div>
  );
}

// --- REUSABLE MINI-COMPONENT FOR CARDS ---
function MetricCard({ title, value, footer, isGreen, isRed, isIndigo }) {
  let valueColor = "text-white";
  if (isGreen) valueColor = "text-green-400";
  if (isRed) valueColor = "text-red-400";
  if (isIndigo) valueColor = "text-indigo-400";

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-sm">
      <p className="text-gray-400 text-sm uppercase font-semibold">{title}</p>
      <p className={`text-4xl font-bold mt-2 ${valueColor}`}>{value}</p>
      <p className="text-gray-500 text-xs mt-2">{footer}</p>
    </div>
  );
}

export default Dashboard;
