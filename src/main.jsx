import React from "react";
import ReactDOM from "react-dom/client";
import {
  createHashRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider
} from "react-router-dom";
import App from "./App";
import { AppProvider } from "./context/AppContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { ThemeProvider } from "./context/ThemeContext";
import AboutPage from "./pages/About/AboutPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DetailsPage from "./pages/Details/DetailsPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import TransactionsPage from "./pages/Transactions/TransactionsPage";
import "./styles.css";

const router = createHashRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<DashboardPage />} handle={{ title: "Dashboard" }} />
      <Route path="transactions" element={<TransactionsPage />} handle={{ title: "Transactions" }} />
      <Route path="details/:id" element={<DetailsPage />} handle={{ title: "Transaction Details" }} />
      <Route path="settings" element={<SettingsPage />} handle={{ title: "Settings" }} />
      <Route path="about" element={<AboutPage />} handle={{ title: "About" }} />
      <Route path="home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} handle={{ title: "Not Found" }} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <CurrencyProvider>
        <AppProvider>
          <RouterProvider router={router} />
        </AppProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </React.StrictMode>
);
