import PropTypes from "prop-types";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SidebarNav from "./SidebarNav";

export default function AppLayout({ appContext }) {
  return (
    <div className="app-shell">
      <SidebarNav />
      <main className="app-main">
        <Header title="Expense Tracker" />
        <Outlet context={appContext} />
      </main>
    </div>
  );
}

AppLayout.propTypes = {
  appContext: PropTypes.shape({
    transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
    favorites: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])).isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    isEmpty: PropTypes.bool.isRequired,
    addTransaction: PropTypes.func.isRequired,
    deleteTransaction: PropTypes.func.isRequired,
    toggleFavorite: PropTypes.func.isRequired,
    recentSearches: PropTypes.arrayOf(PropTypes.string).isRequired,
    setRecentSearches: PropTypes.func.isRequired
  }).isRequired
};
