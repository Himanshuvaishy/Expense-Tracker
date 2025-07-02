import Budget from "../models/budget.js";
import Expense from "../models/expense.js";

// ✅ Set or update budget
export const setBudget = async (req, res) => {
  let { category, amount } = req.body;

  if (!category || !amount) {
    return res.status(400).json({ message: "Category and amount are required." });
  }

  // Normalize category (lowercase, trimmed)
  const categoryNormalized = category.trim().toLowerCase();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  try {
    const existing = await Budget.findOne({
      user: req.user.id,
      category: categoryNormalized,
      month,
      year,
    });

    if (existing) {
      existing.amount = amount;
      await existing.save();
      return res.json({ message: "Budget updated successfully", budget: existing });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category: categoryNormalized,
      amount,
      month,
      year,
    });

    res.status(201).json({ message: "Budget created", budget });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get all budgets (history view)
export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id }).sort({ year: -1, month: -1 });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get current month's budget status
export const getBudgetStatus = async (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  try {
    const budgets = await Budget.find({
      user: req.user.id,
      month: currentMonth,
      year: currentYear,
    });

    const expenses = await Expense.find({
      user: req.user.id,
      date: {
        $gte: new Date(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`),
        $lt: new Date(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`)
      },
    });

    // 🔧 Group expenses by lowercase category
    const spentByCategory = {};
    for (const expense of expenses) {
      const category = expense.category.trim().toLowerCase();
      spentByCategory[category] = (spentByCategory[category] || 0) + expense.amount;
    }

    const statusReport = budgets.map((budget) => {
      const categoryKey = budget.category.trim().toLowerCase(); // normalize for matching
      const spent = spentByCategory[categoryKey] || 0;
      const remaining = Math.max(budget.amount - spent, 0);
      const percentage = spent === 0 ? 0 : (spent / budget.amount) * 100;

      let status = "✅ Within budget";
      if (percentage >= 100) {
        status = "❌ Over budget";
      } else if (percentage >= 90) {
        status = "⚠️ 90% of budget used";
      } else if (percentage >= 80) {
        status = "⚠️ 80% of budget used";
      }

      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        remaining,
        percentage: Number(percentage.toFixed(2)),
        status,
      };
    });

    res.json(statusReport);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
