import { useState, useMemo } from "react";
import PropTypes from "prop-types";

export default function Transactions({
  items,
  deleteItem,
  expenseCategories,
  incomeSources,
}) {
  // Local state for search and filter
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  // useMemo — only recalculate when
  // items, search, filter or sort changes
  const filtered = useMemo(() => {
    let result = [...items];

    // Filter by type (all/income/expense)
    if (filter !== "all") {
      result = result.filter((x) => x.type === filter);
    }

    // Search by title (case insensitive)
    if (search.trim()) {
      result = result.filter((x) =>
        x.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by newest or oldest
    if (sort === "newest") {
      result = result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sort === "highest") {
      result = result.sort((a, b) => b.amount - a.amount);
    } else if (sort === "lowest") {
      result = result.sort((a, b) => a.amount - b.amount);
    }

    return result;
  }, [items, search, filter, sort]);

  return (
    <div>
      <h1>Transactions</h1>

      {/* Search and Filter Controls */}
      <div className="glass controls">

        {/* Search bar — controlled input */}
        <input
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filter by type */}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="expense">Expenses only</option>
          <option value="income">Income only</option>
        </select>

        {/* Sort */}
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="highest">Highest amount</option>
          <option value="lowest">Lowest amount</option>
        </select>

      </div>

      {/* Transaction count */}
      <p className="result-count">
        Showing {filtered.length} of {items.length} transactions
      </p>

      {/* Transaction List */}
      <section className="glass history">
        {filtered.length === 0 ? (
          // Empty state — professor requires helpful empty states
          <div className="empty-state">
            <p>😕 No transactions found.</p>
            <small>Try changing your search or filter.</small>
          </div>
        ) : (
          <ul className="list">
            {filtered.map((item) => (
              <li key={item.id} className="item">
                <div>
                  <p className="title">{item.title}</p>
                  <small>
                    {item.type === "expense"
                      ? `Category: ${item.category}`
                      : `Source: ${item.source}`
                    } | {item.date}
                  </small>
                </div>
                <div className="right">
                  <span className={item.type === "expense" ? "expense" : "income"}>
                    {item.type === "expense" ? "-" : "+"}${item.amount.toFixed(2)}
                  </span>
                  <button
                    className="delete"
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

Transactions.propTypes = {
  items: PropTypes.array.isRequired,
  deleteItem: PropTypes.func.isRequired,
  expenseCategories: PropTypes.array.isRequired,
  incomeSources: PropTypes.array.isRequired,
};