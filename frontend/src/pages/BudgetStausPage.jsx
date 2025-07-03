import { useEffect, useState } from "react";
import nodeAPI from "../axios/nodeAPI";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AutoContext";

const BudgetStatusPage = () => {
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [updatedCategory, setUpdatedCategory] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchStatus = async () => {
    if (!user?.id) return;
    try {
      const res = await nodeAPI.get("/budget/status");
      setStatus(res.data);
    } catch (err) {
      console.error("Failed to load budget status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchStatus();
    }
  }, [user?.id]);

  const handleEdit = (category, currentAmount) => {
    setEditingCategory(category);
    setEditAmount(currentAmount);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setEditAmount("");
  };

  const handleSave = async (category) => {
    try {
      await nodeAPI.post("/budget/setbudget", {
        category,
        amount: Number(editAmount),
      });

      setEditingCategory(null);
      setUpdatedCategory(category);
      setToastMessage(`✅ Budget for '${category}' updated!`);
      fetchStatus();

      setTimeout(() => {
        setUpdatedCategory(null);
        setToastMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error updating budget:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "under":
        return "text-green-600 bg-green-100";
      case "over":
        return "text-red-600 bg-red-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 relative">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 flex items-center gap-2">
        📊 Budget Status Overview
      </h1>

      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-5 py-2 rounded shadow-lg z-50 transition duration-300">
          {toastMessage}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : status.length === 0 ? (
        <div className="text-center mt-10">
          <p className="text-gray-600 text-lg">No budget found for this month.</p>
          <button
            onClick={() => navigate("/setbudget")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            ➕ Set Budget Now
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-left text-sm uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="p-4">Category</th>
                  <th className="p-4">Budget (₹)</th>
                  <th className="p-4">Spent (₹)</th>
                  <th className="p-4">Used (%)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {status.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`border-t text-sm ${
                      updatedCategory === item.category ? "bg-green-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-4 font-medium capitalize">{item.category}</td>
                    <td className="p-4">
                      {editingCategory === item.category ? (
                        <input
                          type="number"
                          className="border border-gray-300 p-1 px-2 rounded w-24"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        `₹${item.budget}`
                      )}
                    </td>
                    <td className="p-4 text-gray-700">₹{item.spent}</td>
                    <td className="p-4">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="h-4 rounded-full bg-blue-500 text-xs text-white text-center"
                          style={{
                            width: `${Math.min(item.percentage, 100)}%`,
                          }}
                        >
                          {item.percentage}%
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 space-x-2">
                      {editingCategory === item.category ? (
                        <>
                          <button
                            onClick={() => handleSave(item.category)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(item.category, item.budget)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Updated Back to Dashboard button */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-sm hover:bg-blue-700 transition duration-200"
            >
              <span className="text-lg">←</span>
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <button
              onClick={() => navigate("/setbudget")}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
            >
              ➕ Set Another Budget
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetStatusPage;
