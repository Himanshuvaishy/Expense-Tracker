import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AutoContext";
import nodeAPI from "../axios/nodeAPI";
import { useNavigate } from "react-router-dom";
import { Pie, Bar, Line } from "react-chartjs-2";
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
import SmartSuggestionBox from "../components/SmartSuggestionBox";
import ReportHistory from "../components/ReportHistory";

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

  const goToAddExpense = () => {
    navigate("/expenses");
  };

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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, <span className="text-blue-600">{user?.name || user?.email} 👋</span>
          </h1>
          <p className="text-gray-600 mt-2">
            📅 Showing data for:{" "}
            <strong>{getMonthName(month)} {year}</strong>
          </p>
        </div>

        <div className="bg-white shadow rounded p-3 mt-4 md:mt-0 w-full md:w-auto">
          <p className="text-sm text-gray-700">
            <strong>Name:</strong> {user?.name || "N/A"}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Email:</strong> {user?.email}
          </p>
          <button
            onClick={handleLogout}
            className="mt-3 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 w-full"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border px-3 py-1 rounded"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {getMonthName(i + 1)}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-3 py-1 rounded"
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <button
          onClick={resetToCurrentMonth}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          📅 Current Month
        </button>
        <button
          onClick={() => navigate("/budget-status")}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          📊 View Budget Status
        </button>
        <button
          onClick={goToAddExpense}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          ➕ Add Expense
        </button>
      </div>

      {data ? (
        data.totalSpent === 0 ? (
          <p className="text-gray-500 text-center italic my-10">
            No data available for {getMonthName(month)} {year}.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 shadow rounded">
                <p className="text-gray-600">Total Spent</p>
                <p className="text-2xl font-semibold text-blue-600">
                  ₹{data.totalSpent}
                </p>
              </div>
              <div className="bg-white p-4 shadow rounded">
                <p className="text-gray-600">Top Category</p>
                <p className="text-2xl font-semibold text-green-600">
                  {data.topCategory}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 shadow rounded">
                <h2 className="text-lg font-semibold mb-2">
                  Top Payment Methods
                </h2>
                <Bar data={barChartData} />
              </div>
              <div className="bg-white p-4 shadow rounded">
                <h2 className="text-lg font-semibold mb-2">
                  Spending by Category
                </h2>
                <Pie data={pieChartData} />
              </div>
            </div>

            <div className="bg-white p-4 shadow rounded mb-6">
              <h2 className="text-lg font-semibold mb-2">Spending Over Time</h2>
              <Line data={lineChartData} />
            </div>

            <div className="bg-white p-4 shadow rounded mb-10">
              <SmartSuggestionBox
                category={data.topCategory}
                amount={data.totalSpent}
              />
            </div>

            <ReportHistory userId={user.id} />
          </>
        )
      ) : (
        <p className="text-center text-gray-500">Loading dashboard...</p>
      )}
    </div>
  );
};

export default Dashboard;
