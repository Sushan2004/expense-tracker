import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  CUSTOM_EXPENSE_CATEGORY_TRIGGER,
  getExpenseCategoryOptions,
  RECURRING_FREQUENCY_OPTIONS,
  resolveExpenseCategoryName,
  validateExpense
} from "../../utils/helpers";

const initialForm = {
  description: "",
  amount: "",
  category: "Food",
  customCategory: "",
  isRecurring: false,
  recurringFrequency: "",
  date: new Date().toISOString().split("T")[0]
};

export default function AddTransactionForm({ onAdd }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const { customExpenseCategories, addCustomExpenseCategory } = useAppContext();

  const categoryOptions = useMemo(
    () => getExpenseCategoryOptions(customExpenseCategories),
    [customExpenseCategories]
  );

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setForm((current) => {
      const next = { ...current, [name]: nextValue };

      if (name === "category" && value !== CUSTOM_EXPENSE_CATEGORY_TRIGGER) {
        next.customCategory = "";
      }

      if (name === "isRecurring" && !checked) {
        next.recurringFrequency = "";
      }

      return next;
    });

    setErrors((current) => {
      if (name === "category" && value !== CUSTOM_EXPENSE_CATEGORY_TRIGGER) {
        return { ...current, category: "", customCategory: "" };
      }

      if (name === "customCategory") {
        return { ...current, customCategory: "" };
      }

      return { ...current, [name]: "" };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateExpense(form, customExpenseCategories);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const categoryName = form.category === CUSTOM_EXPENSE_CATEGORY_TRIGGER
      ? resolveExpenseCategoryName(form.customCategory, customExpenseCategories)
      : resolveExpenseCategoryName(form.category, customExpenseCategories);

    if (form.category === CUSTOM_EXPENSE_CATEGORY_TRIGGER && categoryName) {
      addCustomExpenseCategory(categoryName);
    }

    onAdd({
      id: crypto.randomUUID(),
      description: form.description.trim(),
      amount: Number(form.amount),
      category: categoryName,
      type: "expense",
      incomeSource: "",
      isRecurring: Boolean(form.isRecurring),
      recurringFrequency: form.isRecurring ? form.recurringFrequency : "",
      date: form.date
    });

    setForm(initialForm);
    setErrors({});
  }

  const showCustomCategoryInput = form.category === CUSTOM_EXPENSE_CATEGORY_TRIGGER;

  return (
    <section className="panel">
      <h2>Add Expense</h2>
      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <label>
          Description
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description ? <small className="field-error">{errors.description}</small> : null}
        </label>
        <label>
          Amount (USD)
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            aria-invalid={Boolean(errors.amount)}
          />
          {errors.amount ? <small className="field-error">{errors.amount}</small> : null}
        </label>
        <label className="category-field">
          Category
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            aria-invalid={Boolean(errors.category || errors.customCategory)}
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="category-field-slot">
            {showCustomCategoryInput ? (
              <>
                <input
                  name="customCategory"
                  value={form.customCategory}
                  onChange={handleChange}
                  placeholder="Enter custom category"
                  aria-invalid={Boolean(errors.customCategory)}
                />
                {errors.customCategory ? (
                  <small className="field-error">{errors.customCategory}</small>
                ) : null}
              </>
            ) : null}
          </div>
          {errors.category ? <small className="field-error">{errors.category}</small> : null}
        </label>
        <label className="checkbox-label">
          <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handleChange} />
          Recurring expense
        </label>
        {form.isRecurring ? (
          <label>
            Recurring frequency
            <select
              name="recurringFrequency"
              value={form.recurringFrequency}
              onChange={handleChange}
              aria-invalid={Boolean(errors.recurringFrequency)}
            >
              <option value="">Select frequency</option>
              {RECURRING_FREQUENCY_OPTIONS.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </option>
              ))}
            </select>
            {errors.recurringFrequency ? (
              <small className="field-error">{errors.recurringFrequency}</small>
            ) : null}
          </label>
        ) : (
          <div className="form-grid-spacer" aria-hidden="true" />
        )}
        <label>
          Date
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            aria-invalid={Boolean(errors.date)}
          />
          {errors.date ? <small className="field-error">{errors.date}</small> : null}
        </label>
        <button type="submit" className="primary-btn">
          Add Expense
        </button>
      </form>
      <p className="form-note muted">Expenses are stored in USD. Settings only changes displayed values.</p>
    </section>
  );
}

AddTransactionForm.propTypes = {
  onAdd: PropTypes.func.isRequired
};
