import { useState, useMemo } from "react";
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
  Filler,
  Legend,
} from "chart.js";

// Global ChartJS component registration
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

// RevenueChart: Visualizes sales performance using Line and Bar charts.

function RevenueChart({ sales }) {
  // --- DATA PROCESSING (useMemo avoids recalculating on every render) ---
  const { chartLabels, revenueValues, salesCountValues } = useMemo(() => {
    const revenueMap = {};
    const countMap = {};

    sales.forEach((sale) => {
      // Formats date to YYYY-MM (e.g., 2026-04)
      const monthKey = new Date(sale.created_at).toISOString().slice(0, 7);

      revenueMap[monthKey] = (revenueMap[monthKey] || 0) + Number(sale.total);
      countMap[monthKey] = (countMap[monthKey] || 0) + 1;
    });

    // Ensure chronological order
    const sortedMonths = Object.keys(revenueMap).sort();

    return {
      chartLabels: sortedMonths,
      revenueValues: sortedMonths.map((m) => revenueMap[m]),
      salesCountValues: sortedMonths.map((m) => countMap[m]),
    };
  }, [sales]);

  // --- CHART CONFIGURATIONS ---
  const globalOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows the chart to fill its container
    plugins: {
      legend: { labels: { color: "#9ca3af", font: { size: 12 } } },
    },
    scales: {
      x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
      y: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
    },
  };

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Revenue ($)",
        data: revenueValues,
        borderColor: "#6366f1", // Indigo
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#6366f1",
      },
    ],
  };

  const barChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Volume of Sales",
        data: salesCountValues,
        backgroundColor: "rgba(16, 185, 129, 0.7)", // Emerald Green
        borderRadius: 6,
      },
    ],
  };

  // --- EMPTY STATE ---
  if (chartLabels.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
        <p className="text-gray-500 font-medium italic">
          Waiting for sales activity...
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Revenue Line Chart */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
        <h3 className="text-gray-200 font-bold mb-6 text-lg">
          Financial Performance
        </h3>
        <div className="h-64">
          <Line data={lineChartData} options={globalOptions} />
        </div>
      </div>

      {/* Sales Volume Bar Chart */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
        <h3 className="text-gray-200 font-bold mb-6 text-lg">
          Transaction Volume
        </h3>
        <div className="h-64">
          <Bar data={barChartData} options={globalOptions} />
        </div>
      </div>
    </div>
  );
}

export default RevenueChart;
