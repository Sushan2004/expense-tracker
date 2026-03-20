import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const ThemeContext = createContext(null);

function normalizeTheme(value) {
  return value === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [storedTheme, setStoredTheme] = useLocalStorage("themePreference", "light");
  const theme = normalizeTheme(storedTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (nextTheme) => {
        setStoredTheme(normalizeTheme(nextTheme));
      },
      toggleTheme: () => {
        setStoredTheme((current) => (normalizeTheme(current) === "light" ? "dark" : "light"));
      }
    }),
    [theme, setStoredTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
