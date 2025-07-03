import Expense from '../models/expense.js';
export const getDashboardSummary = async (req, res) => {

  const now = new Date();
  const month = parseInt(req.query.month) || now.getMonth() + 1; 
  const year = parseInt(req.query.year) || now.getFullYear();

  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59); 

  try {
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryTotals = {};
    const paymentTotals = {};
    const dailyTotals = {};

    for (const e of expenses) {
      
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;

      
      paymentTotals[e.paymentMethod] = (paymentTotals[e.paymentMethod] || 0) + e.amount;

      // Group by day (e.g., "2025-07-03")
      const day = new Date(e.date).toISOString().split("T")[0];
      dailyTotals[day] = (dailyTotals[day] || 0) + e.amount;
    }

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const topPaymentMethods = Object.entries(paymentTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([method, amount]) => ({ method, amount }));

    const spendingByCategory = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    }));

    const spendingOverTime = Object.entries(dailyTotals).map(([date, amount]) => ({
      date,
      amount
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      totalSpent,
      topCategory,
      topPaymentMethods,
      spendingByCategory,
      spendingOverTime
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
