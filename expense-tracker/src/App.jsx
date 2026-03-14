import { useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Report from "./pages/Report";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import useLocalStorage from "./hooks/useLocalStorage";

// ---- constant data (never changes) ----
const expenseCategories = [
  "Food", "Saving", "Investing", "Subscription",
  "Rent", "Transport", "Bills", "Other"
];

const incomeSources = [
  "Salary", "Freelance", "Scholarship",
  "Family", "Part-time", "Other"
];

const categoryColors = {
  Food: "#38bdf8",
  Saving: "#22c55e",
  Investing: "#f59e0b",
  Subscription: "#a78bfa",
  Rent: "#f43f5e",
  Transport: "#14b8a6",
  Bills: "#fb7185",
  Other: "#94a3b8"
};

const defaultBudgets = {
  Food: 500, Saving: 1000, Investing: 1000,
  Subscription: 100, Rent: 1500,
  Transport: 200, Bills: 300, Other: 200
};

export default function App() {

  // useLocalStorage is our custom hook
  // instead of useState (lost on refresh)
  // this saves to browser memory permanently
  const [items, setItems] = useLocalStorage("transactions", []);
  const [budgets, setBudgets] = useLocalStorage("budgets", defaultBudgets);

  // useCallback means: only recreate this 
  // function if setItems changes (performance)
  const addItem = useCallback((entry) => {
    setItems((prev) => [entry, ...prev]);
  }, [setItems]);

  const deleteItem = useCallback((id) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, [setItems]);

  const updateBudget = useCallback((category, value) => {
    setBudgets((prev) => ({ ...prev, [category]: value }));
  }, [setBudgets]);

  // sharedProps = all data we send to every page
  // instead of rewriting these in every page
  const sharedProps = {
    items,
    budgets,
    addItem,
    deleteItem,
    updateBudget,
    expenseCategories,
    incomeSources,
    categoryColors,
    defaultBudgets
  };

  return (
    <>
      {/* Navbar shows on every page */}
      <Navbar />

      <div className="container">
        {/* Routes = the traffic controller */}
        <Routes>
          <Route path="/" element={<Dashboard {...sharedProps} />} />
          <Route path="/transactions" element={<Transactions {...sharedProps} />} />
          <Route path="/budget" element={<Budget {...sharedProps} />} />
          <Route path="/report" element={<Report {...sharedProps} />} />
          <Route path="/about" element={<About />} />
          {/* * means anything that doesn't match above = 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}