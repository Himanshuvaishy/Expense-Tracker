// Top imports remain unchanged
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pie, Bar, Line } from "react-chartjs-2";
import axios from "axios";
import nodeAPI from "../axios/nodeAPI";
import { useAuth } from "../context/AutoContext";
import SmartSuggestionBox from "../components/SmartSuggestionBox";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const getMonthName = (num) =>
  new Date(0, num - 1).toLocaleString("default", { month: "long" });

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState(null);

  const resetToCurrentMonth = () => {
    setMonth(today.getMonth() + 1);
    setYear(today.getFullYear());
  };

  const fetchDashboardData = async () => {
    try {
      const res = await nodeAPI.get(
        `/dashboard/summary?month=${month}&year=${year}&user_id=${user.id}`,
        { withCredentials: true }
      );
      setData(res.data);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [month, year, user?.id]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "";
    setUser(null);
    navigate("/login");
  };

  const goToAddExpense = () => navigate("/expenses");

  const barChartData = {
    labels: data?.topPaymentMethods.map((item) => item.method) || [],
    datasets: [
      {
        label: "Payment Method Amount (₹)",
        data: data?.topPaymentMethods.map((item) => item.amount) || [],
        backgroundColor: ["#4ade80", "#60a5fa", "#f87171"],
      },
    ],
  };

  const pieChartData = {
    labels: data?.spendingByCategory.map((item) => item.category) || [],
    datasets: [
      {
        data: data?.spendingByCategory.map((item) => item.amount) || [],
        backgroundColor: ["#fbbf24", "#34d399", "#60a5fa", "#f87171"],
      },
    ],
  };

  const lineChartData = {
    labels: data?.spendingOverTime.map((item) => item.date) || [],
    datasets: [
      {
        label: "Spending Over Time (₹)",
        data: data?.spendingOverTime.map((item) => item.amount) || [],
        borderColor: "#3b82f6",
        backgroundColor: "#93c5fd",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 👤 Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, <span className="text-blue-600">{user?.name || user?.email} 👋</span>
          </h1>
          <p className="text-gray-600 mt-1">
            📅 Data for <strong>{getMonthName(month)} {year}</strong>
          </p>
        </div>

        <div className="bg-white shadow rounded p-4 w-full md:w-auto space-y-1">
          <p className="text-sm text-gray-700"><strong>Name:</strong> {user?.name || "N/A"}</p>
          <p className="text-sm text-gray-700"><strong>Email:</strong> {user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-sm"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* 📅 Controls */}
      <div className="flex flex-wrap gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border px-3 py-2 rounded bg-white shadow-sm"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-3 py-2 rounded bg-white shadow-sm"
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <button
          onClick={resetToCurrentMonth}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          📅 Current Month
        </button>
        <button
          onClick={() => navigate("/budget-status")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          📊 View Budget Status
        </button>
        <button
          onClick={goToAddExpense}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          ➕ Add Expense
        </button>
      </div>

      {/* 📈 Dashboard Data */}
      {data ? (
        data.totalSpent === 0 ? (
          <p className="text-gray-500 text-center italic mt-10">
            No data available for {getMonthName(month)} {year}.
          </p>
        ) : (
          <>
            {/* 💰 Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 shadow hover:shadow-md rounded transition">
                <p className="text-gray-500">Total Spent</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">₹{data.totalSpent}</p>
              </div>
              <div className="bg-white p-4 shadow hover:shadow-md rounded transition">
                <p className="text-gray-500">Top Category</p>
                <p className="text-2xl font-semibold text-green-600 mt-1">{data.topCategory}</p>
              </div>
            </div>

            {/* 📊 Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 shadow rounded hover:shadow-md transition">
                <h2 className="text-lg font-semibold mb-2">Top Payment Methods</h2>
                <Bar data={barChartData} />
              </div>
              <div className="bg-white p-4 shadow rounded hover:shadow-md transition">
                <h2 className="text-lg font-semibold mb-2">Spending by Category</h2>
                <Pie data={pieChartData} />
              </div>
            </div>

            <div className="bg-white p-4 shadow rounded hover:shadow-md transition">
              <h2 className="text-lg font-semibold mb-2">Spending Over Time</h2>
              <Line data={lineChartData} />
            </div>

            {/* 💡 Smart Suggestions */}
            <div className="bg-white p-4 shadow rounded hover:shadow-md transition">
              <SmartSuggestionBox
                category={data.topCategory}
                amount={data.totalSpent}
              />
            </div>
<<<<<<< HEAD
=======

           
>>>>>>> a62f31edc65596630649d1325b8cdb3736a9d29d
          </>
        )
      ) : (
        <p className="text-center text-gray-500">Loading dashboard...</p>
      )}
    </div>
  );
};

export default Dashboard;
