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
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Dec",
    ],
    datasets: [
      {
        label: "Revenue",
        data: [100, 250, 180, 90, 68, 100, 85, 70, 120, 255],
        borderColor: "#6366f1",
        backgroundColor: "#6366f1",
        tension: 0.4, // curva suave en la línea
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

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-white font-bold mb-4">Revenue by Month</h3>
      <Line data={data} options={options} />
    </div>
  );
}

export default RevenueChart;
