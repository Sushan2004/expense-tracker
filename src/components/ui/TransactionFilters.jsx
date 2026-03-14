import PropTypes from "prop-types";
export default function TransactionFilters({ filters, onFiltersChange, recentSearches, categoryOptions }) {
  function updateField(event) {
    const { name, value } = event.target;
    onFiltersChange((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="panel">
      <h2>Search and Filter</h2>
      <div className="filters-grid">
        <label>
          Search
          <input
            type="search"
            name="query"
            value={filters.query}
            onChange={updateField}
            placeholder="Find by description..."
          />
        </label>
        <label>
          Category
          <select name="category" value={filters.category} onChange={updateField}>
            <option value="all">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select name="type" value={filters.type} onChange={updateField}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label>
          Sort by
          <select name="sortBy" value={filters.sortBy} onChange={updateField}>
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
        </label>
      </div>

      {recentSearches.length > 0 ? (
        <div className="chips-wrap" aria-label="Recent searches">
          {recentSearches.map((item) => (
            <button
              type="button"
              key={item}
              className="chip"
              onClick={() => onFiltersChange((current) => ({ ...current, query: item }))}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

TransactionFilters.propTypes = {
  filters: PropTypes.shape({
    query: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    sortBy: PropTypes.string.isRequired
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  recentSearches: PropTypes.arrayOf(PropTypes.string).isRequired,
  categoryOptions: PropTypes.arrayOf(PropTypes.string).isRequired
};
