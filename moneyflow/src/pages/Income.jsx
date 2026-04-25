import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { fmt, fmtShort } from '../utils/helpers'
import styles from './Income.module.css'

const EMPTY_FORM = { amount: '', currency: 'USD', source: '', date: '', note: '' }

export default function Income() {
  const {
    income,
    incomeEntries,
    thisMonthIncome,
    totalIncome,
    addIncomeEntry,
    deleteIncomeEntry,
    CURRENCIES,
    formatOriginalMoney,
    today,
  } = useApp()
  const [form, setForm] = useState({ ...EMPTY_FORM, date: today() })
  const [error, setError] = useState('')

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const submit = (ev) => {
    ev.preventDefault()
    const amount = parseFloat(form.amount)

    if (!form.amount || isNaN(amount) || amount <= 0) {
      setError('Enter a valid income amount.')
      return
    }

    if (!form.source.trim()) {
      setError('Enter where this income came from.')
      return
    }

    addIncomeEntry({
      amount,
      currency: form.currency,
      source: form.source.trim(),
      date: form.date || today(),
      note: form.note.trim(),
    })
    setForm({ ...EMPTY_FORM, date: today() })
    setError('')
  }

  const latestIncome = incomeEntries[0]

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Income</h1>
        <p className={styles.sub}>Add income entries and review your income history.</p>
      </div>

      <section className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <p className={styles.cardLabel}>This month</p>
          <p className={styles.cardValue}>{fmtShort(totalIncome || income.amount)}</p>
          <p className={styles.cardSub}>{thisMonthIncome.length || 'Saved'} income source{thisMonthIncome.length === 1 ? '' : 's'}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.cardLabel}>Latest income</p>
          <p className={styles.cardValue}>{latestIncome ? formatOriginalMoney(latestIncome) : '$0'}</p>
          <p className={styles.cardSub}>{latestIncome ? latestIncome.source : 'No income added yet'}</p>
        </div>
      </section>

      <section className={styles.card}>
        <p className={styles.sectionTitle}>Add income</p>
        <form className={styles.form} onSubmit={submit}>
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount"
            value={form.amount}
            onChange={ev => set('amount', ev.target.value)}
          />
          <select className={styles.input} value={form.currency} onChange={ev => set('currency', ev.target.value)}>
            {CURRENCIES.map(currency => <option key={currency.code} value={currency.code}>{currency.code} - {currency.label}</option>)}
          </select>
          <input
            className={styles.input}
            placeholder="Source, e.g. Salary"
            value={form.source}
            onChange={ev => set('source', ev.target.value)}
          />
          <input
            className={styles.input}
            type="date"
            value={form.date}
            onChange={ev => set('date', ev.target.value)}
          />
          <input
            className={styles.input}
            placeholder="Note (optional)"
            value={form.note}
            onChange={ev => set('note', ev.target.value)}
          />
          <button className={styles.saveBtn} type="submit">Add income</button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </section>

      <section className={styles.historySection}>
        <h2 className={styles.sectionTitle}>Income history</h2>
        {incomeEntries.length === 0 ? (
          <p className={styles.empty}>No income entries yet.</p>
        ) : (
          <div className={styles.historyList}>
            {incomeEntries.map(entry => (
              <div key={entry.id} className={styles.historyRow}>
                <div>
                  <p className={styles.source}>{entry.source}</p>
                  {entry.note && <p className={styles.note}>{entry.note}</p>}
                </div>
                <div className={styles.rowRight}>
                  <p className={styles.amount}>{formatOriginalMoney(entry)}</p>
                  <p className={styles.date}>{entry.date}</p>
                </div>
                <button className={styles.deleteBtn} onClick={() => deleteIncomeEntry(entry.id)}>x</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
