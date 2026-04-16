import PropTypes from "prop-types";

export default function TransactionFilters({ filters, onFiltersChange, categoryOptions }) {
  function updateField(event) {
    const { name, value } = event.target;
    onFiltersChange((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="panel">
      <h2>Search and Filter Expenses</h2>
      <div className="filters-grid">
        <label>
          Search
          <input
            type="text"
            name="query"
            value={filters.query}
            onChange={updateField}
            placeholder="Find by description..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-autocomplete="none"
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
          Sort by
          <select name="sortBy" value={filters.sortBy} onChange={updateField}>
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
        </label>
      </div>
    </section>
  );
}

TransactionFilters.propTypes = {
  filters: PropTypes.shape({
    query: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    sortBy: PropTypes.string.isRequired
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  categoryOptions: PropTypes.arrayOf(PropTypes.string).isRequired
};
