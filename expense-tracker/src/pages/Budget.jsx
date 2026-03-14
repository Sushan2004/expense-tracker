import { useState, useMemo } from "react";
import PropTypes from "prop-types";

export default function Budget({
  items,
  budgets,
  updateBudget,
  expenseCategories,
  categoryColors,
}) {
  // Track which category is being edited
  const [editingCategory, setEditingCategory] = useState(null);
  // Track the new budget value being typed
  const [inputValue, setInputValue] = useState("");

  // Calculate how much spent per category
  const spentByCategory = useMemo(() => {
    const map = {};
    for (const cat of expenseCategories) map[cat] = 0;
    items
      .filter((x) => x.type === "expense")
      .forEach((x) => {
        map[x.category] = (map[x.category] || 0) + x.amount;
      });
    return map;
  }, [items, expenseCategories]);

  function handleEdit(category) {
    // Open edit mode for this category
    setEditingCategory(category);
    // Pre-fill input with current budget
    setInputValue(budgets[category]);
  }

  function handleSave(category) {
    const parsed = Number(inputValue);
    // Validate — must be positive number
    if (!parsed || parsed <= 0) return;
    // Send update to App.jsx
    updateBudget(category, parsed);
    // Close edit mode
    setEditingCategory(null);
    setInputValue("");
  }

  function handleCancel() {
    setEditingCategory(null);
    setInputValue("");
  }

  return (
    <div>
      <h1>Budget Limits</h1>
      <p style={{ color: "var(--muted)" }}>
        Set monthly spending limits for each category.
      </p>

      <div className="budget-grid">
        {expenseCategories.map((cat) => {
          const spent = spentByCategory[cat] || 0;
          const limit = budgets[cat];
          const percent = Math.min((spent / limit) * 100, 100);
          const isOver = spent > limit;
          const isEditing = editingCategory === cat;

          return (
            <div key={cat} className="glass budget-card">

              {/* Category name and edit button */}
              <div className="budget-head">
                <span style={{ color: categoryColors[cat], fontWeight: 600 }}>
                  {cat}
                </span>

                {/* Show save/cancel when editing
                    Show edit button when not editing */}
                {isEditing ? (
                  <div className="budget-actions">
                    <button onClick={() => handleSave(cat)}>Save</button>
                    <button onClick={handleCancel}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => handleEdit(cat)}>Edit</button>
                )}
              </div>

              {/* Edit input — only shows when editing */}
              {isEditing && (
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="New budget limit"
                  autoFocus
                />
              )}

              {/* Spent vs Limit amounts */}
              <div className="budget-amounts">
                <span>${spent.toFixed(2)} spent</span>
                <span>${limit.toFixed(2)} limit</span>
              </div>

              {/* Progress bar */}
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${percent}%`,
                    // Red if over budget, category color if not
                    background: isOver ? "#f43f5e" : categoryColors[cat]
                  }}
                />
              </div>

              {/* Warning message when over budget */}
              {isOver && (
                <p className="over-budget">
                  ⚠️ Over by ${(spent - limit).toFixed(2)}
                </p>
              )}

              {/* How much left */}
              {!isOver && (
                <p className="budget-remaining">
                  ✅ ${(limit - spent).toFixed(2)} remaining
                </p>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

Budget.propTypes = {
  items: PropTypes.array.isRequired,
  budgets: PropTypes.object.isRequired,
  updateBudget: PropTypes.func.isRequired,
  expenseCategories: PropTypes.array.isRequired,
  categoryColors: PropTypes.object.isRequired,
};