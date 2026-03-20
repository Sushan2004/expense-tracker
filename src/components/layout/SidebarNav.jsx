import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/income", label: "Income" },
  { to: "/expenses", label: "Expense" },
  { to: "/settings", label: "Settings" },
  { to: "/about", label: "About" }
];

export default function SidebarNav() {
  return (
    <nav className="side-nav" aria-label="Primary">
      {links.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          end={item.to === "/"}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
