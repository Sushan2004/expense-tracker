import { useMemo, useState } from "react";

const expenseCategories = [
  "Food",
  "Saving",
  "Investing",
  "Subscription",
  "Rent",
  "Transport",
  "Bills",
  "Other"
];

const incomeSources = [
  "Salary",
  "Freelance",
  "Scholarship",
  "Family",
  "Part-time",
  "Other"
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

export default function App() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [incomeSource, setIncomeSource] = useState("Salary");

  const totalIncome = useMemo(
    () => items.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0),
    [items]
  );

  const totalExpense = useMemo(
    () => items.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0),
    [items]
  );

  const balance = totalIncome - totalExpense;

  const expenseBreakdown = useMemo(() => {
    const map = {};
    for (const categoryName of expenseCategories) map[categoryName] = 0;

    items
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        map[item.category] = (map[item.category] || 0) + item.amount;
      });

    const entries = Object.entries(map)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        percent: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
        color: categoryColors[name] || "#94a3b8"
      }))
      .sort((a, b) => b.value - a.value);

    return entries;
  }, [items, totalExpense]);

  const circleBg = buildConicGradient(expenseBreakdown);

  function addEntry(event) {
    event.preventDefault();
    const parsed = Number(amount);

    if (!title.trim() || parsed <= 0) return;

    const entry = {
      id: crypto.randomUUID(),
      title: title.trim(),
      amount: parsed,
      type,
      category: type === "expense" ? category : null,
      source: type === "income" ? incomeSource : null,
      date: new Date().toLocaleDateString()
    };

    setItems((prev) => [entry, ...prev]);
    setTitle("");
    setAmount("");
  }

  function deleteEntry(id) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="container">
      <h1>Expense Tracker</h1>

      <form className="glass form" onSubmit={addEntry}>
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
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        ) : (
          <select value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)}>
            {incomeSources.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        )}

        <button type="submit">Add</button>
      </form>

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
          <h3 className={balance < 0 ? "negative" : "positive"}>${balance.toFixed(2)}</h3>
        </div>
      </section>

      <section className="charts-grid">
        <div className="glass chart-card">
          <h2>Category Bar Chart</h2>
          {expenseBreakdown.length === 0 ? (
            <p>No expense data yet.</p>
          ) : (
            <div className="bars">
              {expenseBreakdown.map((item) => (
                <div key={item.name} className="bar-row">
                  <div className="bar-head">
                    <span>{item.name}</span>
                    <span>${item.value.toFixed(2)}</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${item.percent}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass chart-card">
          <h2>Spending Circle</h2>
          <div className="circle-wrap">
            <div className="circle-chart" style={{ background: circleBg }} />
            <ul className="legend">
              {expenseBreakdown.length === 0 ? (
                <li>No data</li>
              ) : (
                expenseBreakdown.map((item) => (
                  <li key={item.name}>
                    <span className="dot" style={{ background: item.color }} />
                    {item.name} - {item.percent.toFixed(1)}%
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="glass history">
        <h2>History</h2>
        {items.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <ul className="list">
            {items.map((item) => (
              <li key={item.id} className="item">
                <div>
                  <p className="title">{item.title}</p>
                  <small>
                    {item.type === "expense" ? `Category: ${item.category}` : `Source: ${item.source}`} |{" "}
                    {item.date}
                  </small>
                </div>
                <div className="right">
                  <span className={item.type === "expense" ? "expense" : "income"}>
                    {item.type === "expense" ? "-" : "+"}${item.amount.toFixed(2)}
                  </span>
                  <button className="delete" onClick={() => deleteEntry(item.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
