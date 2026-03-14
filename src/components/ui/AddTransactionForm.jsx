import PropTypes from "prop-types";
import { useState } from "react";
import { CATEGORY_OPTIONS, INCOME_SOURCE_OPTIONS, validateTransaction } from "../../utils/helpers";

const initialForm = {
  description: "",
  amount: "",
  category: "Food",
  type: "expense",
  incomeSource: "Salary",
  isRecurring: false,
  recurringFrequency: "",
  date: new Date().toISOString().split("T")[0]
};

export default function AddTransactionForm({ onAdd }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setForm((current) => {
      const next = { ...current, [name]: nextValue };
      if (name === "type" && value === "income") {
        next.isRecurring = false;
        next.recurringFrequency = "";
      }
      if (name === "isRecurring" && !checked) {
        next.recurringFrequency = "";
      }
      return next;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateTransaction(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onAdd({
      id: crypto.randomUUID(),
      description: form.description.trim(),
      amount: Number(form.amount),
      category: form.type === "income" ? form.incomeSource : form.category,
      type: form.type,
      incomeSource: form.type === "income" ? form.incomeSource : "",
      isRecurring: form.type === "expense" ? Boolean(form.isRecurring) : false,
      recurringFrequency: form.type === "expense" && form.isRecurring ? form.recurringFrequency : "",
      date: form.date
    });

    setForm(initialForm);
    setErrors({});
  }

  return (
    <section className="panel">
      <h2>Add Transaction</h2>
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
          Amount
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
        <label>
          Category
          {form.type === "expense" ? (
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          ) : (
            <input value="Auto from income source" disabled aria-label="Category auto-generated from income source" />
          )}
        </label>
        <label>
          Type
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        {form.type === "income" ? (
          <label>
            Income Source
            <select
              name="incomeSource"
              value={form.incomeSource}
              onChange={handleChange}
              aria-invalid={Boolean(errors.incomeSource)}
            >
              {INCOME_SOURCE_OPTIONS.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            {errors.incomeSource ? <small className="field-error">{errors.incomeSource}</small> : null}
          </label>
        ) : (
          <>
            <label className="checkbox-label">
              <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handleChange} />
              Recurring Expense
            </label>
            {form.isRecurring ? (
              <label>
                Recurring Frequency
                <select
                  name="recurringFrequency"
                  value={form.recurringFrequency}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.recurringFrequency)}
                >
                  <option value="">Select frequency</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                {errors.recurringFrequency ? <small className="field-error">{errors.recurringFrequency}</small> : null}
              </label>
            ) : null}
          </>
        )}
        <label>
          Date
          <input name="date" type="date" value={form.date} onChange={handleChange} />
        </label>
        <button type="submit" className="primary-btn">
          Add Transaction
        </button>
      </form>
    </section>
  );
}

AddTransactionForm.propTypes = {
  onAdd: PropTypes.func.isRequired
};
