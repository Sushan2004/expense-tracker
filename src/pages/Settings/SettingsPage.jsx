import { useEffect, useMemo } from "react";
import ExportCsvButton from "../../components/ui/ExportCsvButton";
import { useAppContext } from "../../context/AppContext";
import SettingsDropdown from "../../components/ui/SettingsDropdown";
import { useCurrency } from "../../context/CurrencyContext";
import { useTheme } from "../../context/ThemeContext";

function getCurrencyLabel(displayNames, code) {
  const label = displayNames?.of(code);
  return label && label !== code ? `${label} (${code})` : code;
}

export default function SettingsPage() {
  const { transactions } = useAppContext();
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

  const themeOptions = useMemo(
    () => [
      {
        value: "dark",
        label: "Dark",
        description: "Default theme with low-light contrast."
      },
      {
        value: "light",
        label: "Light",
        description: "Bright surfaces with dark text."
      }
    ],
    []
  );
  const currencyOptions = useMemo(
    () =>
      availableCurrencies.map((code) => ({
        value: code,
        label: getCurrencyLabel(currencyDisplayNames, code),
        meta: code
      })),
    [availableCurrencies, currencyDisplayNames]
  );

  const selectedCurrencyLabel = useMemo(
    () => getCurrencyLabel(currencyDisplayNames, currency),
    [currency, currencyDisplayNames]
  );
  const expenses = useMemo(
    () => transactions.filter((item) => item.type === "expense"),
    [transactions]
  );
  const lastUpdatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString("en-US")
    : "Waiting for initial rate sync";

  return (
    <div className="page-content settings-grid">
      <section className="panel">
        <h2>Theme</h2>
        <p className="muted">Choose how the app looks across every page.</p>
        <SettingsDropdown
          value={theme}
          options={themeOptions}
          onSelect={async (nextTheme) => {
            setTheme(nextTheme);
          }}
          listAriaLabel="Theme options"
          renderTrigger={(selectedOption) => (
            <>
              <span>{selectedOption?.label || "Theme"}</span>
              <span className="settings-dropdown-trigger-meta">Theme</span>
            </>
          )}
          renderOption={(option) => (
            <>
              <span className="settings-dropdown-option-label">{option.label}</span>
              <span className="settings-dropdown-option-description">{option.description}</span>
            </>
          )}
        />
        <small className="muted">Changes apply immediately and stay saved until you switch again.</small>
      </section>

      <section className="panel">
        <h2>Currency</h2>
        <p className="muted">Search and choose the fiat currency used for displayed values.</p>

        <div className="currency-picker">
          <SettingsDropdown
            value={currency}
            options={currencyOptions}
            onSelect={setCurrency}
            listAriaLabel="Available currencies"
            searchable
            searchLabel="Search currency"
            searchPlaceholder="Search by code or name..."
            getSearchText={(option) => `${option.meta} ${option.label}`}
            disabled={isLoadingCurrencies}
            isLoading={isLoadingCurrencies}
            loadingMessage="Loading currencies..."
            emptyMessage="No currencies match your search."
            renderTrigger={(selectedOption) => (
              <>
                <span>{selectedOption?.label || selectedCurrencyLabel}</span>
                <span className="settings-dropdown-trigger-meta">{selectedOption?.meta || currency}</span>
              </>
            )}
            renderOption={(option) => (
              <>
                <span className="settings-dropdown-option-label">{option.meta}</span>
                <span className="settings-dropdown-option-description">{option.label}</span>
              </>
            )}
          />

          <div className="currency-status" aria-live="polite">
            <strong>Current currency:</strong> {selectedCurrencyLabel}
            <br />
            <span>{isLoadingRate ? "Refreshing exchange rate..." : `1 USD = ${rate.toFixed(4)} ${currency}`}</span>
            <br />
            <span>Last updated: {lastUpdatedLabel}</span>
          </div>

          {currencyError ? <p className="field-error">{currencyError}</p> : null}
        </div>
      </section>

      <section className="panel">
        <h2>Export Data</h2>
        <p className="muted">Download all expense records as a CSV file for backup or analysis.</p>
        <ExportCsvButton
          transactions={expenses}
          filename="expenses-export.csv"
          disabled={expenses.length === 0}
          label="Export Expenses as CSV"
        />
      </section>
    </div>
  );
}
