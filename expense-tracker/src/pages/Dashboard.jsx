import { useState, useMemo } from "react";
import PropTypes from "prop-types";

// buildConicGradient makes the circle chart
// by calculating percentages into CSS gradient
function buildConicGradient(values) {
  if (!values.length) return "conic-gradient(#334155 0 100%)";
  let start = 0;
  const slices = values.map((item) => {
    const end = start + item.percent;
    const slice = `${item.color} ${start}% ${end}%`;
    start = end;
    return slice;
  });
  return `conic-gradient(${slices.join(", ")})`;
}

export default function Dashboard({
  items,
  addItem,
  expenseCategories,
  incomeSources,
  categoryColors,
}) {
  // Local state just for the form
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [incomeSource, setIncomeSource] = useState("Salary");

  // useMemo means: only recalculate when items changes
  // not on every single render (performance)
  const totalIncome = useMemo(
    () => items
      .filter((x) => x.type === "income")
      .reduce((s, x) => s + x.amount, 0),
    [items]
  );

  const totalExpense = useMemo(
    () => items
      .filter((x) => x.type === "expense")
      .reduce((s, x) => s + x.amount, 0),
    [items]
  );

  const balance = totalIncome - totalExpense;

  // Calculate spending breakdown for circle chart
  const expenseBreakdown = useMemo(() => {
    const map = {};
    for (const cat of expenseCategories) map[cat] = 0;
    items
      .filter((x) => x.type === "expense")
      .forEach((x) => {
        map[x.category] = (map[x.category] || 0) + x.amount;
      });
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name,
        value,
        percent: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
        color: categoryColors[name] || "#94a3b8"
      }))
      .sort((a, b) => b.value - a.value);
  }, [items, totalExpense, expenseCategories, categoryColors]);

  const circleBg = buildConicGradient(expenseBreakdown);

  function handleSubmit(e) {
    e.preventDefault();
    const parsed = Number(amount);
    if (!title.trim() || parsed <= 0) return;

    // Create new transaction object
    const entry = {
      id: crypto.randomUUID(),
      title: title.trim(),
      amount: parsed,
      type,
      category: type === "expense" ? category : null,
      source: type === "income" ? incomeSource : null,
      date: new Date().toLocaleDateString()
    };

    // Send to App.jsx using addItem prop
    addItem(entry);
    setTitle("");
    setAmount("");
  }

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Add Transaction Form */}
      <form className="glass form" onSubmit={handleSubmit}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          placeholder={type === "expense" ? "Expense title" : "Income title"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {type === "expense" ? (
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {expenseCategories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        ) : (
          <select value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)}>
            {incomeSources.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        )}

        <button type="submit">Add</button>
      </form>

      {/* Summary Cards */}
      <section className="summary-grid">
        <div className="glass stat">
          <p>Income</p>
          <h3>${totalIncome.toFixed(2)}</h3>
        </div>
        <div className="glass stat">
          <p>Expense</p>
          <h3>${totalExpense.toFixed(2)}</h3>
        </div>
        <div className="glass stat">
          <p>Balance</p>
          <h3 className={balance < 0 ? "negative" : "positive"}>
            ${balance.toFixed(2)}
          </h3>
        </div>
      </section>

      {/* Spending Circle */}
      <div className="glass chart-card">
        <h2>Spending Circle</h2>
        <div className="circle-wrap">
          <div className="circle-chart" style={{ background: circleBg }} />
          <ul className="legend">
            {expenseBreakdown.length === 0 ? (
              <li>No expense data yet</li>
            ) : (
              expenseBreakdown.map((item) => (
                <li key={item.name}>
                  <span className="dot" style={{ background: item.color }} />
                  {item.name} — {item.percent.toFixed(1)}%
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// PropTypes tells React what type each prop should be
// Your professor requires this for code quality
Dashboard.propTypes = {
  items: PropTypes.array.isRequired,
  addItem: PropTypes.func.isRequired,
  expenseCategories: PropTypes.array.isRequired,
  incomeSources: PropTypes.array.isRequired,
  categoryColors: PropTypes.object.isRequired,
};