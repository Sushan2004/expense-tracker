import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { fmt, fmtShort, exportCSV } from '../utils/helpers'
import styles from './Transactions.module.css'

const EMPTY_FORM = { amount: '', currency: 'USD', category: 'Food', date: '', note: '' }
const TYPES = [
  { key: 'expenses', label: 'Expenses' },
  { key: 'income', label: 'Income' },
  { key: 'savings', label: 'Savings' },
]

export default function Transactions() {
  const {
    expenses,
    addExpense,
    deleteExpense,
    CATEGORIES,
    CURRENCIES,
    formatOriginalMoney,
    today,
    incomeEntries,
    deleteIncomeEntry,
    thisMonthIncome,
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
  } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeType = TYPES.some(type => type.key === searchParams.get('type'))
    ? searchParams.get('type')
    : 'expenses'
  const [form, setForm] = useState({ ...EMPTY_FORM, date: today() })
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setType = (type) => setSearchParams({ type })

  const submit = () => {
    const amt = parseFloat(form.amount)
    if (!form.amount || isNaN(amt) || amt <= 0) { setError('Enter a valid amount.'); return }
    setError('')
    addExpense(form)
    setForm({ ...EMPTY_FORM, date: today() })
  }

  const filtered = filter === 'All' ? expenses : expenses.filter(ex => ex.category === filter)
  const cat = (name) => CATEGORIES.find(c => c.name === name) || CATEGORIES[6]

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Transactions</h1>
        {activeType === 'expenses' && (
          <button className={styles.exportBtn} onClick={() => exportCSV(expenses)}>Export CSV</button>
        )}
      </div>

      <div className={styles.typeTabs}>
        {TYPES.map(type => (
          <button
            key={type.key}
            className={`${styles.typeTab} ${activeType === type.key ? styles.typeTabActive : ''}`}
            onClick={() => setType(type.key)}
          >
            {type.label}
          </button>
        ))}
      </div>

      {activeType === 'expenses' && (
        <>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Add expense</p>
            <div className={styles.formRow}>
              <input
                className={styles.input} type="number" placeholder="Amount" min="0" step="0.01"
                value={form.amount} onChange={ev => set('amount', ev.target.value)}
              />
              <select className={styles.input} value={form.currency} onChange={ev => set('currency', ev.target.value)}>
                {CURRENCIES.map(currency => <option key={currency.code} value={currency.code}>{currency.code}</option>)}
              </select>
              <select className={styles.input} value={form.category} onChange={ev => set('category', ev.target.value)}>
                {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
              </select>
              <input
                className={styles.input} type="date"
                value={form.date} onChange={ev => set('date', ev.target.value)}
              />
              <input
                className={styles.input} placeholder="Note (optional)"
                value={form.note} onChange={ev => set('note', ev.target.value)}
              />
              <button className={styles.addBtn} onClick={submit}>+ Add</button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.filters}>
            {['All', ...CATEGORIES.map(c => c.name)].map(f => (
              <button key={f} className={`${styles.pill} ${filter === f ? styles.pillActive : ''}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0
            ? <p className={styles.empty}>No expenses found.</p>
            : (
              <div className={styles.list}>
                {filtered.map(ex => {
                  const c = cat(ex.category)
                  return (
                    <div key={ex.id} className={styles.row}>
                      <span className={styles.tag} style={{ background: c.bg, color: c.text }}>{ex.category}</span>
                      <span className={styles.note}>{ex.note || '-'}</span>
                      <span className={styles.date}>{ex.date}</span>
                      <span className={styles.amountExpense}>-{formatOriginalMoney(ex)}</span>
                      <button className={styles.del} onClick={() => deleteExpense(ex.id)}>x</button>
                    </div>
                  )
                })}
              </div>
            )
          }
        </>
      )}

      {activeType === 'income' && (
        incomeEntries.length === 0 ? <p className={styles.empty}>No income entries found.</p> : (
          <div className={styles.list}>
            {incomeEntries.map(entry => (
              <div key={entry.id} className={styles.row}>
                <span className={styles.tagIncome}>Income</span>
                <span className={styles.note}>{entry.source}{entry.note ? ` - ${entry.note}` : ''}</span>
                <span className={styles.date}>{entry.date}</span>
                <span className={styles.amountIncome}>+{formatOriginalMoney(entry)}</span>
                <button className={styles.del} onClick={() => deleteIncomeEntry(entry.id)}>x</button>
              </div>
            ))}
          </div>
        )
      )}

      {activeType === 'savings' && (
        <section className={styles.savingsGrid}>
          <div className={styles.savingsCard}>
            <p className={styles.cardLabel}>Income this month</p>
            <p className={styles.savingsValue}>{fmtShort(totalIncome)}</p>
            <p className={styles.savingsSub}>{thisMonthIncome.length} income entr{thisMonthIncome.length === 1 ? 'y' : 'ies'}</p>
          </div>
          <div className={styles.savingsCard}>
            <p className={styles.cardLabel}>Expenses this month</p>
            <p className={styles.savingsValue}>{fmtShort(totalExpenses)}</p>
            <p className={styles.savingsSub}>Tracked expense history</p>
          </div>
          <div className={styles.savingsCard}>
            <p className={styles.cardLabel}>Saved this month</p>
            <p className={balance >= 0 ? styles.savingsPositive : styles.savingsNegative}>{fmtShort(balance)}</p>
            <p className={styles.savingsSub}>{savingsRate}% savings rate</p>
          </div>
        </section>
      )}
    </main>
  )
}
