import Budget from "../models/budget.js";
import Expense from '../models/expense.js';



export const setBudget = async (req, res) => {
  const { category, amount } = req.body;

  if (!category || !amount) {
    return res.status(400).json({ message: "Category and amount are required." });
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  try {
    // Check if budget already exists for this user + category + month
    const existing = await Budget.findOne({ user: req.user.id, category, month, year });

    if (existing) {
      existing.amount = amount;
      await existing.save();
      return res.json({ message: "Budget updated successfully", budget: existing });
    }

    // Otherwise create new budget
    const budget = await Budget.create({
      user: req.user.id,
      category,
      amount,
      month,
      year
    });

    res.status(201).json({ message: "Budget created", budget });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id }).sort({ year: -1, month: -1 });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





export const getBudgetStatus = async (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  try {
    // 1. Get all budgets for current user, month, year
    const budgets = await Budget.find({
      user: req.user.id,
      month: currentMonth,
      year: currentYear
    });

    // 2. Get all expenses for current month
    const expenses = await Expense.find({
      user: req.user.id,
      date: {
        $gte: new Date(`${currentYear}-${currentMonth}-01`),
        $lte: new Date(`${currentYear}-${currentMonth + 1}-01`)
      }
    });

    // 3. Group total spent by category
    const spentByCategory = {};
    for (const expense of expenses) {
      const category = expense.category;
      if (!spentByCategory[category]) {
        spentByCategory[category] = 0;
      }
      spentByCategory[category] += expense.amount;
    }

    // 4. Compare with budgets and return status
    const statusReport = budgets.map(budget => {
      const spent = spentByCategory[budget.category] || 0;
      const percentage = (spent / budget.amount) * 100;

      let status = "Within budget";
      if (percentage >= 100) {
        status = "❌ Over budget";
      } else if (percentage >= 80) {
        status = "⚠️ 80% of budget used";
      }

      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        percentage: percentage.toFixed(2),
        status
      };
    });

    res.json(statusReport);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
