import { NavLink } from "react-router-dom";

// NavLink is like a normal <a> tag BUT
// it automatically adds "active" class
// when you're on that page
// so we can highlight the current page

export default function Navbar() {
  return (
    <nav className="navbar glass">
      <span className="nav-brand">💰 ExpenseTracker</span>

      <div className="nav-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/budget">Budget</NavLink>
        <NavLink to="/report">Report</NavLink>
        <NavLink to="/about">About</NavLink>
      </div>
    </nav>
  );
}