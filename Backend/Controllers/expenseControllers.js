import Expense from "../models/expense.js";

export const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      user: req.user.id,
      ...req.body,
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExpenses = async (req, res) => {
  const { category, paymentMethod, fromDate, toDate, search } = req.query;

  const query = { user: req.user.id };

  // Case-insensitive filters with .trim() check
  if (category && category.trim() !== "") {
    query.category = { $regex: new RegExp(category.trim(), "i") };
  }

  if (paymentMethod && paymentMethod.trim() !== "") {
    query.paymentMethod = { $regex: new RegExp(paymentMethod.trim(), "i") };
  }

  if (search && search.trim() !== "") {
    query.notes = { $regex: new RegExp(search.trim(), "i") };
  }


  if (fromDate || toDate) {
    query.date = {};
    if (fromDate) query.date.$gte = new Date(fromDate);
    if (toDate) query.date.$lte = new Date(toDate);
  }

  try {
    const all = await Expense.find({ user: req.user.id });

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateExpense = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated)
      return res
        .status(404)
        .json({ message: "You do not have permission to update this expense" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });
    if (!deleted)
      return res
        .status(404)
        .json({
          message: "You do not have permission to delete this expense.",
        });
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
