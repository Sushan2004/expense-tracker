export const fmt = (n) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmtShort = (n) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

export const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export const exportCSV = (expenses) => {
  const rows = [
    ['Date', 'Category', 'Amount', 'Currency', 'USD Amount', 'Note'],
    ...expenses.map(ex => [ex.date, ex.category, ex.amount, ex.currency || 'USD', ex.baseAmount ?? ex.amount, ex.note || '']),
  ]
  const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'moneyflow-expenses.csv'; a.click()
  URL.revokeObjectURL(url)
}


export const exportFinancePDF = ({ user, income, totalExpenses, balance, savingsRate, budgetAlerts, savingsGoals }) => {
  const rows = savingsGoals.map(goal => `
    <tr><td>${goal.name}</td><td>$${Number(goal.saved || 0).toFixed(2)}</td><td>$${Number(goal.target || 0).toFixed(2)}</td></tr>
  `).join('') || '<tr><td colspan="3">No savings goals yet.</td></tr>'
  const alerts = budgetAlerts.map(alert => `<li>${alert.name}: ${alert.percent}% of budget used</li>`).join('') || '<li>No active budget alerts.</li>'
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`
    <html><head><title>MoneyFlow Report</title><style>
      body{font-family:Arial,sans-serif;padding:32px;color:#111827} h1{margin-bottom:4px} .muted{color:#6b7280}
      .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:24px 0}.card{border:1px solid #d1d5db;padding:16px;border-radius:8px}
      strong{display:block;font-size:24px;margin-top:8px} table{width:100%;border-collapse:collapse;margin-top:12px} td,th{border:1px solid #d1d5db;padding:10px;text-align:left}
    </style></head><body>
      <h1>MoneyFlow Report</h1><p class="muted">${user.name} ${new Date().toLocaleDateString()}</p>
      <div class="grid"><div class="card">Income (USD)<strong>$${Number(income.amount || 0).toFixed(2)}</strong></div><div class="card">Expenses (USD)<strong>$${Number(totalExpenses || 0).toFixed(2)}</strong></div><div class="card">Balance (USD)<strong>$${Number(balance || 0).toFixed(2)}</strong></div><div class="card">Savings rate<strong>${savingsRate}%</strong></div></div>
      <h2>Budget alerts</h2><ul>${alerts}</ul><h2>Savings goals</h2><table><thead><tr><th>Goal</th><th>Saved</th><th>Target</th></tr></thead><tbody>${rows}</tbody></table>
      <script>window.print()</script>
    </body></html>
  `)
  win.document.close()
}
