import React from "react";
import ReactDOM from "react-dom/client";
import {
  createHashRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
  useParams
} from "react-router-dom";
import App from "./App";
import { AppProvider } from "./context/AppContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { ThemeProvider } from "./context/ThemeContext";
import AboutPage from "./pages/About/AboutPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DetailsPage from "./pages/Details/DetailsPage";
import ExpensesPage from "./pages/Expenses/ExpensesPage";
import IncomePage from "./pages/Income/IncomePage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import "./styles.css";

function LegacyDetailsRedirect() {
  const { id } = useParams();

  return <Navigate to={`/expenses/${id}`} replace />;
}

const router = createHashRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<DashboardPage />} handle={{ title: "Dashboard" }} />
      <Route path="income" element={<IncomePage />} handle={{ title: "Income" }} />
      <Route path="expenses" element={<ExpensesPage />} handle={{ title: "Expense History" }} />
      <Route path="expenses/:id" element={<DetailsPage />} handle={{ title: "Expense Details" }} />
      <Route path="transactions" element={<Navigate to="/expenses" replace />} />
      <Route path="details/:id" element={<LegacyDetailsRedirect />} />
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
