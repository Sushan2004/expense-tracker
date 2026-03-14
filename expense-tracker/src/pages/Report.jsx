import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
// (required before using any chart)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Report({
  items,
  expenseCategories,
  categoryColors,
}) {
  // ExchangeRate API state
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState("USD");

  // Calculate totals
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

  // Spending per category for bar chart
  const categoryTotals = useMemo(() => {
    const map = {};
    for (const cat of expenseCategories) map[cat] = 0;
    items
      .filter((x) => x.type === "expense")
      .forEach((x) => {
        map[x.category] = (map[x.category] || 0) + x.amount;
      });
    return map;
  }, [items, expenseCategories]);

  // Fetch exchange rates from API
  // useEffect runs when component loads
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then((res) => {
        // Check if response is ok
        if (!res.ok) throw new Error("Failed to fetch rates");
        return res.json();
      })
      .then((data) => {
        setRates(data.rates);
        setLoading(false);
      })
      .catch((err) => {
        // Show error state if API fails
        setError("Could not load exchange rates.");
        setLoading(false);
      });
  }, []); // [] means run once when page loads

  // Convert amount based on selected currency
  const convertedExpense = rates
    ? (totalExpense * rates[currency]).toFixed(2)
    : totalExpense.toFixed(2);

  // Bar chart data
  const chartData = {
    labels: expenseCategories,
    datasets: [
      {
        label: "Amount Spent ($)",
        data: expenseCategories.map((cat) => categoryTotals[cat] || 0),
        backgroundColor: expenseCategories.map(
          (cat) => categoryColors[cat] + "99" // 99 = 60% opacity
        ),
        borderColor: expenseCategories.map((cat) => categoryColors[cat]),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Spending by Category",
        color: "#e5e7eb",
      },
    },
    scales: {
      x: { ticks: { color: "#94a3b8" } },
      y: { ticks: { color: "#94a3b8" } },
    },
  };

  return (
    <div>
      <h1>Report</h1>

      {/* Summary Cards */}
      <section className="summary-grid">
        <div className="glass stat">
          <p>Total Income</p>
          <h3>${totalIncome.toFixed(2)}</h3>
        </div>
        <div className="glass stat">
          <p>Total Expense</p>
          <h3>${totalExpense.toFixed(2)}</h3>
        </div>
        <div className="glass stat">
          <p>Balance</p>
          <h3 className={totalIncome - totalExpense < 0 ? "negative" : "positive"}>
            ${(totalIncome - totalExpense).toFixed(2)}
          </h3>
        </div>
      </section>

      {/* Bar Chart */}
      <div className="glass chart-card" style={{ marginBottom: "16px" }}>
        <h2>Spending by Category</h2>
        {items.filter((x) => x.type === "expense").length === 0 ? (
          <div className="empty-state">
            <p>😕 No expense data yet.</p>
            <small>Add some expenses to see the chart.</small>
          </div>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>

      {/* Currency Converter — ExchangeRate API */}
      <div className="glass chart-card">
        <h2>Currency Converter</h2>
        <p style={{ color: "var(--muted)" }}>
          See your total expenses in different currencies.
        </p>

        {/* Loading state */}
        {loading && <p>Loading exchange rates...</p>}

        {/* Error state */}
        {error && <p className="over-budget">{error}</p>}

        {/* Converter — only shows when rates loaded */}
        {rates && (
          <div className="converter">
            <p>Your total expenses: <strong>${totalExpense.toFixed(2)} USD</strong></p>

            {/* Controlled select input */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {Object.keys(rates).map((cur) => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>

            <h3 className="positive">
              = {convertedExpense} {currency}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}

Report.propTypes = {
  items: PropTypes.array.isRequired,
  expenseCategories: PropTypes.array.isRequired,
  categoryColors: PropTypes.object.isRequired,
};