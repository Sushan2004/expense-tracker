import PropTypes from "prop-types";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { formatCurrency as formatCurrencyValue } from "../utils/helpers";

const CurrencyContext = createContext(null);

const API_BASE_URL = "https://api.unirateapi.com";
const DEFAULT_PREFERENCE = {
  currency: "USD",
  rate: 1,
  updatedAt: ""
};

function normalizeCurrency(value) {
  const normalized = String(value || "USD").trim().toUpperCase();
  return normalized || "USD";
}

function isPositiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isIntlCurrencySupported(code) {
  try {
    new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(1);
    return true;
  } catch {
    return false;
  }
}

function getSupportedCurrencySet() {
  if (typeof Intl.supportedValuesOf !== "function") {
    return null;
  }

  try {
    return new Set(Intl.supportedValuesOf("currency").map((code) => normalizeCurrency(code)));
  } catch {
    return null;
  }
}

function filterFiatCurrencies(codes) {
  const supportedCurrencySet = getSupportedCurrencySet();

  return [...new Set((Array.isArray(codes) ? codes : []).map((code) => normalizeCurrency(code)))]
    .filter((code) => {
      if (supportedCurrencySet) {
        return supportedCurrencySet.has(code);
      }

      return /^[A-Z]{3}$/.test(code) && isIntlCurrencySupported(code);
    })
    .sort((left, right) => left.localeCompare(right));
}

async function readJsonResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
  }

  return data;
}

async function fetchSupportedCurrencies(apiKey) {
  const params = new URLSearchParams({
    api_key: apiKey
  });
  const response = await fetch(`${API_BASE_URL}/api/currencies?${params.toString()}`);
  const data = await readJsonResponse(response);

  if (!Array.isArray(data?.currencies)) {
    throw new Error("Currency list response was not in the expected format.");
  }

  return data.currencies;
}

async function fetchUsdRate(apiKey, targetCurrency) {
  const params = new URLSearchParams({
    api_key: apiKey,
    from: "USD",
    to: targetCurrency,
    amount: "1"
  });
  const response = await fetch(`${API_BASE_URL}/api/rates?${params.toString()}`);
  const data = await readJsonResponse(response);
  const nextRate = Number(data?.rate ?? data?.rates?.[targetCurrency]);

  if (!Number.isFinite(nextRate) || nextRate <= 0) {
    throw new Error(`No exchange rate was returned for ${targetCurrency}.`);
  }

  return nextRate;
}

export function CurrencyProvider({ children }) {
  const [storedPreference, setStoredPreference] = useLocalStorage("currencyPreference", DEFAULT_PREFERENCE);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [currencyError, setCurrencyError] = useState("");
  const hasLoadedCurrenciesRef = useRef(false);
  const didRefreshStoredRateRef = useRef(false);

  const apiKey = String(import.meta.env.VITE_UNIRATE_API_KEY || "").trim();
  const currency = normalizeCurrency(storedPreference?.currency);
  const rate = currency === "USD"
    ? 1
    : isPositiveNumber(storedPreference?.rate)
      ? Number(storedPreference.rate)
      : 1;
  const updatedAt = String(storedPreference?.updatedAt || "");

  const persistPreference = useCallback(
    (nextCurrency, nextRate) => {
      setStoredPreference({
        currency: normalizeCurrency(nextCurrency),
        rate: nextRate,
        updatedAt: new Date().toISOString()
      });
    },
    [setStoredPreference]
  );

  const loadCurrencies = useCallback(async () => {
    if (hasLoadedCurrenciesRef.current) {
      return availableCurrencies;
    }

    setIsLoadingCurrencies(true);

    try {
      if (!apiKey) {
        throw new Error("Currency API key is missing. Set VITE_UNIRATE_API_KEY to enable currency lookup.");
      }

      const fetchedCurrencies = await fetchSupportedCurrencies(apiKey);
      const filteredCurrencies = filterFiatCurrencies(fetchedCurrencies);

      hasLoadedCurrenciesRef.current = true;
      setAvailableCurrencies(filteredCurrencies);
      setCurrencyError("");

      return filteredCurrencies;
    } catch (error) {
      setCurrencyError(error.message || "Unable to load currencies.");
      return [];
    } finally {
      setIsLoadingCurrencies(false);
    }
  }, [apiKey, availableCurrencies]);

  const refreshRate = useCallback(async () => {
    if (currency === "USD") {
      if (rate !== 1) {
        persistPreference("USD", 1);
      }
      setCurrencyError("");
      return 1;
    }

    setIsLoadingRate(true);

    try {
      if (!apiKey) {
        throw new Error("Currency API key is missing. Set VITE_UNIRATE_API_KEY to enable exchange rates.");
      }

      const nextRate = await fetchUsdRate(apiKey, currency);
      persistPreference(currency, nextRate);
      setCurrencyError("");

      return nextRate;
    } catch (error) {
      setCurrencyError(error.message || `Unable to refresh the ${currency} exchange rate.`);
      return rate;
    } finally {
      setIsLoadingRate(false);
    }
  }, [apiKey, currency, persistPreference, rate]);

  const setCurrency = useCallback(
    async (nextCurrencyValue) => {
      const nextCurrency = normalizeCurrency(nextCurrencyValue);

      if (nextCurrency === currency) {
        setCurrencyError("");
        return true;
      }

      if (nextCurrency === "USD") {
        persistPreference("USD", 1);
        setCurrencyError("");
        return true;
      }

      setIsLoadingRate(true);

      try {
        if (!apiKey) {
          throw new Error("Currency API key is missing. Set VITE_UNIRATE_API_KEY to enable exchange rates.");
        }

        const nextRate = await fetchUsdRate(apiKey, nextCurrency);
        persistPreference(nextCurrency, nextRate);
        setCurrencyError("");

        return true;
      } catch (error) {
        setCurrencyError(error.message || `Unable to switch currency to ${nextCurrency}.`);
        return false;
      } finally {
        setIsLoadingRate(false);
      }
    },
    [apiKey, currency, persistPreference]
  );

  const convertAmount = useCallback(
    (baseUsdAmount) => {
      const amount = Number(baseUsdAmount);

      if (!Number.isFinite(amount)) {
        return 0;
      }

      return amount * rate;
    },
    [rate]
  );

  const formatCurrency = useCallback(
    (baseUsdAmount, options = {}) => formatCurrencyValue(convertAmount(baseUsdAmount), currency, options),
    [convertAmount, currency]
  );

  useEffect(() => {
    if (didRefreshStoredRateRef.current) {
      return;
    }

    didRefreshStoredRateRef.current = true;

    if (currency === "USD" && !updatedAt) {
      persistPreference("USD", 1);
      return;
    }

    if (currency !== "USD") {
      void refreshRate();
    }
  }, [currency, refreshRate, persistPreference, updatedAt]);

  const value = useMemo(
    () => ({
      currency,
      rate,
      updatedAt,
      availableCurrencies,
      isLoadingCurrencies,
      isLoadingRate,
      currencyError,
      setCurrency,
      loadCurrencies,
      refreshRate,
      convertAmount,
      formatCurrency
    }),
    [
      currency,
      rate,
      updatedAt,
      availableCurrencies,
      isLoadingCurrencies,
      isLoadingRate,
      currencyError,
      setCurrency,
      loadCurrencies,
      refreshRate,
      convertAmount,
      formatCurrency
    ]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

CurrencyProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used inside CurrencyProvider");
  }

  return context;
}
