import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import TransactionDetail from './pages/TransactionDetail.jsx';
import AddEntry from './pages/AddEntry.jsx';
import Budget from './pages/Budget.jsx';
import Reports from './pages/Reports.jsx';
import Categories from './pages/Categories.jsx';
import Wallet from './pages/Wallet.jsx';
import Goals from './pages/Goals.jsx';
import Settings from './pages/Settings.jsx';
import About from './pages/About.jsx';
import Signup from './pages/Signup.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="transactions/:id" element={<TransactionDetail />} />
        <Route path="add" element={<AddEntry />} />
        <Route path="budget" element={<Budget />} />
        <Route path="reports" element={<Reports />} />
        <Route path="categories" element={<Categories />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="goals" element={<Goals />} />
        <Route path="settings" element={<Settings />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
