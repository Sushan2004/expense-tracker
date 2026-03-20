import { useMemo, useState } from "react";
import AddIncomeSourceModal from "../../components/ui/AddIncomeSourceModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import StatusState from "../../components/ui/StatusState";
import { useAppContext } from "../../context/AppContext";
import { useCurrency } from "../../context/CurrencyContext";
import { formatDate, formatRecurringFrequency } from "../../utils/helpers";

export default function IncomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const { transactions, addIncomeEntry, deleteIncome } = useAppContext();
  const { formatCurrency } = useCurrency();

  const incomeEntries = useMemo(
    () => transactions.filter((item) => item.type === "income"),
    [transactions]
  );

  return (
    <div className="page-content">
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Income</h2>
            <p className="muted">Track salary, freelance, passive income, and other recurring income sources.</p>
          </div>
          <button type="button" className="primary-btn" onClick={() => setIsModalOpen(true)}>
            + Add Income Source
          </button>
        </div>
      </section>

      {incomeEntries.length === 0 ? (
        <StatusState
          type="empty"
          title="No income sources yet"
          description="Add your first income source to start separating income from expenses."
        />
      ) : (
        <section className="panel table-wrap">
          <h2>Income Sources</h2>
          <table>
            <caption className="sr-only">Income source list</caption>
            <thead>
              <tr>
                <th scope="col">Source</th>
                <th scope="col">Amount</th>
                <th scope="col">Date</th>
                <th scope="col">Frequency</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomeEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <strong>{entry.incomeSource || entry.description}</strong>
                  </td>
                  <td className="income">{formatCurrency(entry.amount)}</td>
                  <td>{formatDate(entry.date)}</td>
                  <td>{entry.isRecurring ? formatRecurringFrequency(entry.recurringFrequency) : "One-time"}</td>
                  <td className="table-actions-cell">
                    <div className="row-actions table-actions-row">
                      <button
                        type="button"
                        className="ghost-btn danger"
                        onClick={() => setPendingDeleteId(entry.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <AddIncomeSourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addIncomeEntry}
      />
      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete Income Source"
        message="Are you sure you want to delete this income source? This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          deleteIncome(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}
