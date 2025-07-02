import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import pythonAPI from "../axios/pythonAPI"; // ✅ Use Flask backend
import { isReportSaved, markReportSaved } from "../utilis/reportStorage";
import { useAuth } from "../context/AutoContext";
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
  const reportSavedRef = useRef(false);

  const resetToCurrentMonth = () => {
    setMonth(today.getMonth() + 1);
    setYear(today.getFullYear());
  };

  const fetchDashboardData = async () => {
    try {
      const res = await pythonAPI.get(`/dashboard/summary?month=${month}&year=${year}&user_id=${user.id}`)
      setData(res.data);
      reportSavedRef.current = false;
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [month, year]);

  useEffect(() => {
    if (data?.totalSpent > 0 && data?.topCategory && user?.id) {
      const key = `report_saved_${user.id}_${month}_${year}`;
      const existing = JSON.parse(localStorage.getItem(key));

      const needsUpdate =
        !existing ||
        existing.totalSpent !== data.totalSpent ||
        existing.topCategory !== data.topCategory;

      if (needsUpdate) {
        const saveReport = async () => {
          try {
            await pythonAPI.post("/save-report", {
              user_id: user.id,
              month: getMonthName(month),
              year,
              total_spent: data.totalSpent,
              top_category: data.topCategory,
              overbudget_categories: data.overbudgetCategories || [],
            });

            toast.success("📊 Monthly report saved!", {
              toastId: "monthly-report-toast",
            });

            localStorage.setItem(
              key,
              JSON.stringify({
                totalSpent: data.totalSpent,
                topCategory: data.topCategory,
                savedAt: new Date().toISOString(),
              })
            );
          } catch (err) {
            toast.error("❌ Failed to save monthly report", {
              toastId: "monthly-report-error",
            });
            console.error("❌ Error saving report:", err);
          }
        };

        saveReport();
      }
    }
  }, [data?.totalSpent, data?.topCategory, user?.id, month, year]);

  const handleLogout = () => {
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
      {/* ...unchanged JSX code from earlier... */}
    </div>
  );
};

export default Dashboard;
