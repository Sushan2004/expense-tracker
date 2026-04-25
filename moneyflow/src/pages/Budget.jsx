import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { fmtShort } from '../utils/helpers'
import styles from './Budget.module.css'

export default function Budget() {
  const { CATEGORIES, budgets, setBudgets, thisMonth } = useApp()
  const [editing, setEditing] = useState({})

  const beginEdit = (cat, limit) => {
    setEditing(e => ({ ...e, [cat]: limit ? String(limit) : '' }))
  }

  const cancelEdit = (cat) => {
    setEditing(e => {
      const next = { ...e }
      delete next[cat]
      return next
    })
  }

  const clearBudget = (cat) => {
    setBudgets(b => {
      const next = { ...b }
      delete next[cat]
      return next
    })
    cancelEdit(cat)
  }

  const save = (cat) => {
    const value = editing[cat]
    const v = parseFloat(value)

    if (!isNaN(v) && v > 0) {
      setBudgets(b => ({ ...b, [cat]: v }))
      cancelEdit(cat)
      return
    }

    if (value === '' || v === 0) {
      clearBudget(cat)
    }
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Budget</h1>
      <p className={styles.sub}>Set monthly limits per category. Progress updates in real time.</p>

      <div className={styles.grid}>
        {CATEGORIES.map(cat => {
          const spent = thisMonth.filter(ex => ex.category === cat.name).reduce((s, ex) => s + parseFloat(ex.amount), 0)
          const limit = budgets[cat.name]
          const pct = limit ? Math.min(100, (spent / limit) * 100) : 0
          const over = limit && spent > limit
          const isEditing = Object.prototype.hasOwnProperty.call(editing, cat.name)

          return (
            <div key={cat.name} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.tag} style={{ background: cat.bg, color: cat.text }}>{cat.name}</span>
                {over && <span className={styles.overBadge}>Over budget</span>}
              </div>

              {limit ? (
                <>
                  <div className={styles.amounts}>
                    <span>{fmtShort(spent)} spent</span>
                    <span className={styles.limit}>of {fmtShort(limit)}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${pct}%`, background: over ? 'var(--accent-red)' : cat.color }} />
                  </div>
                </>
              ) : (
                <p className={styles.noLimit}>No limit set</p>
              )}

              {isEditing ? (
                <div className={styles.editPanel}>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="10"
                    placeholder="Enter limit"
                    value={editing[cat.name]}
                    onChange={ev => setEditing(e => ({ ...e, [cat.name]: ev.target.value }))}
                  />
                  <div className={styles.buttonRow}>
                    <button className={styles.saveBtn} onClick={() => save(cat.name)}>Save</button>
                    <button className={styles.secondaryBtn} onClick={() => cancelEdit(cat.name)}>Cancel</button>
                    {limit && <button className={styles.clearBtn} onClick={() => clearBudget(cat.name)}>Clear</button>}
                  </div>
                </div>
              ) : (
                <button className={styles.editBtn} onClick={() => beginEdit(cat.name, limit)}>
                  {limit ? 'Edit budget' : 'Set budget'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
