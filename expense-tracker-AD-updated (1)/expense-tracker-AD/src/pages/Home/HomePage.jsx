import { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useTheme } from "../../context/ThemeContext";
import { getSummaryMetrics } from "../../utils/helpers";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const { transactions } = useAppContext();
  const { formatCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();

  const summary = useMemo(() => getSummaryMetrics(transactions), [transactions]);

  const thisWeek = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return transactions.filter((t) => new Date(t.date) >= weekAgo).length;
  }, [transactions]);

  const cards = [
    {
      label: "Monthly income",
      value: formatCurrency(summary.income),
      hint: "↑ Salary + freelance",
      tone: "hp-positive"
    },
    {
      label: "Total expenses",
      value: formatCurrency(summary.expenses),
      hint: summary.expenses > 2500
        ? `↓ $${(summary.expenses - 2500).toFixed(0)} over budget`
        : "↑ Within budget",
      tone: "hp-negative"
    },
    {
      label: "Savings rate",
      value: `${summary.savingsRate}%`,
      hint: "↑ Goal is 30%",
      tone: "hp-positive"
    },
    {
      label: "Transactions",
      value: String(transactions.length),
      hint: `↑ ${thisWeek} this week`,
      tone: "hp-default"
    }
  ];

  return (
    <div className="hp-shell">

      {/* NAV */}
      <nav className="hp-nav">
        <div className="hp-nav__brand">
          <div className="hp-nav__logo">A</div>
          <span className="hp-nav__name">MoneyFlow</span>
        </div>

        <div className="hp-nav__links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => isActive ? "hp-nav-link active" : "hp-nav-link"}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/expenses"
            className={({ isActive }) => isActive ? "hp-nav-link active" : "hp-nav-link"}
          >
            Transactions
          </NavLink>
          <NavLink
            to="/income"
            className={({ isActive }) => isActive ? "hp-nav-link active" : "hp-nav-link"}
          >
            Income
          </NavLink>
          <NavLink
            to="/money-flow"
            className={({ isActive }) => isActive ? "hp-nav-link active" : "hp-nav-link"}
          >
            Budget
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => isActive ? "hp-nav-link active" : "hp-nav-link"}
          >
            Settings
          </NavLink>
        </div>

        <div className="hp-nav__right">
          <button
            type="button"
            className="hp-nav__theme"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <div className="hp-nav__avatar">SU</div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hp-hero">
        <div className="hp-hero__left">
          <p className="hp-hero__greeting">Good morning, Sushan</p>
          <h1 className="hp-hero__title">Track smarter. Spend wiser.</h1>
          <p className="hp-hero__sub">
            Your personal finance dashboard — track income, manage expenses,
            visualize your money flow, and export your data anytime.
          </p>
          <div className="hp-hero__actions">
            <button
              type="button"
              className="hp-btn hp-btn--primary"
              onClick={() => navigate("/expenses")}
            >
              + Add expense
            </button>
            <button
              type="button"
              className="hp-btn hp-btn--ghost"
              onClick={() => navigate("/expenses")}
            >
              View transactions
            </button>
          </div>
        </div>

        <div className="hp-hero__right">
          <p className="hp-hero__bal-label">Total balance</p>
          <p className={`hp-hero__balance ${summary.balance < 0 ? "hp-neg" : "hp-pos"}`}>
            {formatCurrency(summary.balance)}
          </p>
          <p className="hp-hero__bal-hint hp-pos">
            ↑ Up ${Math.abs(summary.balance).toFixed(0)} this month
          </p>
        </div>
      </section>

      {/* CARDS */}
      <div className="hp-cards">
        {cards.map((card) => (
          <article key={card.label} className="hp-card">
            <p className="hp-card__label">{card.label}</p>
            <h2 className={`hp-card__value ${card.tone}`}>{card.value}</h2>
            <small className={`hp-card__hint ${card.tone}`}>{card.hint}</small>
          </article>
        ))}
      </div>

    </div>
  );
}
