import PropTypes from "prop-types";
import { useTheme } from "../../context/ThemeContext";

export default function Header({ title }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Finance Overview</p>
        <h1>{title}</h1>
      </div>
      <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme mode">
        {theme === "light" ? "Dark mode" : "Light mode"}
      </button>
    </header>
  );
}

Header.propTypes = {
  title: PropTypes.string.isRequired
};
