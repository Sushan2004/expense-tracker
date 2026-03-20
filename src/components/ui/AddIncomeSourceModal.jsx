import PropTypes from "prop-types";
import { useState } from "react";
import ModalDialog from "./ModalDialog";
import { RECURRING_FREQUENCY_OPTIONS, validateIncomeSource } from "../../utils/helpers";

const initialForm = {
  sourceName: "",
  amount: "",
  date: "",
  frequency: ""
};

export default function AddIncomeSourceModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleClose() {
    setForm(initialForm);
    setErrors({});
    onClose();
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateIncomeSource(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSave({
      id: crypto.randomUUID(),
      sourceName: form.sourceName.trim(),
      amount: Number(form.amount),
      date: form.date || new Date().toISOString().slice(0, 10),
      recurringFrequency: form.frequency
    });

    handleClose();
  }

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Income Source"
      description="Income entries are stored in USD. Settings only changes displayed values."
    >
      <form className="modal-form" onSubmit={handleSubmit} noValidate>
        <label>
          Source name
          <input
            name="sourceName"
            value={form.sourceName}
            onChange={handleChange}
            placeholder="Salary, Freelance, Passive income..."
            aria-invalid={Boolean(errors.sourceName)}
          />
          {errors.sourceName ? <small className="field-error">{errors.sourceName}</small> : null}
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
        <label>
          Date
          <input name="date" type="date" value={form.date} onChange={handleChange} />
          <small className="muted">Leave blank to use today.</small>
        </label>
        <label>
          Frequency (optional)
          <select name="frequency" value={form.frequency} onChange={handleChange}>
            <option value="">None</option>
            {RECURRING_FREQUENCY_OPTIONS.map((frequency) => (
              <option key={frequency} value={frequency}>
                {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <div className="modal-actions">
          <button type="button" className="ghost-btn" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="primary-btn">
            Save Income Source
          </button>
        </div>
      </form>
    </ModalDialog>
  );
}

AddIncomeSourceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};
