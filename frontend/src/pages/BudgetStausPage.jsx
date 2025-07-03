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

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      <h1 className="text-2xl font-bold mb-4">📊 Budget Status</h1>

      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : status.length === 0 ? (
        <div className="text-center mt-8">
          <p className="text-gray-600 text-lg">No budget found for this month.</p>
          <button
            onClick={() => navigate("/setbudget")}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          >
            ➕ Set Budget Now
          </button>
        </div>
      ) : (
        <>
          <table className="w-full border border-gray-200 rounded overflow-hidden">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Budget (₹)</th>
                <th className="p-3">Spent (₹)</th>
                <th className="p-3">Used (%)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {status.map((item, idx) => (
                <tr
                  key={idx}
                  className={`border-t hover:bg-gray-50 ${
                    updatedCategory === item.category ? "bg-green-100" : ""
                  }`}
                >
                  <td className="p-3 font-medium">{item.category}</td>
                  <td className="p-3">
                    {editingCategory === item.category ? (
                      <input
                        type="number"
                        className="border p-1 rounded w-24"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                      />
                    ) : (
                      `₹${item.budget}`
                    )}
                  </td>
                  <td className="p-3">₹{item.spent}</td>
                  <td className="p-3">{item.percentage}%</td>
                  <td className="p-3">{item.status}</td>
                  <td className="p-3 space-x-2">
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

          <div className="flex justify-between mt-6">
            <button
              onClick={() => navigate("/")}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              ⬅️ Back to Dashboard
            </button>
            <button
              onClick={() => navigate("/setbudget")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
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
