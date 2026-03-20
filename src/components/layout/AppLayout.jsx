import { Outlet, useMatches } from "react-router-dom";
import Header from "./Header";
import SidebarNav from "./SidebarNav";

export default function AppLayout() {
  const matches = useMatches();
  const activeMatch = [...matches].reverse().find((match) => match.handle?.title);
  const title = activeMatch?.handle?.title || "Expense Tracker";

  return (
    <div className="app-shell">
      <SidebarNav />
      <main className="app-main">
        <Header title={title} />
        <Outlet />
      </main>
    </div>
  );
}
