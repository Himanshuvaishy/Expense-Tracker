import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const SetBudgetPage = () => {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedCategory = category.trim().toLowerCase();

    try {
      await axios.post(
        "http://localhost:7777/api/budget/setbudget",
        { category: normalizedCategory, amount },
        { withCredentials: true }
      );
      alert("✅ Budget set successfully!");
      navigate("/budget-status"); // ✅ no full reload
    } catch (err) {
      alert(
        "Failed to set budget: " + (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded mt-8">
      <h2 className="text-xl font-bold mb-4">Set Monthly Budget</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g. Food"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g. 5000"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save Budget
        </button>
      </form>
    </div>
  );
};

export default SetBudgetPage;
