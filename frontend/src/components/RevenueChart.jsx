import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// 1. Registra los componentes
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// 2. Recibe sales como prop
function RevenueChart({ sales }) {
  // Agrupa ventas por mes y suma el total
  const revenueByMonth = {};

  sales.forEach((sale) => {
    // "2024-03" — año-mes como clave
    const month = new Date(sale.created_at).toISOString().slice(0, 7);
    revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(sale.total);
  });

  // Ordenar las claves cronológicamente
  const months = Object.keys(revenueByMonth).sort();
  const revenues = months.map((m) => revenueByMonth[m]);

  // 4. Construye el objeto data
  const data = {
    labels: months,
    datasets: [
      {
        label: "Revenue ($)",
        data: revenues,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)", // transparente para el área
        tension: 0.4,
        fill: true, // rellena el área bajo la línea
      },
    ],
  };

  // 5. Opciones del gráfico
  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#9ca3af" } },
    },
    scales: {
      x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
      y: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
    },
  };

  // Cuenta cuántas ventas hubo por mes (no el total en dinero)
  const salesCountByMonth = {};
  sales.forEach((sale) => {
    const month = new Date(sale.created_at).toISOString().slice(0, 7);
    salesCountByMonth[month] = (salesCountByMonth[month] || 0) + 1;
  });

  const salesMonths = Object.keys(salesCountByMonth).sort();
  const salesCounts = salesMonths.map((m) => salesCountByMonth[m]);

  const barData = {
    labels: salesMonths,
    datasets: [
      {
        label: "Number of Sales",
        data: salesCounts,
        backgroundColor: "rgba(16, 185, 129, 0.7)", // verde
        borderRadius: 4,
      },
    ],
  };
  if (months.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 col-span-2">
        <p className="text-gray-500 text-center py-8">No sales data yet.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white font-bold mb-4">Revenue by Month</h3>
        <Line data={data} options={options} />
      </div>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white font-bold mb-4">Sales by Month</h3>
        <Bar data={barData} options={options} />
      </div>
    </div>
  );
}

export default RevenueChart;
