import { useEffect, useMemo, useState } from "react";
import StatusState from "../../components/ui/StatusState";
import { useCurrency } from "../../context/CurrencyContext";
import { useTheme } from "../../context/ThemeContext";

function getCurrencyLabel(displayNames, code) {
  const label = displayNames?.of(code);
  return label && label !== code ? `${label} (${code})` : code;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const {
    currency,
    rate,
    updatedAt,
    availableCurrencies,
    isLoadingCurrencies,
    isLoadingRate,
    currencyError,
    setCurrency,
    loadCurrencies
  } = useCurrency();
  const [currencyQuery, setCurrencyQuery] = useState("");

  useEffect(() => {
    void loadCurrencies();
  }, [loadCurrencies]);

  const currencyDisplayNames = useMemo(() => {
    try {
      return new Intl.DisplayNames(["en"], { type: "currency" });
    } catch {
      return null;
    }
  }, []);

  const filteredCurrencies = useMemo(() => {
    const query = currencyQuery.trim().toLowerCase();

    if (!query) {
      return availableCurrencies;
    }

    return availableCurrencies.filter((code) => {
      const label = getCurrencyLabel(currencyDisplayNames, code).toLowerCase();
      return code.toLowerCase().includes(query) || label.includes(query);
    });
  }, [availableCurrencies, currencyDisplayNames, currencyQuery]);

  const rateSummary = useMemo(() => {
    if (currency === "USD") {
      return "USD is the base currency. No conversion is applied.";
    }

    if (!updatedAt) {
      return "Latest exchange rate will appear after a successful refresh.";
    }

    return `1 USD = ${rate.toFixed(4)} ${currency}`;
  }, [currency, rate, updatedAt]);

  return (
    <div className="page-content settings-grid">
      <section className="panel">
        <h2>Theme</h2>
        <p className="muted">Choose how the app looks across every page.</p>
        <div className="settings-option-grid" role="radiogroup" aria-label="Theme selection">
          <button
            type="button"
            className={`settings-option ${theme === "light" ? "active" : ""}`}
            aria-pressed={theme === "light"}
            onClick={() => setTheme("light")}
          >
            <strong>Light Mode</strong>
            <span>Bright surfaces with dark text.</span>
          </button>
          <button
            type="button"
            className={`settings-option ${theme === "dark" ? "active" : ""}`}
            aria-pressed={theme === "dark"}
            onClick={() => setTheme("dark")}
          >
            <strong>Dark Mode</strong>
            <span>Low-light theme applied globally.</span>
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Currency</h2>
        <p className="muted">Search and choose the fiat currency used for displayed values.</p>

        <div className="currency-picker">
          <label>
            Search currency
            <input
              type="search"
              value={currencyQuery}
              onChange={(event) => setCurrencyQuery(event.target.value)}
              placeholder="Search by code or name..."
            />
          </label>

          <div className="currency-status" aria-live="polite">
            <strong>Current currency:</strong> {getCurrencyLabel(currencyDisplayNames, currency)}
            <br />
            <span>{isLoadingRate ? "Refreshing exchange rate..." : rateSummary}</span>
            {updatedAt ? (
              <>
                <br />
                <span>Last updated: {new Date(updatedAt).toLocaleString("en-US")}</span>
              </>
            ) : null}
          </div>

          {currencyError ? <p className="field-error">{currencyError}</p> : null}

          {isLoadingCurrencies ? (
            <StatusState type="loading" title="Loading currencies" description="Fetching available currencies for Settings." />
          ) : filteredCurrencies.length === 0 ? (
            <StatusState
              type="empty"
              title="No currencies found"
              description={currencyQuery ? "Try a different currency search." : "No supported fiat currencies are available right now."}
            />
          ) : (
            <div className="currency-list" role="listbox" aria-label="Available currencies">
              {filteredCurrencies.map((code) => (
                <button
                  key={code}
                  type="button"
                  className={`currency-option ${currency === code ? "active" : ""}`}
                  aria-selected={currency === code}
                  disabled={isLoadingRate}
                  onClick={() => {
                    void setCurrency(code);
                  }}
                >
                  <span className="currency-code">{code}</span>
                  <span className="currency-name">{getCurrencyLabel(currencyDisplayNames, code)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
