import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import nodeAPI from "../axios/nodeAPI";
import { useAuth } from "../context/AutoContext";

const ExpensesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    amount: "",
    category: "",
    date: "",
    paymentMethod: "",
    notes: "",
  });

  const [editForm, setEditForm] = useState({});

  const [filters, setFilters] = useState({
    category: "",
    paymentMethod: "",
    fromDate: "",
    toDate: "",
    search: "",
  });

  // Fetch Expenses
  const fetchExpenses = async () => {
    if (!user?.id) return;

    try {
      const queryParams = new URLSearchParams({ userId: user.id });

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const res = await nodeAPI.get(`/expenses/getExpenses?${queryParams.toString()}`);
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial & filter reset effects
  useEffect(() => {
    setFilters({
      category: "",
      paymentMethod: "",
      fromDate: "",
      toDate: "",
      search: "",
    });
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchExpenses();
  }, [user?.id]);

  // Handlers
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newExpense = {
      ...form,
      category: form.category.trim().toLowerCase(),
    };

    try {
      await nodeAPI.post("/expenses/createExpense", newExpense);
      toast.success("Expense added ✅");

      setForm({ amount: "", category: "", date: "", paymentMethod: "", notes: "" });
      fetchExpenses();
    } catch (err) {
      toast.error("Failed to add expense ❌");
    }
  };

  const handleDelete = async (id) => {
    try {
      await nodeAPI.delete(`/expenses/deleteExpense/${id}`);
      toast.success("Expense deleted 🗑️");
      fetchExpenses();
    } catch (err) {
      toast.error("Failed to delete expense ❌");
    }
  };

  const startEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      amount: expense.amount,
      category: expense.category,
      date: expense.date.slice(0, 10),
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || "",
    });
  };

  const saveEdit = async () => {
    const updatedExpense = {
      ...editForm,
      category: editForm.category.trim().toLowerCase(),
    };

    try {
      await nodeAPI.put(`/expenses/updateExpense/${editingId}`, updatedExpense);
      toast.success("Expense updated ✏️");
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      toast.error("Failed to update expense ❌");
    }
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      paymentMethod: "",
      fromDate: "",
      toDate: "",
      search: "",
    });
    fetchExpenses();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ToastContainer />

      {/* Back Navigation */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-sm hover:bg-blue-700 transition duration-200"
        >
          <span className="text-lg">←</span>
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </div>

      {/* Add Expense Form */}
      <h1 className="text-2xl font-bold mb-4">Add New Expense</h1>

      <form onSubmit={handleSubmit} className="grid gap-4 bg-white p-4 rounded shadow mb-6">
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Amount (₹)"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category"
          className="border p-2 rounded"
          required
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <select
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Payment Method</option>
          <option value="UPI">UPI</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Cash">Cash</option>
        </select>
        <input
          type="text"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes (optional)"
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          ➕ Add Expense
        </button>
      </form>

      {/* Filter Section */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Filter Expenses</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Category"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="border p-2 rounded"
          />
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Cash">Cash</option>
          </select>
          <div>
            <label className="block text-sm text-gray-600 mb-1">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              className="border p-2 rounded w-full"
            />
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border p-2 rounded col-span-2"
          />
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={fetchExpenses}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🔍 Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            ❌ Clear Filters
          </button>
        </div>
      </div>

      {/* Expense List */}
      <h2 className="text-xl font-semibold mb-2">Your Expenses</h2>

      {loading ? (
        <p>Loading...</p>
      ) : expenses.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense._id} className="border p-4 rounded bg-white shadow">
              {editingId === expense._id ? (
                <>
                  <input
                    type="number"
                    name="amount"
                    value={editForm.amount}
                    onChange={handleEditChange}
                    className="border p-2 rounded mb-2 w-full"
                  />
                  <input
                    type="text"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="border p-2 rounded mb-2 w-full"
                  />
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    className="border p-2 rounded mb-2 w-full"
                  />
                  <select
                    name="paymentMethod"
                    value={editForm.paymentMethod}
                    onChange={handleEditChange}
                    className="border p-2 rounded mb-2 w-full"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                  <input
                    type="text"
                    name="notes"
                    value={editForm.notes}
                    onChange={handleEditChange}
                    className="border p-2 rounded mb-2 w-full"
                    placeholder="Notes (optional)"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={saveEdit}
                      className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>₹{expense.amount}</strong> on {new Date(expense.date).toDateString()}
                  </p>
                  <p>Category: {expense.category}</p>
                  <p>Method: {expense.paymentMethod}</p>
                  <p className="break-words whitespace-pre-wrap">
                    Note: {expense.notes.length > 100 ? `${expense.notes.slice(0, 100)}...` : expense.notes}
                  </p>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => startEdit(expense)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
