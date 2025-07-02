import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AutoContext"; // ✅ Access logged-in user

const ExpensesPage = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    category: "",
    date: "",
    paymentMethod: "",
    notes: "",
  });

  const [filters, setFilters] = useState({
    category: "",
    paymentMethod: "",
    fromDate: "",
    toDate: "",
    search: "",
  });

  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  const fetchExpenses = async () => {
    if (!user?.id) return;

    try {
      const queryParams = new URLSearchParams();

      if (filters.category) queryParams.append("category", filters.category);
      if (filters.paymentMethod) queryParams.append("paymentMethod", filters.paymentMethod);
      if (filters.fromDate) queryParams.append("fromDate", filters.fromDate);
      if (filters.toDate) queryParams.append("toDate", filters.toDate);
      if (filters.search) queryParams.append("search", filters.search);

      queryParams.append("userId", user.id);

      const res = await axios.get(
        `http://localhost:7777/api/expenses/getExpenses?${queryParams.toString()}`,
        { withCredentials: true }
      );
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

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
    if (user?.id) {
      fetchExpenses();
    }
  }, [user?.id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedForm = {
      ...form,
      category: form.category.trim().toLowerCase(),
    };

    try {
      await axios.post(
        "http://localhost:7777/api/expenses/createExpense",
        normalizedForm,
        { withCredentials: true }
      );

      // ✅ Update monthly report
      await axios.post(`http://localhost:5000/api/reports/update/${user.id}`);

      setForm({
        amount: "",
        category: "",
        date: "",
        paymentMethod: "",
        notes: "",
      });

      fetchExpenses();
    } catch (err) {
      console.error("Error creating expense:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:7777/api/expenses/deleteExpense/${id}`,
        { withCredentials: true }
      );

      // ✅ Update monthly report
      await axios.post(`http://localhost:5000/api/reports/update/${user.id}`);

      fetchExpenses();
    } catch (err) {
      console.error("Error deleting expense:", err);
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

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    const normalizedEditForm = {
      ...editForm,
      category: editForm.category.trim().toLowerCase(),
    };

    try {
      await axios.put(
        `http://localhost:7777/api/expenses/updateExpense/${editingId}`,
        normalizedEditForm,
        { withCredentials: true }
      );

      // ✅ Update monthly report
      await axios.post(`http://localhost:5000/api/reports/update/${user.id}`);

      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      console.error("Error updating expense:", err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <button
          onClick={() => navigate("/")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          ⬅️ Back to Dashboard
        </button>
      </div>

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
          Add Expense
        </button>
      </form>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Filter Expenses</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Category"
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="border p-2 rounded"
          />
          <select
            value={filters.paymentMethod}
            onChange={(e) =>
              setFilters({ ...filters, paymentMethod: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Cash">Cash</option>
          </select>
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              className="border p-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="border p-2 rounded"
            />
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="border p-2 rounded col-span-2"
          />
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={fetchExpenses}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setFilters({
                category: "",
                paymentMethod: "",
                fromDate: "",
                toDate: "",
                search: "",
              });
              fetchExpenses();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

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
                    className="border p-1 rounded mb-1 w-full"
                  />
                  <input
                    type="text"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="border p-1 rounded mb-1 w-full"
                  />
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    className="border p-1 rounded mb-1 w-full"
                  />
                  <select
                    name="paymentMethod"
                    value={editForm.paymentMethod}
                    onChange={handleEditChange}
                    className="border p-1 rounded mb-1 w-full"
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
                    className="border p-1 rounded mb-2 w-full"
                    placeholder="Notes (optional)"
                  />
                  <button
                    onClick={saveEdit}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <p>
                    <strong>₹{expense.amount}</strong> on{" "}
                    {new Date(expense.date).toDateString()}
                  </p>
                  <p>Category: {expense.category}</p>
                  <p>Method: {expense.paymentMethod}</p>
                  <p className="break-words whitespace-pre-wrap">
                    Note:{" "}
                    {expense.notes.length > 100
                      ? `${expense.notes.slice(0, 100)}...`
                      : expense.notes}
                  </p>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => startEdit(expense)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
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
