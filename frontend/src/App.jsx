import { BrowserRouter, Routes, Route } from "react-router-dom";
import ExpensesPage from "./pages/ExpensePage"; // ✅ double check this
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import BudgetStatusPage from "./pages/BudgetStausPage";
import SetBudgetPage from "./pages/setBudget";
import ProtectedRoute from "./components/ProtecteRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget-status"
          element={
            <ProtectedRoute>
              <BudgetStatusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setbudget"
          element={
            <ProtectedRoute>
              <SetBudgetPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
